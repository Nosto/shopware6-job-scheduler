<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Controller\Administration;

use Nosto\Scheduler\Entity\Job\JobCollection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Exception\InvalidParameterException;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\NotFilter;
use Shopware\Core\Framework\Context;

#[Route(
    defaults: [
        '_routeScope' => ['api'],
    ]
)]
class SubJobsCountController extends AbstractController
{
    public function __construct(
        private EntityRepository $jobRepository
    ) {
    }

    #[Route(
        path: "/api/_action/nosto-job/all-jobs-by-status",
        name: "api.nosto.scheduler.nosto.job.all.jobs.by.status",
        options: [
            "seo" => "false",
        ],
        methods: ["POST"]
    )]
    public function getAllJobsByStatus(Request $request): JsonResponse
    {
        $criteria = new Criteria();

        $criteria->addFilter(new NotFilter(NotFilter::CONNECTION_AND, [
            new EqualsFilter('parentId', null)
        ]));

        /** @var JobCollection $jobs */
        $jobs = $this->jobRepository->search($criteria, Context::createDefaultContext())->getEntities();

        $jobsByStatus = [];

        foreach ($jobs as $job) {
            if (!isset($jobsByStatus[$job->getParentId()])) {
                $jobsByStatus[$job->getParentId()]['jobId']   = $job->getParentId();
                $jobsByStatus[$job->getParentId()]['succeed'] = 0;
                $jobsByStatus[$job->getParentId()]['pending'] = 0;
                $jobsByStatus[$job->getParentId()]['error']   = 0;
            }

            if ($job->getStatus() == 'succeed') {
                $jobsByStatus[$job->getParentId()]['succeed']++;
            }

            if ($job->getStatus() == 'pending') {
                $jobsByStatus[$job->getParentId()]['pending']++;
            }

            if ($job->getStatus() == 'error') {
                $jobsByStatus[$job->getParentId()]['error']++;
            }
        }

        return new JsonResponse($jobsByStatus);
    }
}
