const { Mixin, Utils } = Shopware;

Mixin.register('nosto-scheduler-utils', {
    methods: {
        formatDate(date) {
            return Utils.format.date(date);
        },
    },
});
