<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Middleware;

use Closure;
use Nosto\Scheduler\Async\{JobMessageInterface, ParentAwareMessageInterface};
use Nosto\Scheduler\Entity\Job\JobEntity;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Command\WriteTypeIntendException;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\Middleware\{MiddlewareInterface, StackInterface};
use Symfony\Component\Messenger\Transport\Serialization\SerializerInterface;

/**
 * Persists a pending job row for every dispatched {@see JobMessageInterface}.
 *
 * Registered as a Messenger middleware (see {@see \Nosto\Scheduler\DependencyInjection\Compiler\RegisterJobSchedulingMiddlewarePass})
 * rather than as a decorator of messenger.default_bus. This is deliberate: the upstream
 * Od-Scheduler design decorated messenger.default_bus, and when a second plugin embedding
 * the same library (e.g. Klaviyo) also decorates that bus, the two decorators form a
 * construction-time circular reference and the container exhausts memory. As middleware we
 * never wrap the bus, so only ever the other plugin's single decorator is in the chain —
 * identical to that plugin being installed on its own.
 *
 * The job repository is injected as a service closure, not directly, so it is resolved only
 * when a job is actually persisted — never while the messenger service graph is being built.
 * That keeps this plugin fully out of any bus-related instantiation cycle.
 */
readonly class JobSchedulingMiddleware implements MiddlewareInterface
{
    /**
     * @param Closure(): EntityRepository $jobRepository
     */
    public function __construct(
        private SerializerInterface $messageSerializer,
        private Closure $jobRepository
    ) {
    }

    public function handle(Envelope $envelope, StackInterface $stack): Envelope
    {
        $message = $envelope->getMessage();
        if ($message instanceof JobMessageInterface) {
            try {
                $this->scheduleMessage($message);
            } catch (WriteTypeIntendException) {
            }
        }

        return $stack->next()->handle($envelope, $stack);
    }

    private function scheduleMessage(JobMessageInterface $jobMessage): void
    {
        $serializedEnvelope = $this->messageSerializer->encode(Envelope::wrap($jobMessage));
        $jobData = [
            'id' => $jobMessage->getJobId(),
            'name' => $jobMessage->getJobName(),
            'status' => JobEntity::TYPE_PENDING,
            'type' => $jobMessage->getHandlerCode(),
            'message' => $serializedEnvelope['body'] ?? null,
            'expectedChildCount' => 0,
            'childGenerationCompleted' => false,
        ];

        if ($jobMessage instanceof ParentAwareMessageInterface) {
            $jobData['parentId'] = $jobMessage->getParentJobId();
        }

        ($this->jobRepository)()->create([$jobData], Context::createDefaultContext());
    }
}
