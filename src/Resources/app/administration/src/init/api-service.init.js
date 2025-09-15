/**
 * @sw-package innovation
 */
/* eslint-env es6 */

import NostoRescheduleService from '../service/api/nosto-reschedule.service';

const { Application } = Shopware;
const initContainer = Application.getContainer('init');

Application.addServiceProvider(
    'NostoRescheduleService',
    (container) => new NostoRescheduleService(initContainer.httpClient, container.loginService),
);
