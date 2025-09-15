/**
 * @sw-package innovation
 */
/* eslint-env es6 */

import template from './nosto-job-status-badge.html.twig';

/** @private */
export default {
    template,

    props: {
        status: {
            type: String,
            required: true,
        },
    },

    computed: {
        additionalClass() {
            return this.status === 'running' ? '--pulse' : '';
        },

        variant() {
            switch (this.status) {
                case 'error':
                    return 'error';
                case 'succeed':
                case 'running':
                    return 'success';
                default:
                    return '';
            }
        },
    },
};
