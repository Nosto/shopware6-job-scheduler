<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

use Od\Scheduler\Async\JobMessageInterface;
use Od\Scheduler\Entity\Job\JobEntity;
use Od\Scheduler\Model\Job\JobResult;
use Od\Scheduler\Model\Job\Message\ErrorMessage;

class SkipErrorStrategy extends AbstractStrategy
{
    public const STRATEGY_CODE = 'skip_error_strategy';

    /**
     * @param JobMessageInterface $message
     */
    public function applyStrategy(JobMessageInterface $message): JobResult
    {
        try {
            $this->jobHelper->markJob($message->getJobId(), JobEntity::TYPE_RUNNING);
            $result = $this->innerHandler->execute($message);
            $this->onOperationSuccess($message);
        } catch (\Throwable $e) {
            $result = new JobResult([new ErrorMessage($e->getMessage())]);
            $this->onOperationError($message);
        }

        return $result;
    }

    protected function onOperationError(JobMessageInterface $message)
    {
        $this->onOperationSuccess($message);
    }
}