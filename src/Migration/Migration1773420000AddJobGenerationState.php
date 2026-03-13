<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1773420000AddJobGenerationState extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1773420000;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement(
            'ALTER TABLE `nosto_scheduler_job`
                ADD COLUMN `expected_child_count` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `finished_at`,
                ADD COLUMN `child_generation_completed` TINYINT(1) NOT NULL DEFAULT 0 AFTER `expected_child_count`'
        );
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
