import template from './od-entity-listing.html.twig'
import './od-entity-listing.scss';

const {Component} = Shopware;
const {Criteria} = Shopware.Data;

Component.extend('od-entity-listing', 'sw-entity-listing', {
    template,

    props: {
        items: {
            type: Array,
            required: true,
        },

        itemIdentifierProperty: {
            type: String,
            required: false,
            default: 'id',
        },

        preSelection: {
            type: Object,
            required: false,
            default: null,
        },

        isGroupedView: {
            type: Boolean,
            required: false,
            default: false,
        },

        jobTypes: {
            type: Array,
            required: false,
            default: () => []
        },

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
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('od_scheduler_job');
        }
    },

    data() {
        return {
            /** @type {Array} */
            records: this.items,
            selection: Object.assign({}, this.preSelection || {}),
            successItems: false,
            pendingItems: false,
            errorItems: false,
            reloadInterval: null
        };
    },

    watch: {
        autoLoadIsActive() {
            this._handleAutoReload(this.autoLoadIsActive);
        },

        isGroupedView() {
            this._createGroupedView(this.isGroupedView);
        }
    },

    methods: {

        _handleAutoReload(active) {
            if (active &&  this.autoLoadIsActive && this.autoReloadInterval > 0) {
                this.reloadInterval = setInterval(() => {
                    this.updateList()
                }, this.autoReloadInterval);
            } else {
                clearInterval(this.reloadInterval);
            }
        },

        _createGroupedView(active) {
            if (active) {
                this._getSuccessItems();
                this._getErrorItems();
                this._getPendingItems();
            }
        },

        _getSuccessItems() {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('parentId', null));
            criteria.addFilter(Criteria.equals('status', 'succeed'));
            criteria.addSorting(Criteria.sort('createdAt', 'DESC', false));
            criteria.setLimit(9999999);
            criteria.addAssociation('messages');
            criteria.addAssociation('subJobs');


            if (this.jobTypes !== []) {
                criteria.addFilter(Criteria.equalsAny('type', this.jobTypes));
            }

            return this.jobRepository.search(criteria, Shopware.Context.api).then(jobItems => {
                this.successItems = jobItems;
            });
        },

        _getErrorItems() {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('parentId', null));
            criteria.addFilter(Criteria.equals('status', 'error'));
            criteria.addSorting(Criteria.sort('createdAt', 'DESC', false));
            criteria.setLimit(9999999);
            criteria.addAssociation('messages');

            if (this.jobTypes !== []) {
                criteria.addFilter(Criteria.equalsAny('type', this.jobTypes));
            }

            return this.jobRepository.search(criteria, Shopware.Context.api).then(jobItems => {
                this.errorItems = jobItems;
            });
        },

        _getPendingItems() {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('parentId', null));
            criteria.addFilter(Criteria.equals('status', 'pending'));
            criteria.addSorting(Criteria.sort('createdAt', 'DESC', false));
            criteria.setLimit(9999999);
            criteria.addAssociation('messages');

            if (this.jobTypes !== []) {
                criteria.addFilter(Criteria.equalsAny('type', this.jobTypes));
            }

            return this.jobRepository.search(criteria, Shopware.Context.api).then(jobItems => {
                this.pendingItems = jobItems;
            });
        },

        canDelete(item) {
            return ['error', 'succeed'].indexOf(item.status) !== -1;
        },

        selectAll(selected) {
            this.$delete(this.selection);
            this.records.forEach(item => {
                if (this.isSelected(item[this.itemIdentifierProperty]) !== selected) {
                    this.selectItem(selected, item);
                }
            });

            this.$emit('select-all-items', this.selection);
        },

        selectItem(selected, item) {
            if (!this.canDelete(item)) {
                return;
            }

            const selection = this.selection;

            if (selected) {
                this.$set(this.selection, item[this.itemIdentifierProperty], item);
            } else if (!selected && selection[item[this.itemIdentifierProperty]]) {
                this.$delete(this.selection, item[this.itemIdentifierProperty]);
            }

            this.$emit('select-item', this.selection, item, selected);
        },
    },

    beforeDestroy() {
        clearInterval(this.reloadInterval)
    },
});
