<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Model\Job;

use Nosto\Scheduler\Entity\Job\JobEntity;
use Nosto\Scheduler\Model\MessageManager;

readonly class JobFailureHandler
{
    public function __construct(
        private JobHelper $jobHelper,
        private MessageManager $messageManager
    ) {
    }

    public function fail(string $jobId, string $reason): bool
    {
        $job = $this->jobHelper->getJob($jobId);
        if ($job === null || in_array($job->getStatus(), [JobEntity::TYPE_FAILED, JobEntity::TYPE_SUCCEED], true)) {
            return false;
        }

        $this->jobHelper->markJob($jobId, JobEntity::TYPE_FAILED);
        $this->messageManager->addErrorMessage($jobId, $reason);

        $parentJobId = $job->getParentId();
        if ($parentJobId !== null
            && $this->jobHelper->isGeneratedJobReadyToFinalize($parentJobId, JobRunner::NOT_FINISHED_STATUSES)
        ) {
            $this->jobHelper->markJob($parentJobId, JobEntity::TYPE_FAILED);
            $this->messageManager->addErrorMessage($parentJobId, 'Some child jobs have failed to process.');
        }

        return true;
    }
}
