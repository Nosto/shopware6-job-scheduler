<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

use Od\Scheduler\Entity\Job\JobEntity;
use Od\Scheduler\Model\Exception\JobException;
use Od\Scheduler\Model\Job\JobHandlerInterface;
use Od\Scheduler\Model\Job\JobHelper;
use Od\Scheduler\Model\Job\JobResult;
use Od\Scheduler\Model\MessageManager;

abstract class StrategyResolver implements StrategyInterface
{
    private $innerHandler = null;
    private JobHelper $jobHelper;
    private MessageManager $messageManager;

    public function __construct(JobHelper $jobHelper, MessageManager $messageManager)
    {
        $this->jobHelper = $jobHelper;
        $this->messageManager = $messageManager;
    }

    public function get(object $message)
    {

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

        foreach ($result->getMessages() as $resultMessage) {
            $this->messageManager->addMessage(
                $message->getJobId(),
                $resultMessage->getMessage(),
                $resultMessage->getType()
            );
        }

        return $result;
    }

    public function withHandler(JobHandlerInterface $handler): StrategyInterface
    {
        $new = clone $this;
        $new->innerHandler = $handler;

        return $new;
    }
}