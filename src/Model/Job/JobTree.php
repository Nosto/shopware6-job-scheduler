<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Model\Job;

use Nosto\Scheduler\Entity\Job\JobEntity;

readonly class JobTree implements \IteratorAggregate
{
    public function __construct(
        private JobEntity $rootJob,
        private array $childJobs
    ) {
    }

    public function getRootJob(): JobEntity
    {
        return $this->rootJob;
    }

    public function getIterator(): \Traversable
    {
        return new \ArrayIterator($this->childJobs);
    }
}
