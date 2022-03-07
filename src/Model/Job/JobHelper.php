<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job;

use Od\Scheduler\Entity\Job\JobEntity;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;

class JobHelper
{
    private EntityRepositoryInterface $jobRepository;

    public function __construct(EntityRepositoryInterface $jobRepository)
    {
        $this->jobRepository = $jobRepository;
    }

    public function deleteJob(string $jobId)
    {
        $this->jobRepository->delete(
            [['id' => $jobId]],
            Context::createDefaultContext()
        );
    }

    public function markJob($jobIds, string $status)
    {
        if (is_string($jobIds)) {
            $jobIds = explode(' ', $jobIds);
        };

        $this->markJobs($jobIds, $status);
    }

    public function markJobs(array $jobIds, string $status)
    {
        $jobDataResult = [];
        foreach ($jobIds as $jobId) {
            $jobData = [
                'id' => $jobId,
                'status' => $status,
            ];

            if ($status === JobEntity::TYPE_PENDING) {
                $jobData['startedAt'] = null;
                $jobData['finishedAt'] = null;
            } else {
                $timeKey = $status === JobEntity::TYPE_RUNNING ? 'startedAt' : 'finishedAt';
                $jobData[$timeKey] = new \DateTime('now', new \DateTimeZone('UTC'));
            }
            $jobDataResult[] = $jobData;
        }
        $this->jobRepository->update(
            $jobDataResult,
            Context::createDefaultContext()
        );
    }
}
