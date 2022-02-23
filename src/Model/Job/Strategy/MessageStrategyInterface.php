<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Strategy;

interface MessageStrategyInterface
{
    public function getStrategyCode(): string;
}