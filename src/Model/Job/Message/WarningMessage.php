<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Message;

use Od\Scheduler\Model\Job\JobRuntimeMessageInterface;
use Od\Scheduler\Model\MessageManager;

class WarningMessage implements JobRuntimeMessageInterface
{
    public string $type;
    public string $jobId;
    public string $message;

    public function __construct(string $type, string $jobId, string $message)
    {
        $this->type = $type;
        $this->jobId = $jobId;
        $this->message = $message;
    }

    public function getType(): string
    {
        return MessageManager::TYPE_WARNING;
    }

    public function getJobId(): string
    {
        return $this->jobId;
    }

    public function getMessage(): string
    {
        return $this->message;
    }
}