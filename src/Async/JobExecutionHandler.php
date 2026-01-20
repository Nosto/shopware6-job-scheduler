<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Async;

use Nosto\Scheduler\Model\Job\JobRunner;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Uuid\Uuid;
use Symfony\Component\Messenger\Handler\MessageSubscriberInterface;

class JobExecutionHandler implements MessageSubscriberInterface
{
    private LoggerInterface $logger;

    private JobRunner $jobRunner;

    private EntityRepository $jobRepository;

    public function __construct(
        LoggerInterface $logger,
        JobRunner $jobRunner,
        EntityRepository $jobRepository,
    ) {
        $this->logger = $logger;
        $this->jobRunner = $jobRunner;
        $this->jobRepository = $jobRepository;
    }

    public function __invoke(JobMessageInterface $message)
    {
        $this->handle($message);
    }

    public function handle(JobMessageInterface $message): void
    {
        try {
            $this->jobRunner->execute($message);
        } catch (\Throwable $e) {
            if ($message === null) {
                $this->logger->warning('Job execution failed with null message.', [
                    'exception' => $e,
                ]);
                return;
            }
            $id = $message->getJobId();
            if ($id === null) {
                $this->logger->warning('Job execution failed with null job id.', [
                    'message_class' => $message::class,
                    'exception' => $e,
                ]);
                return;
            }
            $criteria = new Criteria([Uuid::isValid($id) ? $id : Uuid::fromBytesToHex($id)]);

            $job = $this->jobRepository->search($criteria, Context::createDefaultContext())->first();

            if ($job === null) {
                $this->logger->warning('Job execution failed: job not found in repository.', [
                    'job_id' => $id,
                    'message_class' => $message::class,
                    'exception' => $e,
                ]);
                return;
            }

            // Should not trigger any exceptions to avoid message requeue
            $this->logger->error(
                \sprintf('Failed to run job[id: %s] | ' . get_class($message) . ' |  message: %s', $id, $e->getMessage()),
            );
        }
    }

    final public static function getHandledMessages(): iterable
    {
        return [JobMessageInterface::class];
    }
}
