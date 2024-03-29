<?php

declare(strict_types=1);

namespace Nosto\Scheduler\Controller\Administration;

use Nosto\Scheduler\Model\JobScheduler;
use Shopware\Core\Framework\Routing\Exception\InvalidRequestParameterException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    defaults: [
        '_routeScope' => ['api'],
    ]
)]
class RescheduleController extends AbstractController
{
    private JobScheduler $jobScheduler;

    public function __construct(JobScheduler $jobScheduler)
    {
        $this->jobScheduler = $jobScheduler;
    }

    #[Route(
        path: "/api/_action/nosto-job/reschedule",
        name: "api.nosto.scheduler.nosto.job.event.reschedule",
        options: [
            "seo" => "false",
        ],
        methods: ["POST"]
    )]
    public function rescheduleAction(Request $request)
    {
        $jobId = $request->request->get('params')['jobId'] ?? null;
        if (!\is_string($jobId)) {
            throw new InvalidRequestParameterException('jobId');
        }

        $this->jobScheduler->reschedule($jobId);

        return new JsonResponse();
    }
}
