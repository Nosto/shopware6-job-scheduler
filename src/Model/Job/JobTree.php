<?php

namespace Od\Scheduler\Model\Job;

use ArrayIterator;
use IteratorAggregate;
use Traversable;

class JobTree implements IteratorAggregate
{
    private object $rootJob;
    private array $childJobs;

    public function __construct(object $rootJob, array $childJobs)
    {
        $this->rootJob = $rootJob;
        $this->childJobs = $childJobs;
    }

    public function getRootJob(): object
    {
        return $this->rootJob;
    }

    public function getIterator(): Traversable
    {
        return new ArrayIterator($this->childJobs);
    }
}