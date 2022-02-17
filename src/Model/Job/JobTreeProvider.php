<?php

namespace Od\Scheduler\Model\Job;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\{EqualsAnyFilter, EqualsFilter, OrFilter};

class JobTreeProvider
{
    public EntityRepositoryInterface $jobRepository;

    public function __construct(EntityRepositoryInterface $jobRepository)
    {
        $this->jobRepository = $jobRepository;
    }

    public function get($rootJobId, array $childStatuses = []): JobTree
    {
        $criteria = new Criteria();
        $criteria->addFilter(
            new OrFilter([
                new EqualsFilter('id', $rootJobId),
                new EqualsFilter('parentId', $rootJobId),
            ])
        );

        if (!empty($childStatuses)) {
            $criteria->addPostFilter(
                new OrFilter([
                    new EqualsFilter('parentId', null),
                    new EqualsAnyFilter('status', $childStatuses)
                ])
            );
        }


        return $this->loadTree($rootJobId, $criteria);
    }

    public function loadTree($rootJobId, $criteria): JobTree
    {
        $context = Context::createDefaultContext();
        $searchResult = $this->jobRepository->search($criteria, $context);
        $rootJob = $searchResult->getEntities()->get($rootJobId);
        $childJobs = $searchResult->getEntities()->filterByProperty('parentId', $rootJobId)->getElements();

        return new JobTree($rootJob, $childJobs);
    }
}