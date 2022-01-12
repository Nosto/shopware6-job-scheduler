<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;

class JobHelper
{
    private EntityRepositoryInterface $jobRepository;

    public function __construct(EntityRepositoryInterface $jobRepository)
    {
        $this->jobRepository = $jobRepository;
    }

    public function markJob(string $jobId, string $status)
    {
        $this->jobRepository->update(
            [
                [
                    'id' => $jobId,
                    'status' => $status
                ]
            ],
            Context::createDefaultContext()
        );
    }
}
