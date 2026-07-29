<?php

declare(strict_types=1);

namespace Nosto\Scheduler\DependencyInjection\Compiler;

use Nosto\Scheduler\Middleware\JobSchedulingMiddleware;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

/**
 * Registers {@see JobSchedulingMiddleware} on the default message bus.
 *
 * This is done here, in a compiler pass, rather than through
 * framework.messenger.buses config on purpose. The `buses.*.middleware` config node
 * uses performNoDeepMerging(), so a second config source (this plugin) would REPLACE the
 * core bus middleware list instead of appending to it — silently dropping middleware
 * Shopware itself registers on the default bus (e.g. QueuedTimeMiddleware on Shopware 6.7).
 * Appending to the `<bus>.middleware` parameter composes safely with whatever Shopware or
 * other plugins register, on both Shopware 6.6 and 6.7.
 *
 * The middleware is inserted immediately before the terminal `send_message` middleware:
 * job messages are typically async and get routed to a transport by `send_message`, which
 * stops the middleware chain — anything registered after it would never run for those
 * messages, so the pending job row would never be persisted.
 *
 * Runs before Symfony's MessengerPass (which consumes and removes the parameter); see
 * the priority passed in {@see \Nosto\Scheduler\NostoScheduler::build()}.
 */
final class RegisterJobSchedulingMiddlewarePass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        // Symfony's default bus id is `messenger.bus.default`; resolve the public
        // `messenger.default_bus` alias so this keeps working if the id ever changes.
        $busId = 'messenger.bus.default';
        if ($container->hasAlias('messenger.default_bus')) {
            $busId = (string) $container->getAlias('messenger.default_bus');
        }

        $parameter = $busId . '.middleware';
        if (!$container->hasParameter($parameter)) {
            // Messenger not configured, or the parameter was already consumed.
            return;
        }

        /** @var list<array{id: string, arguments?: array}> $middleware */
        $middleware = $container->getParameter($parameter);

        // Idempotency guard against the pass running twice.
        foreach ($middleware as $item) {
            if (($item['id'] ?? null) === JobSchedulingMiddleware::class) {
                return;
            }
        }

        $entry = [
            'id' => JobSchedulingMiddleware::class,
        ];

        $sendIndex = null;
        foreach ($middleware as $index => $item) {
            if (($item['id'] ?? null) === 'send_message') {
                $sendIndex = $index;
                break;
            }
        }

        if ($sendIndex === null) {
            $middleware[] = $entry;
        } else {
            array_splice($middleware, $sendIndex, 0, [$entry]);
        }

        $container->setParameter($parameter, $middleware);
    }
}
