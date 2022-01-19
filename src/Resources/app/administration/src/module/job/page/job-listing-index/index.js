import template from './job-listing-index.html.twig';
import './job-listing-index.scss';

const {Component} = Shopware;
const {Criteria} = Shopware.Data;

Component.register('job-listing-index', {
    template,

    inject: [
        'repositoryFactory'
    ],

    props: {
        type: {
            type: String,
            required: true,
            default: 'test'
        }
    },

    computed: {
        columns() {
            return this.getColumns();
        },

        jobRepository() {
            return this.repositoryFactory.create('od_scheduler_job');
        }
    },

    created() {
        this.createdComponent();
    },

    data: function () {
        return {
            jobItems: null
        }
    },

    methods: {
        createdComponent() {

            const criteria = new Criteria();
            criteria.addFilter(Criteria.equalsAny('type', [this.type]));

            return this.jobRepository.search(criteria, Shopware.Context.api).then(jobItems => {
                this.jobItems = jobItems;
            });

        },

        getColumns() {
            return [
                {
                    property: 'status',
                    label: this.$tc('job-listing.page.listing.grid.column.status'),
                    allowResize: true
                },
                {
                    property: 'name',
                    label: this.$tc('job-listing.page.listing.grid.column.name'),
                    allowResize: true
                },
                {
                    property: 'startedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.started-at'),
                    allowResize: true
                },
                {
                    property: 'finishedAt',
                    label: this.$tc('job-listing.page.listing.grid.column.finished-at'),
                    allowResize: true
                },
                {
                    property: 'createdAt',
                    label: this.$tc('job-listing.page.listing.grid.column.created-at'),
                    allowResize: true
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
