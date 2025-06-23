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
            required: false,
            default: null,
        },
    },

    data() {
        return {
            subJobs: [],
            showMessagesModal: false,
            currentJobMessages: null,
            statusFilter: 'all',
            nameFilter: '',
            isLoading: true,
            sortBy: 'createdAt',
            sortDirection: 'DESC',
            page: 1,
            limit: 25
        };
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('nosto_scheduler_job');
        },
        nameOptions() {
            if (!this.subJobs || !Array.isArray(this.subJobs)) {
                return [];
            }
            const names = this.subJobs.map(job => job.name).filter(Boolean);
            return [...new Set(names)];
        },
        statusOptions() {
            if (!this.subJobs || !Array.isArray(this.subJobs)) {
                return [];
            }
            const statuses = this.subJobs.map(job => job.status).filter(Boolean);
            return [...new Set(statuses)];
        },
        filteredSubJobs() {
            if (!this.subJobs || !Array.isArray(this.subJobs)) {
                return [];
            }

            let jobs = this.subJobs;

            if (this.statusFilter !== 'all') {
                jobs = jobs.filter(job => job.status === this.statusFilter);
            }

            if (this.nameFilter && this.nameFilter.trim() !== '') {
                jobs = jobs.filter(job => job.name === this.nameFilter);
            }

            return jobs;
        },

        jobChildrenColumns() {
            return [
                {
                    property: 'name',
                    dataIndex: 'name',
                    label: this.$tc('job-listing.page.listing.grid.column.name'),
                    allowResize: true,
                    primary: true,
                    sortable: true,
                    width: '250px'
                },
                {
                    property: 'status',
                    dataIndex: 'status',
                    label: this.$tc('job-listing.page.listing.grid.column.status'),
                    allowResize: true,
                    sortable: true,
                    width: '150px'
                },
                {
                    property: 'startedAt',
                    dataIndex: 'startedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.started-at'),
                    allowResize: true,
                    sortable: true,
                    width: '150px'
                },
                {
                    property: 'finishedAt',
                    dataIndex: 'finishedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.finished-at'),
                    allowResize: true,
                    width: '150px'
                },
                {
                    property: 'createdAt',
                    dataIndex: 'createdAt',
                    label: this.$tc('job-listing.page.listing.grid.column.created-at'),
                    allowResize: true,
                    width: '150px'
                },
                {
                    property: 'messages',
                    dataIndex: 'messages',
                    label: this.$tc('job-listing.page.listing.grid.column.messages'),
                    allowResize: true,
                    width: '250px',
                    sortable: false
                }
            ];
        }
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
                const criteria = new Criteria();
                criteria.addFilter(Criteria.equals('parentId', this.jobId));
                criteria.addSorting(Criteria.sort(this.sortBy, this.sortDirection));
                criteria.addAssociation('messages');

                const result = await this.jobRepository.search(criteria, Shopware.Context.api);
                this.subJobs = JobHelper.sortMessages(result);
            } catch (error) {
                console.error('Error loading sub jobs:', error);
                this.createNotificationError({
                    message: this.$tc('job-listing.errors.load-sub-jobs-error'),
                });
                this.subJobs = [];
            } finally {
                this.isLoading = false;
            }
        },

        onSortColumn(column) {
            this.sortBy = column.dataIndex;
            this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
            this.loadSubJobs();
        },

        onPageChange(params) {
            this.page = params.page || 1;
            this.limit = params.limit || 25;
        },

        rescheduleJob(jobId) {
            this.NostoRescheduleService.rescheduleJob(jobId).then(() => {
                this.createNotificationSuccess({
                    message: this.$tc('job-listing.actions.reschedule-job.success'),
                });
                this.loadSubJobs();
            }).catch(() => {
                this.createNotificationError({
                    message: this.$tc('job-listing.actions.reschedule-job.error'),
                });
            });
        },

        showMessageModal(messages) {
            this.currentJobMessages = messages;
            this.showMessagesModal = true;
        },

        getMessagesCount(job, type) {
            if (!job.messages) {
                return 0;
            }
            return job.messages.filter((item) => {
                return item.type === `${type}-message`;
            }).length;
        },

        showMessages(item) {
            this.currentJobMessages = item.messages;
            this.showMessagesModal = true;
        },
    }
});
