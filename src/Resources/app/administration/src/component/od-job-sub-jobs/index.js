import template from './od-job-sub-jobs.html.twig';

const {Component} = Shopware;
const {Criteria} = Shopware.Data;

Component.register('od-job-sub-jobs', {
    template,

    inject: [
        'OdRescheduleService',
        'repositoryFactory'
    ],

    mixins: [
        'notification',
    ],

    props: {
        jobId: {
            type: String,
            required: false,
            default: null,
        }
    },

    data() {
        return {
            subJobs: null,
            showMessagesModal: false,
            currentJobMessages: null
        }
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('od_scheduler_job');
        },

        jobChildrenColumns() {
            return [
                {
                    property: 'name',
                    dataIndex: 'name',
                    label: this.$tc('job-listing.page.listing.grid.column.name'),
                    allowResize: false,
                    inlineEdit: true,
                    width: '200px'
                },
                {
                    property: 'status',
                    dataIndex: 'status',
                    label: this.$tc('job-listing.page.listing.grid.column.status'),
                    allowResize: false,
                    inlineEdit: true,
                    width: '100px'
                },
                {
                    property: 'startedAt',
                    dataIndex: 'startedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.started-at'),
                    allowResize: false,
                    inlineEdit: true,
                    width: '150px'
                },
                {
                    property: 'finishedAt',
                    dataIndex: 'finishedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.finished-at'),
                    allowResize: true,
                    inlineEdit: true,
                    width: '150px'
                },
                {
                    property: 'createdAt',
                    dataIndex: 'createdAt',
                    label: this.$tc('job-listing.page.listing.grid.column.created-at'),
                    allowResize: true,
                    inlineEdit: true,
                    width: '150px'
                },
                {
                    property: 'actions',
                    dataIndex: 'actions',
                    label: 'Actions',
                    allowResize: true,
                    inlineEdit: false,
                    width: '300px'
                },
            ];
        },

        jobMessagesColumns() {
            return [
                {
                    property: 'message',
                    dataIndex: 'message',
                    label: this.$tc('job-listing.page.listing.grid.column.message'),
                    allowResize: false,
                    align: 'left',
                    width: '90px'
                }
            ]
        },
    },

    created() {
        this.initModalData();
    },

    methods: {
        initModalData() {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('parentId', null));
            criteria.addSorting(Criteria.sort('createdAt', 'DESC', false));
            criteria.addAssociation('subJobs');
            criteria.addAssociation('subJobs.messages');
            this.jobRepository.get(this.jobId, Shopware.Context.api, criteria).then(jobItem => {
                if (jobItem.subJobs.length > 0) {
                    this.subJobs = jobItem.subJobs;
                }
            });
        },

        rescheduleJob(jobId) {
            this.OdRescheduleService.rescheduleJob(jobId).then(() => {
                this.createNotificationSuccess({
                    message: "Job has been rescheduled successfully.",
                });
                this.initPageData();
            }).catch(() => {
                this.createNotificationError({
                    message: "Unable reschedule job.",
                });
            })
        },

        showMessageModal(messages) {
            this.currentJobMessages = messages;
            this.showMessagesModal = true;
        },
    }
});
