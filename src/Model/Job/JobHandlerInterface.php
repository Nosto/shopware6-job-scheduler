<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job;

use Od\Scheduler\Async\JobMessageInterface;

interface JobHandlerInterface
{
    public function execute(JobMessageInterface $message): JobResult;
}
