<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job;

use Od\Scheduler\Async\JobMessageInterface;
use Od\Scheduler\Async\ParentAwareMessageInterface;
use Od\Scheduler\Entity\Job\JobEntity;

class JobRunner
{
    const NOT_FINISHED_STATUSES = [
        JobEntity::TYPE_PENDING,
        JobEntity::TYPE_RUNNING
    ];

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
            $childJobCollection = $this->jobHelper->getChildJobs($message->getJobId());

            /**
             * Nothing was scheduled by operation - mark it with proper status.
             */
            if ($childJobCollection->count() === 0) {
                $status = $result->hasErrors() ? JobEntity::TYPE_FAILED : JobEntity::TYPE_SUCCEED;
                $this->jobHelper->markJob($message->getJobId(), $status);
            }

            return $result;
        }

        $status = $result->hasErrors() ? JobEntity::TYPE_FAILED : JobEntity::TYPE_SUCCEED;
        $this->jobHelper->markJob($message->getJobId(), $status);

        if ($message instanceof ParentAwareMessageInterface) {
            $parentJobId = $message->getParentJobId();
            $childJobCollection = $this->jobHelper->getChildJobs($parentJobId, self::NOT_FINISHED_STATUSES);

            /**
             * No pending jobs found - mark parent job as succeed.
             */
            if ($childJobCollection->count() === 0) {
                $this->jobHelper->markJob($parentJobId, JobEntity::TYPE_SUCCEED);
            }
        }

        return $result;
    }
}
