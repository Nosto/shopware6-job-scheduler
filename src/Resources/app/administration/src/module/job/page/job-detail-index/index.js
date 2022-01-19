import template from './job-detail-index.html.twig';
import './job-detail-index.scss';

const {Component} = Shopware;
const {Criteria} = Shopware.Data;

Component.register('job-detail-index', {
    template,

    inject: [
        'repositoryFactory'
    ],

    props: {
        jobId: {
            type: String,
            required: false,
            default: null,
        }
    },

    data: function () {

        return {
            parentRoute: null,
            jobItem: null,
            jobChildren: null,
            jobMessages: null,
            displayedLog: null
        }
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('od_scheduler_job');
        },
        jobMessagesRepository() {
            return this.repositoryFactory.create('od_scheduler_job_message');
        },
        jobChildrenColumns() {
            return this.getJobChildrenColumns();
        },
        jobMessagesColumns() {
            return this.getJobMessagesColumns();
        }
    },

    created() {
        this.createdComponent();
        this.getJobChildren();
        this.getJobMessages();
    },

    mounted() {
        this.mountedComponent();
    },

    methods: {
        createdComponent() {
            return this.jobRepository.get(this.jobId, Shopware.Context.api, new Criteria()).then(jobItem => {
                this.jobItem = jobItem;
            });
        },

        getJobChildren() {

            const criteria = new Criteria();
            criteria.addFilter(Criteria.equalsAny('parentId', [this.jobId]));

            return this.jobRepository.search(criteria, Shopware.Context.api).then(jobChildren => {
                this.jobChildren = jobChildren;
            });
        },

        getJobChildrenColumns() {
            return [
                {
                    property: 'status',
                    dataIndex: 'status',
                    label: this.$tc('job-listing.page.listing.grid.column.status'),
                    allowResize: false,
                    align: 'right',
                    inlineEdit: true,
                    width: '90px'
                },
                {
                    property: 'name',
                    dataIndex: 'name',
                    label: this.$tc('job-listing.page.listing.grid.column.name'),
                    allowResize: false,
                    align: 'right',
                    inlineEdit: true,
                    width: '90px'
                },
                {
                    property: 'startedAt',
                    dataIndex: 'startedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.started-at'),
                    allowResize: false,
                    align: 'right',
                    inlineEdit: true,
                    width: '90px'
                },
                {
                    property: 'finishedAt',
                    dataIndex: 'finishedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.finished-at'),
                    allowResize: true,
                    align: 'right',
                    inlineEdit: true,
                    width: '90px'
                },
                {
                    property: 'createdAt',
                    dataIndex: 'createdAt',
                    label: this.$tc('job-listing.page.listing.grid.column.created-at'),
                    allowResize: true,
                    align: 'right',
                    inlineEdit: true,
                    width: '90px'
                },
            ];
        },

        getJobMessages() {

            const criteria = new Criteria();
            criteria.addFilter(Criteria.equalsAny('jobId', [this.jobId]));

            return this.jobMessagesRepository.search(criteria, Shopware.Context.api).then(jobMessages => {
                this.jobMessages = jobMessages;
            });
        },

        getJobMessagesColumns() {
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

        mountedComponent() {
            this.initPage();
        },

        disableRescheduling(item) {
            return item.status !== 'failed';
        },

        disableShowJobMessages() {
            return !(this.jobMessages && this.jobMessages.total > 0);

        },

        rescheduleJob() {
            return true;
        },

        initPage() {
            if (this.$route.meta.parentPath) {
                this.parentRoute = this.$route.meta.parentPath;
            }
        },

        showModal() {
            return this.displayedLog = true;
        },

        closeModal() {
            this.displayedLog = null;
            console.log(this.displayedLog + '2');
        },
    }
});