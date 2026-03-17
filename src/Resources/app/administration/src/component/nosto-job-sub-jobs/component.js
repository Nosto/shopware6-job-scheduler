/**
 * @sw-package innovation
 */

import template from './nosto-job-sub-jobs.html.twig';
import JobHelper from '../../util/job.helper';
import fetchJobMessages from '../../util/job-messages.helper';
import './nosto-job-sub-jobs.scss';

const { Criteria } = Shopware.Data;

const MESSAGE_COUNT_KEYS = Object.freeze({
    TOTAL: 'total',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
});

function getRawMessageCounts(job) {
    const fieldCounts = job && job.jobCounts && job.jobCounts.messages ? job.jobCounts.messages : {};
    const extensionCounts = job && job.extensions && job.extensions.jobCounts && job.extensions.jobCounts.messages
        ? job.extensions.jobCounts.messages
        : {};

    return {
        ...extensionCounts,
        ...fieldCounts,
    };
}

function normalizeMessageCountKey(type) {
    if (type === MESSAGE_COUNT_KEYS.INFO || type === MESSAGE_COUNT_KEYS.WARNING) {
        return type;
    }

    return MESSAGE_COUNT_KEYS.ERROR;
}

function buildMessageCounts(job) {
    const jobCounts = getRawMessageCounts(job);
    if (Object.keys(jobCounts).length > 0) {
        const infoCount = Number(jobCounts[MESSAGE_COUNT_KEYS.INFO] == null ? 0 : jobCounts[MESSAGE_COUNT_KEYS.INFO]);
        const warningRawCount = jobCounts[MESSAGE_COUNT_KEYS.WARNING];
        const warningCount = Number(warningRawCount == null ? 0 : warningRawCount);
        const errorCount = Number(jobCounts[MESSAGE_COUNT_KEYS.ERROR] == null ? 0 : jobCounts[MESSAGE_COUNT_KEYS.ERROR]);

        return {
            [MESSAGE_COUNT_KEYS.TOTAL]: Number(
                jobCounts[MESSAGE_COUNT_KEYS.TOTAL] == null
                    ? (infoCount + warningCount + errorCount)
                    : jobCounts[MESSAGE_COUNT_KEYS.TOTAL],
            ),
            [MESSAGE_COUNT_KEYS.INFO]: infoCount,
            [MESSAGE_COUNT_KEYS.WARNING]: warningCount,
            [MESSAGE_COUNT_KEYS.ERROR]: errorCount,
        };
    }

    const messages = job && job.messages ? job.messages : [];
    const infoCount = messages.filter((item) => item.type === 'info-message').length;
    const warningCount = messages.filter((item) => item.type === 'warning-message').length;
    const errorCount = messages.filter((item) => item.type === 'error-message').length;

    return {
        [MESSAGE_COUNT_KEYS.TOTAL]: messages.length,
        [MESSAGE_COUNT_KEYS.INFO]: infoCount,
        [MESSAGE_COUNT_KEYS.WARNING]: warningCount,
        [MESSAGE_COUNT_KEYS.ERROR]: errorCount,
    };
}

/** @private */
export default {
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
            criteria.addAssociation('messages');
            this.jobRepository.search(criteria, Shopware.Context.api).then(jobItems => {
                this.subJobs = JobHelper.sortMessages(jobItems);
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
            return buildMessageCounts(job);
        },

        getMessagesCount(job, type) {
            const counts = this.getMessageCounts(job);
            const key = normalizeMessageCountKey(type);

            return Number(counts[key] == null ? 0 : counts[key]);
        },

        getMessagesTotalCount(job) {
            const counts = this.getMessageCounts(job);

            return Number(counts[MESSAGE_COUNT_KEYS.TOTAL] == null ? 0 : counts[MESSAGE_COUNT_KEYS.TOTAL]);
        },

        showMessageModal(job) {
            const jobId = job && job.id ? job.id : null;
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
    },
};
