const ApiService = Shopware.Classes.ApiService;

/** @private */
class NostoSubJobsCountService extends ApiService {
    constructor(httpClient, loginService, apiEndpoint = 'nosto-job') {
        super(httpClient, loginService, apiEndpoint);
    }

    getAllJobsByStatus() {
        const headers = this.getBasicHeaders();

        return this.httpClient
            .post(
                `_action/${this.getApiBasePath()}/all-jobs-by-status`,
                {
                    headers: headers,
                },
            )
            .then((response) => {
                return ApiService.handleResponse(response);
            });
    }
}

/** @private */
export default NostoSubJobsCountService;
