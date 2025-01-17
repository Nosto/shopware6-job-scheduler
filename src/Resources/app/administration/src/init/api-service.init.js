import NostoRescheduleService from '../service/api/nosto-reschedule.service';
import NostoSubJobsCountService from '../service/api/nosto-sub-jobs-count.service';

const { Application } = Shopware;
const initContainer = Application.getContainer('init');

Application.addServiceProvider(
    'NostoRescheduleService',
    (container) => new NostoRescheduleService(initContainer.httpClient, container.loginService),
);

Application.addServiceProvider(
    'NostoSubJobsCountService',
    (container) => new NostoSubJobsCountService(initContainer.httpClient, container.loginService),
);
