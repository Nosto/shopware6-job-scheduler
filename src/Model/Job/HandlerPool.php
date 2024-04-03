<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Model\Job;

class HandlerPool
{
    /**
     * @var JobHandlerInterface[]
     */
    private array $handlers = [];

    public function __construct(
        private readonly iterable $rawHandlers
    ) {
    }

    public function get(string $code): JobHandlerInterface
    {
        $this->initHandlers();

        return $this->handlers[$code] ?? new Handler\Dummy();
    }

    /**
     * @return JobHandlerInterface[]
     */
    public function all(): array
    {
        $this->initHandlers();

        return $this->handlers;
    }

    private function initHandlers(): void
    {
        if (empty($this->handlers) && $this->rawHandlers instanceof \Traversable) {
            $this->handlers = iterator_to_array($this->rawHandlers);
        }
    }
}
