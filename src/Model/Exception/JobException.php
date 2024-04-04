<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Model\Exception;

use Exception;
use Throwable;

class JobException extends Exception
{
    public function __construct(
        private readonly string $jobId,
        $message = "",
        $code = 0,
        Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }

    public function getJobId(): string
    {
        return $this->jobId;
    }
}
