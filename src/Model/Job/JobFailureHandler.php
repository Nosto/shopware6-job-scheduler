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

    public function fail(string $jobId, string $reason): void
    {
        $job = $this->jobHelper->getJob($jobId);
        if ($job === null) {
            return;
        }

        $this->jobHelper->markJob($jobId, JobEntity::TYPE_FAILED);
        $this->messageManager->addErrorMessage($jobId, $reason);

        $parentJobId = $job->getParentId();
        if ($parentJobId === null
            || !$this->jobHelper->isGeneratedJobReadyToFinalize($parentJobId, JobRunner::NOT_FINISHED_STATUSES)
        ) {
            return;
        }

        $this->jobHelper->markJob($parentJobId, JobEntity::TYPE_FAILED);
        $this->messageManager->addErrorMessage($parentJobId, 'Some child jobs have failed to process.');
    }
}
