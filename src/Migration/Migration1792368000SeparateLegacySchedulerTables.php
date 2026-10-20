<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1792368000SeparateLegacySchedulerTables extends MigrationStep
{
    private const LEGACY_SCHEDULER_MIGRATION = 'Klaviyo\\Integration\\Migration\\Migration1641974495';

    private const NOSTO_RENAME_MIGRATION = 'Nosto\\Scheduler\\Migration\\Migration1697197869UpdateNaming';

    public function getCreationTimestamp(): int
    {
        return 1792368000;
    }

    /**
     * @throws \Doctrine\DBAL\Exception
     */
    public function update(Connection $connection): void
    {
        $renamedAt = $this->getNostoRenameExecutionTime($connection);

        if (!$this->legacyTablesAreRequired($connection, $renamedAt)) {
            return;
        }

        (new Migration1641974495())->update($connection);

        if ($renamedAt === null) {
            return;
        }

        $this->moveHistoricalExternalJobs($connection, $renamedAt);
    }

    /**
     * @throws \Doctrine\DBAL\Exception
     */
    private function legacyTablesAreRequired(Connection $connection, ?string $renamedAt): bool
    {
        $schemaManager = $connection->createSchemaManager();
        if (
            $schemaManager->tableExists('od_scheduler_job')
            || $schemaManager->tableExists('od_scheduler_job_message')
        ) {
            return true;
        }

        if ($this->legacySchedulerMigrationWasExecuted($connection)) {
            return true;
        }

        if ($renamedAt !== null && $this->historicalExternalJobExists($connection, $renamedAt)) {
            return true;
        }

        return false;
    }

    /**
     * @throws \Doctrine\DBAL\Exception
     */
    private function legacySchedulerMigrationWasExecuted(Connection $connection): bool
    {
        if (!$connection->createSchemaManager()->tableExists('migration')) {
            return false;
        }

        $executed = $connection->fetchOne(
            'SELECT 1 FROM `migration` WHERE `class` = :class AND `update` IS NOT NULL LIMIT 1',
            [
                'class' => self::LEGACY_SCHEDULER_MIGRATION,
            ],
        );
        return $executed !== false;
    }

    /**
     * @throws \Doctrine\DBAL\Exception
     */
    private function getNostoRenameExecutionTime(Connection $connection): ?string
    {
        if (!$connection->createSchemaManager()->tableExists('migration')) {
            return null;
        }

        $executedAt = $connection->fetchOne(
            'SELECT `update` FROM `migration` WHERE `class` = :class AND `update` IS NOT NULL LIMIT 1',
            [
                'class' => self::NOSTO_RENAME_MIGRATION,
            ],
        );

        return \is_string($executedAt) ? $executedAt : null;
    }

    /**
     * @throws \Doctrine\DBAL\Exception
     */
    private function historicalExternalJobExists(Connection $connection, string $renamedAt): bool
    {
        $ownershipCondition = $this->nonNostoJobTypeCondition('job');

        return $connection->fetchOne(
            <<<SQL
                SELECT 1
                FROM `nosto_scheduler_job` AS `job`
                WHERE {$ownershipCondition}
                  AND `job`.`created_at` <= :renamedAt
                LIMIT 1
            SQL,
            [
                'renamedAt' => $renamedAt,
            ],
        ) !== false;
    }

    /**
     * @throws \Doctrine\DBAL\Exception
     */
    private function moveHistoricalExternalJobs(Connection $connection, string $renamedAt): void
    {
        $this->copyHistoricalExternalJobs($connection, $renamedAt);
        $this->copyHistoricalExternalMessages($connection, $renamedAt);
        $this->deleteCopiedHistoricalExternalJobs($connection, $renamedAt);
    }

    /**
     * @throws \Doctrine\DBAL\Exception
     */
    private function copyHistoricalExternalJobs(Connection $connection, string $renamedAt): void
    {
        $ownershipCondition = $this->nonNostoJobTypeCondition('job');

        do {
            $insertedRows = $connection->executeStatement(
                <<<SQL
                    INSERT IGNORE INTO `od_scheduler_job` (
                        `id`, `parent_id`, `status`, `type`, `name`, `message`, `started_at`, `finished_at`,
                        `created_at`, `updated_at`
                    )
                    SELECT
                        `job`.`id`, `job`.`parent_id`, `job`.`status`, `job`.`type`, `job`.`name`, `job`.`message`,
                        `job`.`started_at`, `job`.`finished_at`, `job`.`created_at`, `job`.`updated_at`
                    FROM `nosto_scheduler_job` AS `job`
                    WHERE {$ownershipCondition}
                      AND `job`.`created_at` <= :renamedAt
                      AND (
                          `job`.`parent_id` IS NULL
                          OR EXISTS (
                              SELECT 1
                              FROM `od_scheduler_job` AS `destination_parent`
                              WHERE `destination_parent`.`id` = `job`.`parent_id`
                          )
                      )
                SQL,
                [
                    'renamedAt' => $renamedAt,
                ],
            );
        } while ($insertedRows > 0);
    }

    /**
     * @throws \Doctrine\DBAL\Exception
     */
    private function copyHistoricalExternalMessages(Connection $connection, string $renamedAt): void
    {
        $ownershipCondition = $this->nonNostoJobTypeCondition('source_job');

        $connection->executeStatement(
            <<<SQL
                INSERT IGNORE INTO `od_scheduler_job_message` (
                    `id`, `job_id`, `type`, `message`, `created_at`, `updated_at`
                )
                SELECT
                    `source_message`.`id`, `source_message`.`job_id`, `source_message`.`type`,
                    `source_message`.`message`, `source_message`.`created_at`, `source_message`.`updated_at`
                FROM `nosto_scheduler_job_message` AS `source_message`
                INNER JOIN `nosto_scheduler_job` AS `source_job`
                    ON `source_job`.`id` = `source_message`.`job_id`
                INNER JOIN `od_scheduler_job` AS `destination_job`
                    ON `destination_job`.`id` = `source_job`.`id`
                WHERE {$ownershipCondition}
                  AND `source_job`.`created_at` <= :renamedAt
            SQL,
            [
                'renamedAt' => $renamedAt,
            ],
        );
    }

    /**
     * @throws \Doctrine\DBAL\Exception
     */
    private function deleteCopiedHistoricalExternalJobs(Connection $connection, string $renamedAt): void
    {
        $ownershipCondition = $this->nonNostoJobTypeCondition('source_job');

        do {
            $deletedRows = $connection->executeStatement(
                <<<SQL
                    DELETE `source_job`
                    FROM `nosto_scheduler_job` AS `source_job`
                    INNER JOIN `od_scheduler_job` AS `destination_job`
                        ON `destination_job`.`id` = `source_job`.`id`
                    LEFT JOIN `nosto_scheduler_job` AS `child`
                        ON `child`.`parent_id` = `source_job`.`id`
                    WHERE {$ownershipCondition}
                      AND `source_job`.`created_at` <= :renamedAt
                      AND `child`.`id` IS NULL
                      AND NOT EXISTS (
                          SELECT 1
                          FROM `nosto_scheduler_job_message` AS `source_message`
                          LEFT JOIN `od_scheduler_job_message` AS `destination_message`
                              ON `destination_message`.`id` = `source_message`.`id`
                          WHERE `source_message`.`job_id` = `source_job`.`id`
                            AND `destination_message`.`id` IS NULL
                      )
                SQL,
                [
                    'renamedAt' => $renamedAt,
                ],
            );
        } while ($deletedRows > 0);
    }

    private function nonNostoJobTypeCondition(string $alias): string
    {
        return \sprintf(
            "NOT (`%s`.`type` LIKE 'nosto-integration%%' OR `%s`.`type` LIKE 'od-nosto%%')",
            $alias,
            $alias,
        );
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
