<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Model\Job\Message;

use Nosto\Scheduler\Model\Job\JobRuntimeMessageInterface;
use Nosto\Scheduler\Model\MessageManager;

class JobMessage implements JobRuntimeMessageInterface
{
    private string $message;

    public function __construct(string $message)
    {
        $this->message = $message;
    }

    public function getType(): string
    {
        return MessageManager::TYPE_INFO;
    }

    public function getMessage(): string
    {
        return $this->message;
    }
}
