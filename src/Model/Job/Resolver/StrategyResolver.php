<?php declare(strict_types=1);

namespace Od\Scheduler\Model\Job\Resolver;

use Od\Scheduler\Model\Job\Strategy\IgnoreErrorStrategy;
use Od\Scheduler\Model\Job\Strategy\StrategyInterface;

class StrategyResolver
{
    /**
     * @var StrategyInterface[]
     */
    private array $strategies = [];
    private iterable $rawStrategies;

    public function __construct(iterable $strategies)
    {
        $this->rawStrategies = $strategies;
    }

    public function getStrategy(): StrategyInterface
    {
        return $this->get(IgnoreErrorStrategy::STRATEGY_CODE);
    }

    //TODO remove these two methods - strategy code will be taken from the message
    public function get(string $code): StrategyInterface
    {
        $this->initStrategies();

        return $this->strategies[$code];
    }

    private function initStrategies()
    {
        if (empty($this->strategies) && $this->rawStrategies instanceof \Traversable) {
            $this->strategies = iterator_to_array($this->rawStrategies);
        }
    }
}