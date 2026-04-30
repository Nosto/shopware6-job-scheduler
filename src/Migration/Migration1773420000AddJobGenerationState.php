<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Migration;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1773420000AddJobGenerationState extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1773420000;
    }

    /**
     * @throws Exception
     */
    public function update(Connection $connection): void
    {
        if (!$connection->createSchemaManager()->tableExists('nosto_scheduler_job')) {
            return;
        }

        $this->addColumn($connection, 'nosto_scheduler_job', 'expected_child_count', 'INT UNSIGNED', false, '0');
        $this->addColumn($connection, 'nosto_scheduler_job', 'child_generation_completed', 'TINYINT(1)', false, '0');
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
