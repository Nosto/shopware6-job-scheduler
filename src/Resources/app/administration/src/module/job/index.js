import './page/job-listing-index';
import './page/job-detail-index';

import enGB from './snippet/en-GB.json';

const {Module} = Shopware;

Module.register('job-listing', {
    type: 'plugin',
    title: 'job-listing.general.title',
    description: 'job-listing.general.description',
    color: '#F88962',
    icon: 'default-avatar-multiple',

    snippets: {
        'en-GB': enGB,
    },

    routes: {
        index: {
            component: 'job-listing-index',
            path: 'index'
        },

        detail: {
            component: 'job-detail-index',
            path: 'detail/:id',
            props: {
                default: ($route) => {
                    return { jobId: $route.params.id };
                },
            },
        }
    },

    navigation: [
        {
            id: 'job-listing',
            label: 'job-listing.menu.title',
            color: '#F88962',
            icon: 'default-avatar-multiple',
            parent: 'sw-marketing',
            path: 'job.listing.index',
            position: 100
        }
    ],

})
