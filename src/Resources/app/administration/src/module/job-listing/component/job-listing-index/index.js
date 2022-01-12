import template from './job-listing-index.html.twig';
import './job-listing-index.scss';

const {Component} = Shopware;
const {Criteria} = Shopware.Data;

Component.register('job-listing-index', {
    template,

    inject: [
        'repositoryFactory'
    ],

    computed: {
        columns() {
            return this.getColumns();
        }
    },

    created() {
        this.createdComponent();
    },

    data: function () {
        return {
            repository: null,
            result: null
        }
    },

    methods: {
        createdComponent() {
            this.repository = this.repositoryFactory.create('od_scheduler_job');

            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('type','test'));

            return this.repository.search(criteria,Shopware.Context.api).then(result => {
                this.result = result;
            });

        },

        getColumns() {
            return [
                {
                    property: 'id',
                    label: this.$tc('job-listing.page.listing.grid.column.id'),
                    allowResize: true,
                    primary: true
                },
                {
                    property: 'status',
                    label: this.$tc('job-listing.page.listing.grid.column.status'),
                    allowResize: true
                },
                {
                    property: 'type',
                    label: this.$tc('job-listing.page.listing.grid.column.type'),
                    allowResize: true
                },
                {
                    property: 'name',
                    label: this.$tc('job-listing.page.listing.grid.column.name'),
                    allowResize: true
                },
                {
                    property: 'message',
                    label: this.$tc('job-listing.page.listing.grid.column.message'),
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
            ];
        },
    }
});
