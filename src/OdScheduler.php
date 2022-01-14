<?php declare(strict_types=1);

namespace Od\Scheduler;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Plugin;
use Shopware\Core\Framework\Plugin\Context\UninstallContext;

class OdScheduler extends Plugin
{
    public function uninstall(UninstallContext $uninstallContext): void
    {
        if ($uninstallContext->keepUserData()) {
            return;
        }

        /** @var Connection $connection */
        $connection = $this->container->get(Connection::class);
        $connection->executeStatement('DROP TABLE IF EXISTS `od_scheduler_job_message`');
        $connection->executeStatement('DROP TABLE IF EXISTS `od_scheduler_job`');
    }
}