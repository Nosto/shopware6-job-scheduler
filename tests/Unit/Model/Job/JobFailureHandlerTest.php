<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Tests\Unit\Model\Job;

use Nosto\Scheduler\Entity\Job\JobEntity;
use Nosto\Scheduler\Model\Job\JobFailureHandler;
use Nosto\Scheduler\Model\Job\JobHelper;
use Nosto\Scheduler\Model\Job\JobRunner;
use Nosto\Scheduler\Model\MessageManager;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class JobFailureHandlerTest extends TestCase
{
    public function testFailMarksTheJobAsFailedAndRecordsTheReason(): void
    {
        $jobHelper = $this->createMock(JobHelper::class);
        $messageManager = $this->createMock(MessageManager::class);
        $jobHelper->method('getJob')->with('job-1')->willReturn($this->createJob('job-1'));

        $jobHelper->expects($this->once())->method('markJob')->with('job-1', JobEntity::TYPE_FAILED);
        $messageManager->expects($this->once())->method('addErrorMessage')->with('job-1', 'Lost message');
        $jobHelper->expects($this->never())->method('isGeneratedJobReadyToFinalize');

        (new JobFailureHandler($jobHelper, $messageManager))->fail('job-1', 'Lost message');
    }

    public function testFailIgnoresJobsThatNoLongerExist(): void
    {
        $jobHelper = $this->createMock(JobHelper::class);
        $messageManager = $this->createMock(MessageManager::class);
        $jobHelper->method('getJob')->willReturn(null);

        $jobHelper->expects($this->never())->method('markJob');
        $messageManager->expects($this->never())->method('addErrorMessage');

        (new JobFailureHandler($jobHelper, $messageManager))->fail('missing', 'Lost message');
    }

    #[DataProvider('finishedStatuses')]
    public function testFailIgnoresJobsThatAreAlreadyFinished(string $status): void
    {
        $jobHelper = $this->createMock(JobHelper::class);
        $messageManager = $this->createMock(MessageManager::class);
        $jobHelper->method('getJob')->willReturn($this->createJob('child', 'parent', $status));

        $jobHelper->expects($this->never())->method('markJob');
        $jobHelper->expects($this->never())->method('isGeneratedJobReadyToFinalize');
        $messageManager->expects($this->never())->method('addErrorMessage');

        (new JobFailureHandler($jobHelper, $messageManager))->fail('child', 'Lost message');
    }

    /**
     * @return array<string, array{string}>
     */
    public static function finishedStatuses(): array
    {
        return [
            'failed' => [JobEntity::TYPE_FAILED],
            'succeeded' => [JobEntity::TYPE_SUCCEED],
        ];
    }

    public function testFailFinalizesTheParentWhenItWasTheLastUnfinishedChild(): void
    {
        $jobHelper = $this->createMock(JobHelper::class);
        $messageManager = $this->createMock(MessageManager::class);
        $jobHelper->method('getJob')->willReturn($this->createJob('child', 'parent'));
        $jobHelper->expects($this->once())
            ->method('isGeneratedJobReadyToFinalize')
            ->with('parent', JobRunner::NOT_FINISHED_STATUSES)
            ->willReturn(true);

        $markedJobs = [];
        $jobHelper->method('markJob')->willReturnCallback(
            static function (string $jobId, string $status) use (&$markedJobs): void {
                $markedJobs[$jobId] = $status;
            }
        );
        $messages = [];
        $messageManager->method('addErrorMessage')->willReturnCallback(
            static function (string $jobId, string $message) use (&$messages): void {
                $messages[$jobId] = $message;
            }
        );

        (new JobFailureHandler($jobHelper, $messageManager))->fail('child', 'Lost message');

        self::assertSame([
            'child' => JobEntity::TYPE_FAILED,
            'parent' => JobEntity::TYPE_FAILED,
        ], $markedJobs);
        self::assertSame(
            [
                'child' => 'Lost message',
                'parent' => 'Some child jobs have failed to process.',
            ],
            $messages
        );
    }

    public function testFailLeavesTheParentAloneWhileOtherChildrenAreUnfinished(): void
    {
        $jobHelper = $this->createMock(JobHelper::class);
        $messageManager = $this->createMock(MessageManager::class);
        $jobHelper->method('getJob')->willReturn($this->createJob('child', 'parent'));
        $jobHelper->method('isGeneratedJobReadyToFinalize')->willReturn(false);

        $jobHelper->expects($this->once())->method('markJob')->with('child', JobEntity::TYPE_FAILED);
        $messageManager->expects($this->once())->method('addErrorMessage')->with('child', 'Lost message');

        (new JobFailureHandler($jobHelper, $messageManager))->fail('child', 'Lost message');
    }

    private function createJob(string $id, ?string $parentId = null, string $status = JobEntity::TYPE_PENDING): JobEntity
    {
        $job = new JobEntity();
        $job->setId($id);
        $job->setParentId($parentId);
        $job->setStatus($status);

        return $job;
    }
}
