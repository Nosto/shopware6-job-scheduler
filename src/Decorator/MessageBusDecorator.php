<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Decorator;

use Nosto\Scheduler\Async\{JobMessageInterface, ParentAwareMessageInterface};
use Nosto\Scheduler\Entity\Job\JobEntity;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Command\WriteTypeIntendException;
use Symfony\Component\Messenger\Transport\Serialization\SerializerInterface;
use Symfony\Component\Messenger\{Envelope, MessageBusInterface};

class MessageBusDecorator implements MessageBusInterface
{
    private MessageBusInterface $innerBus;

    private SerializerInterface $messageSerializer;

    private EntityRepository $jobRepository;

    public function __construct(
        MessageBusInterface $innerBus,
        SerializerInterface $messageSerializer
    ) {
        $this->innerBus = $innerBus;
        $this->messageSerializer = $messageSerializer;
    }

    public function dispatch($message, array $stamps = []): Envelope
    {
        $jobMessage = $message instanceof Envelope ? $message->getMessage() : $message;
        if ($jobMessage instanceof JobMessageInterface) {
            try {
                $this->scheduleMessage($jobMessage);
            } catch (WriteTypeIntendException $e) {
                null;
            }
        }

        return $this->innerBus->dispatch($message, $stamps);
    }

    private function scheduleMessage($jobMessage)
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

    public function setJobRepository(EntityRepository $jobRepository)
    {
        $this->jobRepository = $jobRepository;
    }
}
