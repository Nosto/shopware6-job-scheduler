<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Model\Job;

use Nosto\Scheduler\Entity\Job\JobCollection;
use Nosto\Scheduler\Entity\Job\JobEntity;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsAnyFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;

readonly class JobHelper
{
    public function __construct(
        private EntityRepository $jobRepository
    ) {
    }

    public function deleteJob(string $jobId): void
    {
        $this->jobRepository->delete(
            [[
                'id' => $jobId,
            ]],
            Context::createDefaultContext()
        );
    }

    public function jobExists(string $jobId): bool
    {
        $criteria = new Criteria([$jobId]);
        return $this->jobRepository->searchIds($criteria, Context::createDefaultContext())->getTotal() > 0;
    }

    public function markJob(string $jobId, string $status): void
    {
        if (!$this->jobExists($jobId)) {
            return;
        }
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

        $this->jobRepository->update(
            [$jobData],
            Context::createDefaultContext()
        );
    }

    public function getChildJobs(string $parentJobId, array $statuses = []): JobCollection
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('parentId', $parentJobId));

        if (!empty($statuses)) {
            $criteria->addFilter(new EqualsAnyFilter('status', $statuses));
        }

        /** @var JobCollection $jobs */
        $jobs = $this->jobRepository->search($criteria, Context::createDefaultContext())->getEntities();

        return $jobs;
    }
}
