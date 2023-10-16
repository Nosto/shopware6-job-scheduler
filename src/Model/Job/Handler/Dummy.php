<?php declare(strict_types=1);

namespace Nosto\Scheduler\Model\Job\Handler;

use Nosto\Scheduler\Model\Job\JobHandlerInterface;
use Nosto\Scheduler\Model\Job\JobResult;

class Dummy implements JobHandlerInterface
{
    public function execute(object $message): JobResult
    {
        return new JobResult([
            new \Exception(\sprintf('Fallback to dummy behavior, message: %s', \get_class($message)))
        ]);
    }
}
