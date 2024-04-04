<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Controller\Administration;

use Nosto\Scheduler\Model\JobScheduler;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Exception\InvalidParameterException;

#[Route(
    defaults: [
        '_routeScope' => ['api'],
    ]
)]
class RescheduleController extends AbstractController
{
    public function __construct(
        private readonly JobScheduler $jobScheduler
    ) {
    }

    #[Route(
        path: "/api/_action/nosto-job/reschedule",
        name: "api.nosto.scheduler.nosto.job.event.reschedule",
        options: [
            "seo" => "false",
        ],
        methods: ["POST"]
    )]
    public function rescheduleAction(Request $request): JsonResponse
    {
        $jobId = $request->request->get('params')['jobId'] ?? null;
        if (!\is_string($jobId)) {
            throw new InvalidParameterException('jobId');
        }

        $this->jobScheduler->reschedule($jobId);

        return new JsonResponse();
    }
}
