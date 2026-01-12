/**
 * @sw-package nosto-shopware6-job-scheduler
 */

import template from './nosto-job-listing-index.html.twig';
import JobHelper from '../../../../util/job.helper';
import './nosto-job-listing-index.scss';

const { Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;

/** @private */
Component.register('nosto-job-listing-index', {
    template,

    inject: [
        'NostoRescheduleService',
        'repositoryFactory',
        'filterFactory',
        'feature',
    ],

    emits: ['job-display-type-changed', 'job-grouped-by-changed'],

    mixins: [
        Mixin.getByName('notification'),
        Mixin.getByName('nosto-scheduler-utils'),
    ],

    props: {
        isGroupedView: {
            type: Boolean,
            required: false,
            default: false,
        },
        jobTypes: {
            type: Array,
            required: false,
            default: () => [],
        },
        filterCriteria: {
            type: Array,
            required: false,
            default: () => [],
        },
    },

    data() {
        return {
            jobItems: null,
            isLoading: false,
            reloadInterval: null,
            showJobInfoModal: false,
            showJobSubsModal: false,
            currentJobID: null,
            showMessagesModal: false,
            currentJobMessages: null,
            groupCreationDate: {
            },
            sortType: 'status',
            jobDisplayType: null,
            autoLoad: false,
            autoLoadIsActive: false,
            autoReloadInterval: 60000,
            page: 1,
            limit: 25,
        };
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('nosto_scheduler_job');
        },

        messageRepository() {
            return this.repositoryFactory.create('nosto_scheduler_job_message');
        },

        columns() {
            return [
                {
                    property: 'name',
                    label: this.$tc('job-listing.page.listing.grid.column.name'),
                    allowResize: true,
                    width: '250px',
                },
                {
                    property: 'status',
                    label: this.$tc('job-listing.page.listing.grid.column.status'),
                    allowResize: true,
                    width: '150px',
                },
                {
                    property: 'startedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.started-at'),
                    allowResize: true,
                    width: '170px',
                    sortable: true,
                },
                {
                    property: 'finishedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.finished-at'),
                    allowResize: true,
                    width: '170px',
                },
                {
                    property: 'createdAt',
                    label: this.$tc('job-listing.page.listing.grid.column.created-at'),
                    allowResize: true,
                    width: '170px',
                },
                {
                    property: 'subJobs',
                    label: this.$tc('job-listing.page.listing.grid.column.child-jobs'),
                    allowResize: true,
                    width: '250px',
                    visible: true,
                    sortable: false,
                },
                {
                    property: 'messages',
                    label: this.$tc('job-listing.page.listing.grid.column.messages'),
                    allowResize: true,
                    width: '250px',
                    visible: true,
                    sortable: false,
                },
            ];
        },

        jobDisplayMode() {
            return [
                {
                    label: this.$tc('job-listing.page.listing.index.list'),
                    value: 'list',
                },
                {
                    label: this.$tc('job-listing.page.listing.index.grouped'),
                    value: 'grouped',
                },
                {
                    label: this.$tc('job-listing.page.listing.index.chart'),
                    value: 'chart',
                },
            ];
        },
        jobGroupedBy() {
            return [
                {
                    label: this.$tc('job-listing.page.listing.index.status'),
                    value: 'status',
                },
                {
                    label: this.$tc('job-listing.page.listing.index.job-type'),
                    value: 'type',
                },
            ];
        },
    },

    watch: {
        autoLoadIsActive() {
            this._handleAutoReload(this.autoLoadIsActive);
        },

        jobDisplayType() {
            this.stopAutoLoading();
            this.$emit('job-display-type-changed', this.jobDisplayType);
        },

        sortType() {
            this.stopAutoLoading();
            this.$emit('job-grouped-by-changed', this.sortType);
        },

        filterCriteria() {
            this.filterCriteriaChanged(this.filterCriteria);
        },
    },

    created() {
        this.createdComponent();
    },

    beforeDestroy() {
        clearInterval(this.reloadInterval);
    },

    methods: {
        createdComponent() {
            this.jobDisplayType = 'list';
            this.getList();
        },

        filterCriteriaChanged(criteria) {
            this.getList(criteria);
        },

        _handleAutoReload(active) {
            if (active && this.autoReloadInterval > 0) {
                if (this.jobDisplayType === 'list') {
                    this.reloadInterval = setInterval(() => {
                        this.updateList();
                    }, this.autoReloadInterval);
                } else {
                    this.stopAutoLoading();
                }
            } else {
                clearInterval(this.reloadInterval);
            }
        },

        stopAutoLoading() {
            this.autoLoadIsActive = false;
            clearInterval(this.reloadInterval);
        },

        updateList() {
            this.getList();
        },

        getList(filters = []) {
            this.isLoading = true;
            this.jobItems = null;
            const criteria = new Criteria(this.page, this.limit);
            criteria.addFilter(Criteria.equals('parentId', null));
            criteria.addSorting(Criteria.sort('createdAt', 'DESC', false));
            criteria.addAssociation('messages');
            criteria.addAssociation('subJobs');

            if (this.jobTypes !== []) {
                criteria.addFilter(Criteria.equalsAny('type', this.jobTypes));
            }

            if (filters !== []) {
                criteria.addFilter(...filters);
            }

            this.jobRepository.search(criteria, Shopware.Context.api).then((items) => {
                this.jobItems = JobHelper.sortMessages(items);
                this.isLoading = false;
            });
        },

        onPageChange({ page, limit }) {
            this.page = page;
            this.limit = limit;

            this.getList();
        },

        openSubJobsListModal(jobId) {
            this.currentJobID = jobId;
            this.showJobSubsModal = true;
        },

        openJobInfoModal(jobId) {
            this.currentJobID = jobId;
            this.showJobInfoModal = true;
        },

        openMessageListModal(jobId) {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('jobId', jobId));

            this.messageRepository.search(criteria, Shopware.Context.api).then(items => {
                this.currentJobMessages = items;
                this.showMessagesModal = true;
            });
        },

        closeJobInfoModal() {
            this.showJobInfoModal = false;
            this.currentJobID = null;
        },

        closeSubJobsModal() {
            this.showJobSubsModal = false;
            this.currentJobID = null;
        },

        closeMessageListModal() {
            this.showMessagesModal = false;
            this.currentJobMessages = null;
        },

        rescheduleJob(jobId) {
            this.NostoRescheduleService.rescheduleJob(jobId).then(() => {
                this.createNotificationSuccess({
                    message: 'Job has been rescheduled successfully.',
                });
                this.getList();
            }).catch(() => {
                this.createNotificationError({
                    message: 'Unable reschedule job.',
                });
            });
        },
    },
});
