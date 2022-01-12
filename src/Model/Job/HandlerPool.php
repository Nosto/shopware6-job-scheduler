<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job;

class HandlerPool
{
    /**
     * @var JobHandlerInterface[]
     */
    private array $handlers;

    public function __construct(array $handlers = [])
    {
        $this->handlers = $handlers;
    }

    public function get(string $code): JobHandlerInterface
    {
        if (!isset($this->handlers[$code])) {
            throw new \Exception(\sprintf('Handler[code: %s] is not defined.', $code));
        }

        return $this->handlers[$code];
    }

    public function all(): array
    {
        return $this->handlers;
    }
}
