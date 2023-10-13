<?php declare(strict_types=1);

namespace Nosto\Scheduler\Model\Job;

interface JobRuntimeMessageInterface
{
    public function getType(): string;

    public function getMessage(): string;
}