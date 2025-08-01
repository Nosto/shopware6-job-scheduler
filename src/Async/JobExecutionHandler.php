<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Async;

use Nosto\Scheduler\Model\Job\JobRunner;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Uuid\Uuid;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
readonly class JobExecutionHandler
{
    public function __construct(
        private LoggerInterface $logger,
        private JobRunner $jobRunner,
        private EntityRepository $jobRepository,
    ) {
    }

    public function __invoke(JobMessageInterface $message): void
    {
        $this->handle($message);
    }

    public function handle(JobMessageInterface $message): void
    {
        try {
            $this->jobRunner->execute($message);
        } catch (\Throwable $e) {
            $criteria = new Criteria([Uuid::fromHexToBytes($message->getJobId())]);

            $job = $this->jobRepository->search($criteria, Context::createDefaultContext())->first();

            if ($job === null) {
                return;
            }

            // Should not trigger any exceptions to avoid message requeue
            $this->logger->error(
                \sprintf('Failed to run job[id: %s] | ' . $message::class . ' |  message: %s', $message->getJobId(), $e->getMessage()),
            );
        }
    }
}
