<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job;

use Od\Scheduler\Async\JobMessageInterface;
use Od\Scheduler\Model\Job\Strategy\StrategyResolver;

class JobRunner
{
    private StrategyResolver $strategyResolver;
    private HandlerPool $handlerPool;

    public function __construct(
        StrategyResolver $strategyResolver,
        HandlerPool $handlerPool
    ) {
        $this->strategyResolver = $strategyResolver;
        $this->handlerPool = $handlerPool;
    }

    public function execute(JobMessageInterface $message): JobResult
    {
        $handler = $this->handlerPool->get($message->getHandlerCode());
        $strategy = $this->strategyResolver->getStrategy();
        $strategy = $strategy->withHandler($handler);

        return $strategy->execute($message);
    }
}
