<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Async;

interface ParentAwareMessageInterface
{
    public function getParentJobId(): string;
}
