<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job;

interface JobRuntimeMessageInterface
{
    public function getJobId(): string;

    public function getType(): string;

    public function getMessage(): string;
}