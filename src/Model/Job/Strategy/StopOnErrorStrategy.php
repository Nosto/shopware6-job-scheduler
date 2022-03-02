<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

use Od\Scheduler\Async\{JobMessageInterface, ParentAwareMessageInterface};
use Od\Scheduler\Entity\Job\JobEntity;
use Od\Scheduler\Model\Job\JobResult;
use Od\Scheduler\Model\Job\Message\ErrorMessage;

class StopOnErrorStrategy extends AbstractStrategy
{
    public const STRATEGY_CODE = 'stop_on_error_strategy';

    public function applyStrategy(JobMessageInterface $message): JobResult
    {
        try {
            $this->jobHelper->markJob($message->getJobId(), JobEntity::TYPE_RUNNING);
            $result = $this->innerHandler->execute($message);
            $this->onOperationSuccess($message);
        } catch (\Throwable $e) {
            $result = new JobResult([new ErrorMessage($e->getMessage())]);
            $this->onOperationError($message);
        }

        return $result;
    }

    protected function onOperationError(JobMessageInterface $message)
    {
        if ($message instanceof ParentAwareMessageInterface) {
            $rootJobId = $message->getParentJobId();
            $jobTree = $this->jobTreeProvider->get($rootJobId, self::NOT_FINISHED_STATUSES);
            if ($jobTree->getIterator()->count()) {
                $this->jobHelper->markJobs((array)$jobTree, JobEntity::TYPE_SUSPENDED);
            }
            $this->jobHelper->markJob($rootJobId, JobEntity::TYPE_SUSPENDED);
            $this->messageManager->addErrorMessage($rootJobId, 'Some child jobs has been suspended.');
        }
        $this->jobHelper->markJob($message->getJobId(), JobEntity::TYPE_FAILED);
    }
}