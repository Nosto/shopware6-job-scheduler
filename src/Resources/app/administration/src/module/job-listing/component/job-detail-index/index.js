import template from './job-detail-index.html.twig';
import './job-detail-index.scss';

const { Component } = Shopware;
const { Criteria } = Shopware.Data;

Component.register('job-detail-index', {
    template,

    inject: [
        'repositoryFactory'
    ],

    props: {
        orderId: {
            type: String,
            required: false,
            default: null,
        },
    },
});