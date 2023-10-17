<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1697197869UpdateNaming extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1697197869;
    }

    public function update(Connection $connection): void
    {
        $this->renameTables($connection);
        $this->renameIndexes($connection);
        $this->renameForeignKeys($connection);
    }

    private function renameTables(Connection $connection): void
    {
        $sql = <<<SQL
            ALTER TABLE `od_scheduler_job` RENAME TO `nosto_scheduler_job`;
            ALTER TABLE `od_scheduler_job_message` RENAME TO `nosto_scheduler_job_message`;
        SQL;
        $connection->executeStatement($sql);
    }

    private function renameIndexes(Connection $connection): void
    {
        $sql = <<<SQL
            ALTER TABLE `nosto_scheduler_job` DROP INDEX `osj_parent_id_idx`, ADD INDEX `nosto_job_parent_id_idx` (`parent_id`);
            ALTER TABLE `nosto_scheduler_job` DROP INDEX `osj_parent_status_idx`, ADD INDEX `nosto_job_parent_status_idx` (`status`);
            ALTER TABLE `nosto_scheduler_job` DROP INDEX `osj_parent_type_idx`, ADD INDEX `nosto_job_parent_type_idx` (`type`);
            ALTER TABLE `nosto_scheduler_job_message` DROP INDEX `osjm_job_id_type_idx`, ADD INDEX `nosto_jm_job_id_type_idx` (`job_id`, `type`);
            ALTER TABLE `nosto_scheduler_job_message` DROP INDEX `osjm_created_at_idx`, ADD INDEX `nosto_jm_created_at_idx` (`created_at`);
        SQL;
        $connection->executeStatement($sql);
    }

    private function renameForeignKeys(Connection $connection): void
    {
        $sql = <<<SQL
            ALTER TABLE `nosto_scheduler_job` DROP FOREIGN KEY `fk.od_scheduler_job.parent_id.job_id`;
            ALTER TABLE `nosto_scheduler_job` ADD CONSTRAINT `fk.nosto_scheduler_job.parent_id.job_id` FOREIGN KEY (`parent_id`) REFERENCES `nosto_scheduler_job` (`id`) ON DELETE CASCADE;
            ALTER TABLE `nosto_scheduler_job_message` DROP FOREIGN KEY `fk.od_scheduler_job_message.job_id`;
            ALTER TABLE `nosto_scheduler_job_message` ADD CONSTRAINT `fk.nosto_scheduler_job_message.job_id` FOREIGN KEY (`job_id`) REFERENCES `nosto_scheduler_job` (`id`) ON DELETE CASCADE;
        SQL;
        $connection->executeStatement($sql);
    }

    public function updateDestructive(Connection $connection): void
    {
        // implement update destructive
    }
}
