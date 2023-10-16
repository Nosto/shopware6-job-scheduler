const ApiService = Shopware.Classes.ApiService;

class NostoRescheduleService extends ApiService {
    constructor(httpClient, loginService, apiEndpoint = 'nosto-job') {
        super(httpClient, loginService, apiEndpoint);
    }

    rescheduleJob(jobId) {
        const headers = this.getBasicHeaders();

        return this.httpClient
            .post(
                `_action/${this.getApiBasePath()}/reschedule`,
                {
                    params: { jobId },
                    headers: headers,
                },
            )
            .then((response) => {
                return ApiService.handleResponse(response);
            });
    }
}

export default NostoRescheduleService;
