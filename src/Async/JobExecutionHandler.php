<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Async;

use Nosto\Scheduler\Model\Job\JobRunner;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
readonly class JobExecutionHandler
{
    public function __construct(
        private LoggerInterface $logger,
        private JobRunner $jobRunner
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
            // Should not trigger any exceptions to avoid message requeue
            $this->logger->error(
                \sprintf('Failed to run job[id: %s] | ' . $message::class . ' |  message: %s', $message->getJobId(), $e->getMessage()),
            );
        }
    }
}
