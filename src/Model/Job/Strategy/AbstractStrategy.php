<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

use Od\Scheduler\Entity\Job\JobEntity;
use Od\Scheduler\Model\Exception\JobException;
use Od\Scheduler\Model\Job\{GeneratingHandlerInterface, JobHandlerInterface, JobHelper, JobResult};
use Od\Scheduler\Model\MessageManager;

abstract class AbstractStrategy implements StrategyInterface
{
    private $innerHandler = null;
    private JobHelper $jobHelper;
    private MessageManager $messageManager;

    public function __construct(JobHelper $jobHelper, MessageManager $messageManager)
    {
        $this->jobHelper = $jobHelper;
        $this->messageManager = $messageManager;
    }

    public function execute(object $message): JobResult
    {
        $result = null;

        if ($this->innerHandler === null) {
            throw new \RuntimeException('Inner Handler not set!');
        }

        try {
            $this->jobHelper->markJob($message->getJobId(), JobEntity::TYPE_RUNNING);
            $result = $this->innerHandler->execute($message);
        } catch (\Throwable $e) {
            $result = $result !== null ? $result : new JobResult();
            $result->addError(new JobException($message->getJobId(), $e->getMessage()));
        }

        //TODO move to the JobRunner
        foreach ($result->getMessages() as $resultMessage) {
            $this->messageManager->addMessage($message->getJobId(), $resultMessage->getMessage(),
                $resultMessage->getType());
        }

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

        return $this->applyStrategy($message);
    }

    abstract public function applyStrategy(object $message);

    public function withHandler(JobHandlerInterface $handler): StrategyInterface
    {
        $new = clone $this;
        $new->innerHandler = $handler;

        return $new;
    }
}