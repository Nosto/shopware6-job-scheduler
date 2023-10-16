import template from './nosto-job-info.html.twig';

const { Component } = Shopware;
const { Criteria } = Shopware.Data;

/** @private */
Component.register('nosto-job-info', {
    template,

    inject: [
        'NostoRescheduleService',
        'repositoryFactory',
    ],

    mixins: [
        'notification',
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
});
