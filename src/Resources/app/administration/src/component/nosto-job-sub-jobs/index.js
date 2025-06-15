import template from './nosto-job-sub-jobs.html.twig';
import JobHelper from '../../util/job.helper';
import './nosto-job-sub-jobs.scss';

const { Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;

/** @private */
Component.register('nosto-job-sub-jobs', {
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
            required: true
        },
    },

    data() {
        return {
            subJobs: [],
            showMessagesModal: false,
            currentJobMessages: null,
            statusFilter: 'all',
            isLoading: true,
            sortBy: 'createdAt',
            sortDirection: 'DESC',
            total: 0,
            page: 1,
            limit: 25,
        };
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('nosto_scheduler_job');
        },
        filteredSubJobs() {
            if (!this.subJobs || !Array.isArray(this.subJobs)) {
                return [];
            }

            let jobs = this.subJobs;

            if (this.statusFilter !== 'all') {
                jobs = jobs.filter(job => job.status === this.statusFilter);
            }

            return jobs;
        },

        jobChildrenColumns() {
            return [
                {
                    property: 'name',
                    dataIndex: 'name',
                    label: 'Name',
                    allowResize: true,
                    primary: true,
                    sortable: true,
                    width: '250px'
                },
                {
                    property: 'status',
                    dataIndex: 'status',
                    label: 'Status',
                    allowResize: true,
                    sortable: true,
                    width: '150px'
                },
                {
                    property: 'startedAt',
                    dataIndex: 'startedAt',
                    label: 'Started at',
                    allowResize: true,
                    sortable: true,
                    width: '200px'
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
        this.loadSubJobs();
    },

    methods: {
        async loadSubJobs() {
            if (!this.jobId) {
                return;
            }

            this.isLoading = true;

            try {
                const criteria = new Criteria(this.page, this.limit);
                criteria.addFilter(Criteria.equals('parentId', this.jobId));
                criteria.addSorting(Criteria.sort(this.sortBy, this.sortDirection));
                criteria.addAssociation('messages');

                const result = await this.jobRepository.search(criteria, Shopware.Context.api);

                this.total = result.total;
                this.subJobs = result;

                console.log('Loaded sub jobs:', this.subJobs); // Debug log
            } catch (error) {
                console.error('Error loading sub jobs:', error);
                this.createNotificationError({
                    message: this.$tc('job-listing.errors.load-sub-jobs-error'),
                });
            } finally {
                this.isLoading = false;
            }
        },

        onSortColumn(column) {
            this.sortBy = column.dataIndex;
            this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
            this.loadSubJobs();
        },

        onPageChange({ page, limit }) {
            this.page = page;
            this.limit = limit;
            this.loadSubJobs();
        },

        rescheduleJob(jobId) {
            this.NostoRescheduleService.rescheduleJob(jobId).then(() => {
                this.createNotificationSuccess({
                    message: 'Job has been rescheduled successfully.',
                });
                this.initPageData();
            }).catch(() => {
                this.createNotificationError({
                    message: 'Unable reschedule job.',
                });
            });
        },

        showMessageModal(messages) {
            this.currentJobMessages = messages;
            this.showMessagesModal = true;
        },

        getMessagesCount(item, type) {
            if (!item.messages) {
                return 0;
            }
            return item.messages.filter(message => {
                switch(type) {
                    case 'info':
                        return message.type === 'info-message';
                    case 'warning':
                        return message.type === 'warning-message';
                    case 'error':
                        return message.type === 'error-message';
                    default:
                        return false;
                }
            }).length;
        },

        showMessages(item) {
            this.currentJobMessages = item.messages;
            this.showMessagesModal = true;
        },
    },
});
