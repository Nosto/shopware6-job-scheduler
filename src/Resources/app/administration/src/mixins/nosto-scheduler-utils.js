/**
 * @sw-package nosto-shopware6-job-scheduler
 */

const { Mixin, Utils } = Shopware;

Mixin.register('nosto-scheduler-utils', {
    methods: {
        formatDate(date) {
            return Utils.format.date(date);
        },
    },
});
