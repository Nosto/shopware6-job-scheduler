<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Migration;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception;
use Doctrine\DBAL\Schema\AbstractSchemaManager;
use Doctrine\DBAL\Schema\Exception\TableDoesNotExist;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1697197869UpdateNaming extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1697197869;
    }

    /**
     * @throws Exception
     */
    public function update(Connection $connection): void
    {
        $this->renameTables($connection);
        $this->renameIndexes($connection);
        $this->renameForeignKeys($connection);
    }

    /**
     * @throws Exception
     */
    private function renameTables(Connection $connection): void
    {
        $this->renameTableIfNeeded($connection, 'od_scheduler_job', 'nosto_scheduler_job');
        $this->renameTableIfNeeded($connection, 'od_scheduler_job_message', 'nosto_scheduler_job_message');
    }

    /**
     * @throws Exception
     */
    private function renameTableIfNeeded(Connection $connection, string $oldTable, string $newTable): void
    {
        if (!$this->tableExists($connection, $oldTable)) {
            return;
        }

        if ($this->tableExists($connection, $newTable)) {
            $connection->executeStatement(\sprintf('DROP TABLE IF EXISTS `%s`', $oldTable));

            return;
        }

        $connection->executeStatement(\sprintf('RENAME TABLE `%s` TO `%s`', $oldTable, $newTable));
    }

    /**
     * @throws Exception
     */
    private function renameIndexes(Connection $connection): void
    {
        $this->ensureIndex(
            $connection,
            'nosto_scheduler_job',
            'osj_parent_id_idx',
            'nosto_job_parent_id_idx',
            ['parent_id'],
        );
        $this->ensureIndex(
            $connection,
            'nosto_scheduler_job',
            'osj_parent_status_idx',
            'nosto_job_parent_status_idx',
            ['status'],
        );
        $this->ensureIndex(
            $connection,
            'nosto_scheduler_job',
            'osj_parent_type_idx',
            'nosto_job_parent_type_idx',
            ['type'],
        );
        $this->ensureIndex(
            $connection,
            'nosto_scheduler_job_message',
            'osjm_job_id_type_idx',
            'nosto_jm_job_id_type_idx',
            ['job_id', 'type'],
        );
        $this->ensureIndex(
            $connection,
            'nosto_scheduler_job_message',
            'osjm_created_at_idx',
            'nosto_jm_created_at_idx',
            ['created_at'],
        );
    }

    /**
     * @param list<string> $columns
     *
     * @throws Exception
     */
    private function ensureIndex(
        Connection $connection,
        string $table,
        string $oldIndex,
        string $newIndex,
        array $columns,
    ): void {
        if (!$this->tableExists($connection, $table)) {
            return;
        }

        $oldExists = $this->indexExists($connection, $table, $oldIndex);
        $newExists = $this->indexExists($connection, $table, $newIndex);

        if ($oldExists) {
            $sql = \sprintf('ALTER TABLE `%s` DROP INDEX `%s`', $table, $oldIndex);

            if (!$newExists) {
                $sql .= \sprintf(', ADD INDEX `%s` (%s)', $newIndex, $this->formatColumns($columns));
            }

            $connection->executeStatement($sql);

            return;
        }

        if ($newExists) {
            return;
        }

        $connection->executeStatement(
            \sprintf('ALTER TABLE `%s` ADD INDEX `%s` (%s)', $table, $newIndex, $this->formatColumns($columns)),
        );
    }

    /**
     * @throws Exception
     */
    private function renameForeignKeys(Connection $connection): void
    {
        $this->ensureForeignKey(
            $connection,
            'nosto_scheduler_job',
            'fk.od_scheduler_job.parent_id.job_id',
            'fk.nosto_scheduler_job.parent_id.job_id',
            'parent_id',
            'nosto_scheduler_job',
            ['id'],
        );
        $this->ensureForeignKey(
            $connection,
            'nosto_scheduler_job_message',
            'fk.od_scheduler_job_message.job_id',
            'fk.nosto_scheduler_job_message.job_id',
            'job_id',
            'nosto_scheduler_job',
            ['id'],
        );
    }

    /**
     * @param list<string> $referencedColumns
     *
     * @throws Exception
     */
    private function ensureForeignKey(
        Connection $connection,
        string $table,
        string $oldForeignKey,
        string $newForeignKey,
        string $localColumn,
        string $referencedTable,
        array $referencedColumns,
    ): void {
        if (!$this->tableExists($connection, $table)) {
            return;
        }

        $oldExists = $this->foreignKeyExists($connection, $table, $oldForeignKey);
        $newExists = $this->foreignKeyExists($connection, $table, $newForeignKey);

        if ($oldExists) {
            $sql = \sprintf('ALTER TABLE `%s` DROP FOREIGN KEY `%s`', $table, $oldForeignKey);

            if (!$newExists) {
                $sql .= \sprintf(
                    ', ADD CONSTRAINT `%s` FOREIGN KEY (`%s`) REFERENCES `%s` (%s) ON DELETE CASCADE',
                    $newForeignKey,
                    $localColumn,
                    $referencedTable,
                    $this->formatColumns($referencedColumns),
                );
            }

            $connection->executeStatement($sql);

            return;
        }

        if ($newExists) {
            return;
        }

        $connection->executeStatement(
            \sprintf(
                'ALTER TABLE `%s` ADD CONSTRAINT `%s` FOREIGN KEY (`%s`) REFERENCES `%s` (%s) ON DELETE CASCADE',
                $table,
                $newForeignKey,
                $localColumn,
                $referencedTable,
                $this->formatColumns($referencedColumns),
            ),
        );
    }

    /**
     * @throws Exception
     */
    private function tableExists(Connection $connection, string $table): bool
    {
        try {
            $connection->createSchemaManager()->introspectTableByUnquotedName($table);

            return true;
        } catch (TableDoesNotExist) {
            return false;
        }
    }

    /**
     * @throws Exception
     */
    private function indexExists(Connection $connection, string $table, string $index): bool
    {
        if (!$this->tableExists($connection, $table)) {
            return false;
        }

        return $connection->createSchemaManager()
            ->introspectTableByUnquotedName($table)
            ->hasIndex($index);
    }

    /**
     * @throws Exception
     */
    private function foreignKeyExists(Connection $connection, string $table, string $foreignKey): bool
    {
        if (!$this->tableExists($connection, $table)) {
            return false;
        }

        return $connection->createSchemaManager()
            ->introspectTableByUnquotedName($table)
            ->hasForeignKey($foreignKey);
    }

    /**
     * @param list<string> $columns
     */
    private function formatColumns(array $columns): string
    {
        return implode(', ', array_map(
            static fn (string $column): string => '`' . $column . '`',
            $columns,
        ));
    }

    public function updateDestructive(Connection $connection): void
    {
        // implement update destructive
    }
}
