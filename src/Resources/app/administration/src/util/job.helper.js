/** @private */
export default class JobHelper {
    static sortMessages(jobs) {
        jobs.forEach((job) => {
            job.messages = job.messages.sort((a, b) => {
                if (a.createdAt > b.createdAt) {
                    return 1;
                }

                if (a.createdAt < b.createdAt) {
                    return -1;
                }

                return 0;
            });
        });

        return jobs;
    }
}
