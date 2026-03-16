/**
 * @sw-package innovation
 */

import template from './nosto-job-listing-index.html.twig';
import { getJobStatusLabel, getJobStatusTone, isJobRunningStatus } from '../../../../util/job-status.helper';
import fetchJobMessages from '../../../../util/job-messages.helper';
import './nosto-job-listing-index.scss';

const { Mixin } = Shopware;
const { Criteria } = Shopware.Data;

const CHILD_COUNT_KEYS = Object.freeze({
    TOTAL: 'total',
    SUCCESS: 'success',
    PENDING: 'pending',
    ERROR: 'error',
});

const MESSAGE_COUNT_KEYS = Object.freeze({
    TOTAL: 'total',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
});

function normalizeMessageType(type) {
    if (type === MESSAGE_COUNT_KEYS.INFO) {
        return MESSAGE_COUNT_KEYS.INFO;
    }

    if (type === MESSAGE_COUNT_KEYS.WARNING) {
        return MESSAGE_COUNT_KEYS.WARNING;
    }

    if (type === MESSAGE_COUNT_KEYS.ERROR) {
        return MESSAGE_COUNT_KEYS.ERROR;
    }

    return MESSAGE_COUNT_KEYS.TOTAL;
}

function getRawJobCounts(job) {
    const fieldCounts = job?.jobCounts ?? {};
    const extensionCounts = job?.extensions?.jobCounts ?? {};

    return {
        childJobs: {
            ...(extensionCounts.childJobs ?? {}),
            ...(fieldCounts.childJobs ?? {}),
        },
        messages: {
            ...(extensionCounts.messages ?? {}),
            ...(fieldCounts.messages ?? {}),
        },
    };
}

/** @private */
export default {
    template,

    inject: [
        'NostoRescheduleService',
        'repositoryFactory',
        'filterFactory',
        'feature',
    ],

    emits: ['job-display-type-changed', 'job-grouped-by-changed', 'job-list-meta-loaded'],

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
                } else if (this.jobDisplayType === 'grouped') {
                    this.reloadInterval = setInterval(() => {
                        this.$refs.jobGroups.initGroupedView();
                    }, this.autoReloadInterval);
                } else if (this.jobDisplayType === 'chart') {
                    this.reloadInterval = setInterval(() => {
                        this.$refs.jobCharts.initChartData();
                    }, this.autoReloadInterval);
                }
            } else {
                clearInterval(this.reloadInterval);
            }
        },

        pageChange() {
            this.autoLoadIsActive = false;
            clearInterval(this.reloadInterval);
        },

        getLinkParams(item) {
            return {
                id: item.id,
                backPath: this.$route.name,
            };
        },

        updateList(filterCriteria) {
            const criteria = new Criteria(this.page, this.limit);
            criteria.addFilter(Criteria.equals('parentId', null));
            criteria.addSorting(Criteria.sort('createdAt', 'DESC', false));

            if (filterCriteria) {
                filterCriteria.forEach(filter => {
                    criteria.addFilter(filter);
                });
            }

            if (this.jobTypes !== []) {
                criteria.addFilter(Criteria.equalsAny('type', this.jobTypes));
            }

            return this.jobRepository.search(criteria, Shopware.Context.api).then(jobItems => {
                this.jobItems = jobItems;
                this.$emit('job-list-meta-loaded', this.extractFilterMeta(jobItems));
            });
        },

        extractFilterMeta(jobItems) {
            const statuses = [...new Set(jobItems.map((item) => item.status).filter((status) => !!status))];
            const types = [...new Set(jobItems.map((item) => item.name).filter((name) => !!name))];

            return {
                statuses,
                types,
            };
        },

        getJobCounts(job) {
            const rawCounts = getRawJobCounts(job);
            const childJobs = rawCounts.childJobs ?? {};
            const messages = rawCounts.messages ?? {};

            return {
                childJobs: {
                    [CHILD_COUNT_KEYS.TOTAL]: Number(childJobs[CHILD_COUNT_KEYS.TOTAL] ?? 0),
                    [CHILD_COUNT_KEYS.SUCCESS]: Number(childJobs[CHILD_COUNT_KEYS.SUCCESS] ?? 0),
                    [CHILD_COUNT_KEYS.PENDING]: Number(childJobs[CHILD_COUNT_KEYS.PENDING] ?? 0),
                    [CHILD_COUNT_KEYS.ERROR]: Number(childJobs[CHILD_COUNT_KEYS.ERROR] ?? 0),
                },
                messages: {
                    [MESSAGE_COUNT_KEYS.TOTAL]: Number(messages[MESSAGE_COUNT_KEYS.TOTAL] ?? 0),
                    [MESSAGE_COUNT_KEYS.INFO]: Number(messages[MESSAGE_COUNT_KEYS.INFO] ?? 0),
                    [MESSAGE_COUNT_KEYS.WARNING]: Number(messages[MESSAGE_COUNT_KEYS.WARNING] ?? 0),
                    [MESSAGE_COUNT_KEYS.ERROR]: Number(messages[MESSAGE_COUNT_KEYS.ERROR] ?? 0),
                },
            };
        },

        getChildCountByType(job, type) {
            const data = this.getJobCounts(job).childJobs;

            return Number(data?.[type] ?? 0);
        },

        getChildrenCount(job) {
            return this.getChildCountByType(job, CHILD_COUNT_KEYS.TOTAL);
        },

        getChildrenSuccessCount(job) {
            return this.getChildCountByType(job, CHILD_COUNT_KEYS.SUCCESS);
        },

        getChildrenPendingCount(job) {
            return this.getChildCountByType(job, CHILD_COUNT_KEYS.PENDING);
        },

        getChildrenErrorCount(job) {
            return this.getChildCountByType(job, CHILD_COUNT_KEYS.ERROR);
        },

        getMessageCountByType(job, type) {
            const normalizedType = normalizeMessageType(type);

            return Number(this.getJobCounts(job).messages?.[normalizedType] ?? 0);
        },

        getMessagesCount(job, type) {
            return this.getMessageCountByType(job, type);
        },

        getMessagesTotalCount(job) {
            return this.getMessageCountByType(job, MESSAGE_COUNT_KEYS.TOTAL);
        },

        getList(filterCriteria) {
            this.isLoading = true;
            this.updateList(filterCriteria).then(() => {
                this.isLoading = false;
            });
        },

        onRefresh(criteria) {
            if (this.jobDisplayType === 'grouped') {
                return this.$refs.jobGroups.onRefresh();
            } if (this.jobDisplayType === 'chart') {
                return this.$refs.jobCharts.onRefresh();
            }
            return this.getList(criteria);
        },

        canDelete(item) {
            return ['error', 'succeed'].indexOf(item.status) !== -1;
        },

        onDeleteJob(jobId) {
            this.jobRepository.delete(jobId, Shopware.Context.api).then(() => {
                this.updateList();
            });
        },

        rescheduleJob(jobId) {
            this.NostoRescheduleService.rescheduleJob(jobId).then(() => {
                this.createNotificationSuccess({
                    message: 'Job has been rescheduled successfully.',
                });
                this.updateList();
            }).catch(() => {
                this.createNotificationError({
                    message: 'Unable reschedule job.',
                });
            });
        },

        showSubJobs(jobId) {
            this.currentJobID = jobId;
            this.showJobSubsModal = true;
        },

        showJobMessages(job) {
            if (!job?.id) {
                return;
            }

            this.currentJobMessages = [];
            this.showMessagesModal = true;

            const expectedTotal = this.getMessagesTotalCount(job);

            fetchJobMessages({
                messageRepository: this.messageRepository,
                jobId: job.id,
                expectedTotal,
            }).then((messages) => {
                this.currentJobMessages = messages;
            }).catch(() => {
                this.currentJobMessages = [];
            });
        },

        getStatusTone(status) {
            return getJobStatusTone(status);
        },

        getStatusLabel(status) {
            return getJobStatusLabel(status, (key) => this.$tc(key));
        },

        isRunningStatus(status) {
            return isJobRunningStatus(status);
        },

        stopAutoLoading() {
            this.autoLoadIsActive = false;
            clearInterval(this.reloadInterval);
        },
    },
};
