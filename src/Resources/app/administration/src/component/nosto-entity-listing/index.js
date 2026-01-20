/**
 * @sw-package innovation
 */

import template from './nosto-entity-listing.html.twig';
import './nosto-entity-listing.scss';

const { Component } = Shopware;

Component.extend('nosto-entity-listing', 'sw-entity-listing', {
    template,

    emits: ['select-all-items', 'select-item'],

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
            default: () => [],
        },
    },

    data() {
        return {
            /** @type {Array} */
            records: this.items,
            selection: { ...this.preSelection || {} },
            successItems: false,
            pendingItems: false,
            errorItems: false,
            reloadInterval: null,
        };
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('nosto_scheduler_job');
        },
    },

    methods: {
        canDelete(item) {
            return ['error', 'succeed'].indexOf(item.status) !== -1;
        },

        selectAll(selected) {
            this.selection = {};
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
            const identifier = item[this.itemIdentifierProperty];

            if (selected) {
                this.selection[identifier] = item;
            } else if (!selected && selection[identifier]) {
                delete this.selection[identifier];
            }

            this.$emit('select-item', this.selection, item, selected);
        },
    },
});
