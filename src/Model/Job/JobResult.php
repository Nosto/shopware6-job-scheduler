<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Model\Job;

use Nosto\Scheduler\Model\Job\Message\ErrorMessage;
use Nosto\Scheduler\Model\MessageManager;

class JobResult
{
    public function __construct(
        private array $messages = []
    ) {
    }

    public function addMessage(JobRuntimeMessageInterface $message): void
    {
        $this->messages[] = $message;
    }

    public function getMessages(): array
    {
        return $this->messages;
    }

    public function addError(\Throwable $e): void
    {
        $this->messages[] = new ErrorMessage($e->getMessage());
    }

    public function hasErrors(): bool
    {
        return !empty($this->getErrors());
    }

    public function getErrors(): array
    {
        return array_filter(
            $this->messages,
            fn ($k) => $k->getType() === MessageManager::TYPE_ERROR
        );
    }
}
