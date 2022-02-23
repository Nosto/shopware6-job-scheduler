<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

use Od\Scheduler\Async\ParentAwareMessageInterface;
use Od\Scheduler\Entity\Job\JobEntity;
use Od\Scheduler\Model\Job\{GeneratingHandlerInterface, JobHelper, JobResult};
use Od\Scheduler\Model\MessageManager;

class IgnoreErrorStrategy extends AbstractStrategy
{
    public const STRATEGY_CODE = 'ignore_error_strategy';
    const NOT_FINISHED_STATUSES = [
        JobEntity::TYPE_PENDING,
        JobEntity::TYPE_RUNNING
    ];

    private $innerHandler = null;
    private MessageManager $messageManager;
    private JobHelper $jobHelper;

    public function __construct(MessageManager $messageManager, JobHelper $jobHelper)
    {
        parent::__construct($jobHelper, $messageManager);
        $this->messageManager = $messageManager;
        $this->jobHelper = $jobHelper;
    }

    public function applyStrategy(object $message)
    {
//        $status = $result->hasErrors() ? JobEntity::TYPE_FAILED : JobEntity::TYPE_SUCCEED;

//        if ($this->innerHandler instanceof GeneratingHandlerInterface) {
//            if ($status === JobEntity::TYPE_FAILED) {
//                $this->jobHelper->markJob($message->getJobId(), $status);
//            } elseif ($this->jobHelper->getChildJobs($message->getJobId())->count() === 0) {
//                /**
//                 * Nothing was scheduled by generating job handler - delete job.
//                 */
//                $this->jobHelper->deleteJob($message->getJobId());
//            }
//
//            return $result;
//        }

//        $this->jobHelper->markJob($message->getJobId(), $status);

        if ($message instanceof ParentAwareMessageInterface) {
            $parentJobId = $message->getParentJobId();
            if ($this->jobHelper->getChildJobs($parentJobId, self::NOT_FINISHED_STATUSES)->count() === 0) {
                $hasFailedChild = $this->jobHelper->getChildJobs($parentJobId, [JobEntity::TYPE_FAILED])->count() !== 0;
                /**
                 * All current job's siblings was executed - mark parent job with proper status
                 * according to existence of failed child jobs.
                 */
                $this->jobHelper->markJob(
                    $parentJobId,
                    $hasFailedChild ? JobEntity::TYPE_FAILED : JobEntity::TYPE_SUCCEED
                );

                if ($hasFailedChild) {
                    $this->messageManager->addErrorMessage($parentJobId, 'Some child jobs has been failed.');
                }
            }
        }
    }
}