<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

use Od\Scheduler\Async\ParentAwareMessageInterface;
use Od\Scheduler\Entity\Job\JobEntity;
use Od\Scheduler\Model\Job\{JobHelper, JobTreeProvider};
use Od\Scheduler\Model\MessageManager;

class IgnoreErrorStrategy extends AbstractStrategy
{
    public const STRATEGY_CODE = 'ignore_error_strategy';
    const NOT_FINISHED_STATUSES = [
        JobEntity::TYPE_PENDING,
        JobEntity::TYPE_RUNNING
    ];

    private MessageManager $messageManager;
    private JobHelper $jobHelper;
    private JobTreeProvider $jobTreeProvider;

    public function __construct(
        MessageManager $messageManager,
        JobHelper $jobHelper,
        JobTreeProvider $jobTreeProvider
    ) {
        parent::__construct($jobHelper, $messageManager);
        $this->messageManager = $messageManager;
        $this->jobHelper = $jobHelper;
        $this->jobTreeProvider = $jobTreeProvider;
    }

    public function applyStrategy(object $message)
    {
        if ($message instanceof ParentAwareMessageInterface) {
            $parentJobId = $message->getParentJobId();
            $jobTree = $this->jobTreeProvider->get($parentJobId);
            $childJobs = $jobTree->getChildJobs();

            if (!array_search(self::NOT_FINISHED_STATUSES, $childJobs)
            ) {
                $hasFailedChild = false;
                foreach ($childJobs as $childJob) {
                    if ($hasFailedChild = $childJob->getStatus() === JobEntity::TYPE_FAILED) {
                        $this->jobHelper->markJob(
                            $parentJobId,
                            JobEntity::TYPE_FAILED
                        );
                        $this->messageManager->addErrorMessage($parentJobId, 'Some child jobs has been failed.');
                    }
                    if ($hasFailedChild) {
                        break;
                    }
                }

                if (!$hasFailedChild) {
                    $this->jobHelper->markJob(
                        $parentJobId,
                        JobEntity::TYPE_SUCCEED
                    );
                }
            }
        }
    }
}