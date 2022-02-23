<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

use Od\Scheduler\Model\Job\JobHandlerInterface;
use Od\Scheduler\Model\Job\JobResult;

class StopOnErrorStrategy extends AbstractStrategy
{
    public const STRATEGY_CODE = 'stop_on_error_strategy';

    public function execute(object $message): JobResult
    {
        // TODO: Implement execute() method.
    }

    public function withHandler(JobHandlerInterface $handler): StrategyInterface
    {
        // TODO: Implement withHandler() method.
    }

    public function applyStrategy(object $message)
    {
        // TODO: Implement applyStrategy() method.
    }
}