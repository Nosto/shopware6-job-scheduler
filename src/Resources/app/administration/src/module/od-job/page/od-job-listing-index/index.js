import template from './od-job-listing-index.html.twig';
import './od-job-listing-index.scss';

const {Component} = Shopware;
const {Criteria} = Shopware.Data;

Component.register('od-job-listing-index', {
    template,

    inject: [
        'OdRescheduleService',
        'repositoryFactory',
    ],

    mixins: [
        'notification',
    ],

    props: {
        autoReloadInterval: {
            type: Number,
            required: false,
            default: () => 0
        },
        autoLoadIsActive: {
            type: Boolean,
            required: false,
            default: false
        },
        isGroupedView: {
            type: Boolean,
            required: false,
            default: false
        },
        jobTypes: {
            type: Array,
            required: false,
            default: () => []
        }
    },

    watch: {
        autoLoadIsActive() {
            this._handleAutoReload(this.autoLoadIsActive);
        }
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('od_scheduler_job');
        },

        messageRepository() {
            return this.repositoryFactory.create('od_scheduler_job_message');
        },

        columns() {
            return [
                {
                    property: 'name',
                    label: this.$tc('job-listing.page.listing.grid.column.name'),
                    allowResize: true,
                    width: '500px',
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
                    label: 'Sub jobs',
                    allowResize: true,
                    width: '250px',
                    visible: true,
                    sortable: false,
                },
                {
                    property: 'messages',
                    label: 'Messages',
                    allowResize: true,
                    width: '350px',
                    visible: true,
                    sortable: false,
                }
            ];
        },
    },

    created() {
        this.createdComponent();
    },

    data: function () {
        return {
            jobItems: null,
            isLoading: false,
            reloadInterval: null
        }
    },

    methods: {
        createdComponent() {
            this.getList();
        },

        _handleAutoReload(active) {
            if (active && this.autoReloadInterval > 0) {
                this.reloadInterval = setInterval(() => {
                    this.updateList()
                }, this.autoReloadInterval);
            } else {
                clearInterval(this.reloadInterval);
            }
        },

        pageChange() {
            this.$emit('stop-auto-loading');
            clearInterval(this.reloadInterval);
        },

        getLinkParams(item) {
            return {
                id: item.id,
                backPath: this.$route.name
            };
        },

        updateList() {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('parentId', null));
            criteria.addSorting(Criteria.sort('createdAt', 'DESC', false));
            criteria.addAssociation('messages');
            criteria.addAssociation('subJobs');

            if (this.jobTypes !== []) {
                criteria.addFilter(Criteria.equalsAny('type', this.jobTypes));
            }

            return this.jobRepository.search(criteria, Shopware.Context.api).then(jobItems => {
                this.jobItems = jobItems;
            });
        },

        getMessagesCount(job, type) {
            if (type === 'info') {
                let infoCounter = 0;
                for (const message of job.messages) {
                    if (message.type === 'info-message') {
                        infoCounter++
                    }
                }
                return infoCounter;
            }

            if (type === 'warning') {
                let warningCounter = 0;
                for (const message of job.messages) {
                    if (message.type === 'warning-message') {
                        warningCounter++
                    }
                }
                return warningCounter;
            }

            if (type === 'error') {
                let errorCounter = 0;
                for (const message of job.messages) {
                    if (message.type === 'error-message') {
                        errorCounter++
                    }
                }
                return errorCounter;
            }
        },

        getChildrenCount(job, type) {
            if (type === 'succeed') {
                let succeedCounter = 0;
                for (const sub of job.subJobs) {
                    if (sub.status === 'succeed') {
                        succeedCounter++
                    }
                }
                return succeedCounter;
            }

            if (type === 'pending') {
                let pendingCounter = 0;
                for (const sub of job.subJobs) {
                    if (sub.status === 'pending') {
                        pendingCounter++
                    }
                }
                return pendingCounter;
            }

            if (type === 'error') {
                let errorCounter = 0;
                for (const sub of job.subJobs) {
                    if (sub.status === 'error') {
                        errorCounter++
                    }
                }
                return errorCounter;
            }
        },

        getList() {
            this.isLoading = true;
            this.updateList().then(() => {
                this.isLoading = false
            })
        },

        onRefresh() {
            this.getList();
        },

        canReschedule(item) {
            return item.status === 'error';
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
            this.OdRescheduleService.rescheduleJob(jobId).then(() => {
                this.createNotificationSuccess({
                    message: "Job has been rescheduled successfully.",
                });
                this.updateList();
            }).catch(() => {
                this.createNotificationError({
                    message: "Unable reschedule job.",
                });
            })
        },
    },

    beforeDestroy() {
        clearInterval(this.reloadInterval)
    },
});
