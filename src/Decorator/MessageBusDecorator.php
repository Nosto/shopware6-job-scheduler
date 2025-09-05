<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Decorator;

use Nosto\Scheduler\Async\{JobMessageInterface, ParentAwareMessageInterface};
use Nosto\Scheduler\Entity\Job\JobEntity;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Command\WriteTypeIntendException;
use Symfony\Component\Messenger\{Envelope, MessageBusInterface};
use Symfony\Component\Messenger\Transport\Serialization\SerializerInterface;

readonly class MessageBusDecorator implements MessageBusInterface
{
    private EntityRepository $jobRepository;

    public function __construct(
        private MessageBusInterface $innerBus,
        private SerializerInterface $messageSerializer
    ) {
    }

    public function dispatch($message, array $stamps = []): Envelope
    {
        $jobMessage = $message instanceof Envelope ? $message->getMessage() : $message;
        if ($jobMessage instanceof JobMessageInterface) {
            try {
                $this->scheduleMessage($jobMessage);
            } catch (WriteTypeIntendException) {
            }
        }

        return $this->innerBus->dispatch($message, $stamps);
    }

    private function scheduleMessage($jobMessage): void
    {
        $serializedEnvelope = $this->messageSerializer->encode(Envelope::wrap($jobMessage));
        $jobData = [
            'id' => $jobMessage->getJobId(),
            'name' => $jobMessage->getJobName(),
            'status' => JobEntity::TYPE_PENDING,
            'type' => $jobMessage->getHandlerCode(),
            'message' => $serializedEnvelope['body'] ?? null,
        ];

        if ($jobMessage instanceof ParentAwareMessageInterface) {
            $jobData['parentId'] = $jobMessage->getParentJobId();
        }

        $this->jobRepository->create([$jobData], Context::createDefaultContext());
    }

    public function setJobRepository(EntityRepository $jobRepository): void
    {
        $this->jobRepository = $jobRepository;
    }
}
