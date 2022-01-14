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
            jobItem: null,
            jobChildren: null
        }
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('od_scheduler_job');
        },
        jobChildrenColumns() {
            return this.getJobChildrenColumns();
        },
    },

    created() {
        this.createdComponent();
        this.getJobChildren();
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

        disableRescheduling(item) {
            if (item.status !== 'failed') {
                return true;
            }

            return false;
        },

        rescheduleJob() {
            return true;
        }
    }
});