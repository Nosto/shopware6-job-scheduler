/**
 * @sw-package innovation
 */

import template from './nosto-job-info.html.twig';

const { Mixin } = Shopware;
const { Criteria } = Shopware.Data;

export default {
    template,

    inject: [
        'NostoRescheduleService',
        'repositoryFactory',
    ],

    mixins: [
        Mixin.getByName('notification'),
        Mixin.getByName('nosto-scheduler-utils'),
    ],

    props: {
        jobId: {
            type: String,
            required: false,
            default: null,
        },
    },

    data() {
        return {
            jobItem: null,
        };
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('nosto_scheduler_job');
        },
    },

    created() {
        this.initPageData();
    },

    methods: {
        initPageData() {
            this.jobRepository.get(this.jobId, Shopware.Context.api, new Criteria()).then(jobItem => {
                this.jobItem = jobItem;
            });
        },
    },
};
