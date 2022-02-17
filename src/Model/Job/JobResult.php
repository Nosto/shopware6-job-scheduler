<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job;

class JobResult
{
    private array $errors;
    private array $messages;

    public function __construct(array $errors = [], array $messages = [])
    {
        $this->errors = $errors;
        $this->messages = $messages;
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
        $this->errors[] = $e;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function hasErrors(): bool
    {
        return !empty($this->errors);
    }
}
