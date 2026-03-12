/**
 * @sw-package innovation
 */

import template from './nosto-job-sub-jobs.html.twig';
import { getJobStatusLabel, getJobStatusTone, isJobRunningStatus } from '../../util/job-status.helper';
import fetchJobMessages from '../../util/job-messages.helper';
import './nosto-job-sub-jobs.scss';

const { Mixin } = Shopware;
const { Criteria } = Shopware.Data;

const MESSAGE_COUNT_KEYS = Object.freeze({
    TOTAL: 'total',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
});

function normalizeMessageCountKey(type) {
    if (type === MESSAGE_COUNT_KEYS.INFO || type === MESSAGE_COUNT_KEYS.WARNING) {
        return type;
    }

    return MESSAGE_COUNT_KEYS.ERROR;
}

/** @private */
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
            subJobs: null,
            showMessagesModal: false,
            currentJobMessages: null,
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

        jobChildrenColumns() {
            return [
                {
                    property: 'name',
                    dataIndex: 'name',
                    label: this.$tc('job-listing.page.listing.grid.column.name'),
                    allowResize: false,
                    inlineEdit: true,
                    width: '200px',
                },
                {
                    property: 'status',
                    dataIndex: 'status',
                    label: this.$tc('job-listing.page.listing.grid.column.status'),
                    allowResize: false,
                    inlineEdit: true,
                    width: '100px',
                },
                {
                    property: 'startedAt',
                    dataIndex: 'startedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.started-at'),
                    allowResize: false,
                    inlineEdit: true,
                    width: '150px',
                    sortable: true,
                },
                {
                    property: 'finishedAt',
                    dataIndex: 'finishedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.finished-at'),
                    allowResize: true,
                    inlineEdit: true,
                    width: '150px',
                },
                {
                    property: 'createdAt',
                    dataIndex: 'createdAt',
                    label: this.$tc('job-listing.page.listing.grid.column.created-at'),
                    allowResize: true,
                    inlineEdit: true,
                    width: '150px',
                },
                {
                    property: 'messages',
                    dataIndex: 'messages',
                    label: 'Messages',
                    allowResize: true,
                    inlineEdit: false,
                    width: '250px',
                    sortable: false,
                },
            ];
        },
    },

    created() {
        this.initModalData();
    },

    methods: {
        initModalData() {
            const criteria = new Criteria(this.page, this.limit);
            criteria.addFilter(Criteria.equals('parentId', this.jobId));
            criteria.addSorting(Criteria.sort('createdAt', 'DESC', false));
            this.jobRepository.search(criteria, Shopware.Context.api).then(jobItems => {
                this.subJobs = jobItems;
            });
        },

        rescheduleJob(jobId) {
            this.NostoRescheduleService.rescheduleJob(jobId).then(() => {
                this.createNotificationSuccess({
                    message: 'Job has been rescheduled successfully.',
                });
                this.initModalData();
            }).catch(() => {
                this.createNotificationError({
                    message: 'Unable reschedule job.',
                });
            });
        },

        getMessageCounts(job) {
            return job?.extensions?.jobCounts?.messages
                ?? job?.jobCounts?.messages
                ?? {};
        },

        getMessagesCount(job, type) {
            const counts = this.getMessageCounts(job);
            const key = normalizeMessageCountKey(type);

            return Number(counts[key] ?? 0);
        },

        getMessagesTotalCount(job) {
            const counts = this.getMessageCounts(job);

            return Number(counts[MESSAGE_COUNT_KEYS.TOTAL] ?? 0);
        },

        showMessageModal(job) {
            const jobId = job?.id;
            if (!jobId) {
                return;
            }

            this.currentJobMessages = [];
            this.showMessagesModal = true;

            const expectedTotal = this.getMessagesTotalCount(job);
            fetchJobMessages({
                messageRepository: this.messageRepository,
                jobId,
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
    },
};
