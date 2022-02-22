<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

use Od\Scheduler\Model\Job\JobHandlerInterface;

interface StrategyInterface extends JobHandlerInterface
{
    public function withHandler(JobHandlerInterface $handler): StrategyInterface;
}
