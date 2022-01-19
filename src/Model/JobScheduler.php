<?php declare(strict_types=1);

namespace Od\Scheduler\Model;

use Od\Scheduler\Async\JobMessageInterface;
use Od\Scheduler\Async\ParentAwareMessageInterface;
use Od\Scheduler\Entity\Job\JobEntity;
use Od\Scheduler\Model\Job\GeneratingHandlerInterface;
use Od\Scheduler\Model\Job\HandlerPool;
use Od\Scheduler\Model\Job\JobHelper;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Transport\Serialization\SerializerInterface;

class JobScheduler
{
    private EntityRepositoryInterface $jobRepository;
    private SerializerInterface $messageSerializer;
    private MessageBusInterface $messageBus;
    private HandlerPool $handlerPool;
    private JobHelper $jobHelper;

    public function __construct(
        EntityRepositoryInterface $jobRepository,
        SerializerInterface $messageSerializer,
        MessageBusInterface $messageBus,
        HandlerPool $handlerPool,
        JobHelper $jobHelper
    ) {
        $this->jobRepository = $jobRepository;
        $this->messageSerializer = $messageSerializer;
        $this->messageBus = $messageBus;
        $this->handlerPool = $handlerPool;
        $this->jobHelper = $jobHelper;
    }

    public function reschedule(string $jobId)
    {
        $criteria = new Criteria([$jobId]);
        /** @var JobEntity $job */
        $job = $this->jobRepository->search($criteria, Context::createDefaultContext())->first();

        if ($job === null) {
            throw new \Exception(\sprintf('Unable to reschedule job[id: %s]: not found.', $jobId));
        }

        $this->rescheduleJob($job);
    }

    public function schedule(JobMessageInterface $jobMessage)
    {
        $serializedEnvelope = $this->messageSerializer->encode(Envelope::wrap($jobMessage));
        $jobData = [
            'id' => $jobMessage->getJobId(),
            'name' => $jobMessage->getJobName(),
            'status' => JobEntity::TYPE_PENDING,
            'type' => $jobMessage->getHandlerCode(),
            'message' => $serializedEnvelope['body'] ?? null
        ];

        if ($jobMessage instanceof ParentAwareMessageInterface) {
            $jobData['parentId'] = $jobMessage->getParentJobId();
        }

        $this->jobRepository->create([$jobData], Context::createDefaultContext());
        $this->messageBus->dispatch($jobMessage);
    }

    private function rescheduleJob(JobEntity $job)
    {
        $jobMessage = $this->messageSerializer->decode(['body' => $job->getMessage()])->getMessage();

        if (!$jobMessage instanceof JobMessageInterface) {
            throw new \Exception(\sprintf('Unable to reschedule job[id: %s]: wrong message.', $job->getId()));
        }

        $this->jobHelper->markJob($job->getId(), JobEntity::TYPE_PENDING);
        $jobHandler = $this->handlerPool->get($jobMessage->getHandlerCode());

        if ($parentJobId = $job->getParentId()) {
            $this->jobHelper->markJob($parentJobId, JobEntity::TYPE_RUNNING);
        }

        /**
         * In case on generating handler (aka handler creating child jobs),
         * we need to resend childs' messages to message bus.
         */
        if ($jobHandler instanceof GeneratingHandlerInterface) {
            $childJobCollection = $this->jobHelper->getChildJobs($job->getId());

            /** @var JobEntity $childJob */
            foreach ($childJobCollection as $childJob) {
                $this->rescheduleJob($childJob);
            }
        } else {
            $this->messageBus->dispatch($jobMessage);
        }
    }
}
