<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job;

use Od\Scheduler\Async\JobMessageInterface;
use Od\Scheduler\Entity\Job\JobEntity;

class JobRunner
{
    private HandlerPool $handlerPool;
    private JobHelper $jobHelper;

    public function __construct(
        HandlerPool $handlerPool,
        JobHelper $jobHelper
    ) {
        $this->handlerPool = $handlerPool;
        $this->jobHelper = $jobHelper;
    }

    public function execute(JobMessageInterface $message): JobResult
    {
        $handler = $this->handlerPool->get($message->getHandlerCode());
        $this->jobHelper->markJob($message->getJobId(), JobEntity::TYPE_RUNNING);

        $result = $handler->execute($message);

        if ($handler instanceof GeneratingHandlerInterface) {
            return $result;
        }

        if ($result->hasErrors()) {

        } else {

        }

        return $result;
    }
}
