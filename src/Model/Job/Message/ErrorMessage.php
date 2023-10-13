<?php declare(strict_types=1);

namespace Nosto\Scheduler\Model\Job\Message;

use Nosto\Scheduler\Model\MessageManager;

class ErrorMessage extends JobMessage
{
    public function getType(): string
    {
        return MessageManager::TYPE_ERROR;
    }
}