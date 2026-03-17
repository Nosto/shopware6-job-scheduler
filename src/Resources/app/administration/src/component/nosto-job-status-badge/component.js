/**
 * @sw-package innovation
 */

import template from './nosto-job-status-badge.html.twig';
import { getJobStatusLabel, getJobStatusTone, isJobRunningStatus } from '../../util/job-status.helper';
import './nosto-job-status-badge.scss';

/** @private */
export default {
    template,

    props: {
        status: {
            type: String,
            required: true,
        },
        showLabel: {
            type: Boolean,
            required: false,
            default: false,
        },
    },

    computed: {
        tone() {
            return getJobStatusTone(this.status);
        },

        label() {
            return getJobStatusLabel(this.status, (key) => this.$tc(key));
        },

        isRunning() {
            return isJobRunningStatus(this.status);
        },

        classes() {
            return [
                `is-${this.tone}`,
                {
                    'has-label': this.showLabel,
                    'is-running': this.isRunning,
                },
            ];
        },
    },
};
