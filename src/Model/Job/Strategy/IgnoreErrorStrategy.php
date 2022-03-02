<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

use Od\Scheduler\Async\{JobMessageInterface, ParentAwareMessageInterface};
use Od\Scheduler\Entity\Job\JobEntity;
use Od\Scheduler\Model\Job\{JobHelper, JobResult, JobTreeProvider, Message\ErrorMessage};
use Od\Scheduler\Model\MessageManager;

class IgnoreErrorStrategy extends AbstractStrategy
{
    public const STRATEGY_CODE = 'ignore_error_strategy';

    protected MessageManager $messageManager;
    protected JobHelper $jobHelper;
    protected JobTreeProvider $jobTreeProvider;

    public function __construct(
        MessageManager $messageManager,
        JobHelper $jobHelper,
        JobTreeProvider $jobTreeProvider
    ) {
        parent::__construct($jobHelper, $jobTreeProvider, $messageManager);
    }

    public function applyStrategy(JobMessageInterface $message): JobResult
    {
        try {
            $this->jobHelper->markJob($message->getJobId(), JobEntity::TYPE_RUNNING);
            $result = $this->innerHandler->execute($message);
            $this->onOperationSuccess($message);
        } catch (\Throwable $e) {
            $result = new JobResult([new ErrorMessage($e->getMessage())]);
            $this->onOperationError($message);
        } finally {
            $this->onOperationFinish($message);
        }

        return $result;
    }

    private function onOperationFinish(JobMessageInterface $message)
    {
        if ($message instanceof ParentAwareMessageInterface) {
            $rootJobId = $message->getParentJobId();
            $jobTree = $this->jobTreeProvider->get($rootJobId, self::NOT_FINISHED_STATUSES);

            if ($jobTree->getIterator()->count() === 0) {
                $jobTreeWithFailedChildren = $this->jobTreeProvider->get($rootJobId, [JobEntity::TYPE_FAILED]);
                $hasFailedChild = $jobTreeWithFailedChildren->getIterator()->count() === 0;
                if ($hasFailedChild) {
                    $this->jobHelper->markJob($rootJobId, JobEntity::TYPE_FAILED);
                    $this->messageManager->addErrorMessage($rootJobId, 'Some child jobs has been failed.');
                } else {
                    $this->jobHelper->markJob($rootJobId, JobEntity::TYPE_SUCCEED);
                }
            }
        }
    }
}