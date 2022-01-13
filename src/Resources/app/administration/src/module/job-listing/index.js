import './component/job-listing-index';

const {Module} = Shopware;

Module.register('job-listing', {
    type: 'plugin',
    title: 'job-listing.general.title',
    description: 'job-listing.general.description',
    color: '#F88962',
    icon: 'default-avatar-multiple',

    routes: {
        index: {
            component: 'job-listing-index',
            path: 'index'
        }
    },

    navigation: [
        {
            id: 'job-listing',
            label: 'job-listing.menu.title',
            color: '#F88962',
            icon: 'default-avatar-multiple',
            parent: 'sw-marketing',
            position: 100
        },
        {
            label: 'job-listing.general.title',
            color: '#77ff3d',
            icon: 'small-default-stack-line2',
            path: 'job.listing.index',
            parent: 'job-listing',
            position: 100
        },
    ],

})
