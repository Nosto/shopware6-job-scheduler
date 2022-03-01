<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

use Od\Scheduler\Async\JobMessageInterface;
use Od\Scheduler\Entity\Job\JobEntity;
use Od\Scheduler\Model\Job\{GeneratingHandlerInterface, JobHandlerInterface, JobHelper, JobResult};

abstract class AbstractStrategy implements StrategyInterface
{
    protected $innerHandler = null;
    protected JobHelper $jobHelper;

    public function __construct(JobHelper $jobHelper)
    {
        $this->jobHelper = $jobHelper;
    }

    public function execute(object $message): JobResult
    {
        if (!$message instanceof JobMessageInterface) {
            throw new \Exception('Error!!!');
        }

        if ($this->innerHandler === null) {
            throw new \RuntimeException('Inner Handler not set!');
        }

        $result = $this->applyStrategy($message);

        $status = $result->hasErrors() ? JobEntity::TYPE_FAILED : JobEntity::TYPE_SUCCEED;
        if ($this->innerHandler instanceof GeneratingHandlerInterface) {
            if ($status === JobEntity::TYPE_FAILED) {
                $this->jobHelper->markJob($message->getJobId(), $status);
            } elseif ($this->jobHelper->getChildJobs($message->getJobId())->count() === 0) {
                /**
                 * Nothing was scheduled by generating job handler - delete job.
                 */
                $this->jobHelper->deleteJob($message->getJobId());
            }

            return $result;
        }

        $this->jobHelper->markJob($message->getJobId(), $status);

        return $result;
    }

    abstract public function applyStrategy(JobMessageInterface $message);

    public function withHandler(JobHandlerInterface $handler): StrategyInterface
    {
        $new = clone $this;
        $new->innerHandler = $handler;

        return $new;
    }

    protected function onOperationSuccess(JobMessageInterface $message)
    {
        $this->jobHelper->markJob($message->getJobId(), JobEntity::TYPE_SUCCEED);
    }

    protected function onOperationError(JobMessageInterface $message)
    {
        $this->jobHelper->markJob($message->getJobId(), JobEntity::TYPE_FAILED);
    }
}