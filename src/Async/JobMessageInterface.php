<?php declare(strict_types=1);

namespace Od\Scheduler\Async;

interface JobMessageInterface
{
    public function getJobId(): string;

    public function getHandlerCode(): string;
}
