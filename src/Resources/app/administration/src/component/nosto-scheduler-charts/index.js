import template from './nosto-scheduler-charts.html.twig';
import './nosto-scheduler-charts.scss';

const { Component } = Shopware;
const { Criteria } = Shopware.Data;

/** @private */
Component.register('nosto-scheduler-charts', {
    template,

    inject: [
        'repositoryFactory',
    ],

    mixins: [
        'notification',
    ],

    props: {
        jobTypes: {
            type: Array,
            required: false,
            default: () => [],
        },

        sortType: {
            type: String,
            required: true,
            default: () => 'status',
        },
    },

    data() {
        return {
            items: null,
            statisticDateRanges: {
                value: '30Days',
                options: {
                    '30Days': 30,
                    '14Days': 14,
                    '7Days': 7,
                    '24Hours': 24,
                    yesterday: 1,
                },
            },
            chartSeries: [],
            colors: {
                0: '#FF8C00',
                1: '#0044ee',
                2: '#9400D3',
                3: '#FFD700',
                4: '#008000',
                5: '#40E0D0',
                6: '#00BFFF',
                7: '#209d90',
                8: '#C71585',
                9: '#000000',
                10: '#F4A460',
            },
        };
    },

    computed: {
        jobRepository() {
            return this.repositoryFactory.create('nosto_scheduler_job');
        },

        getTimeUnitInterval() {
            const statisticDateRange = this.statisticDateRanges.value;

            if (statisticDateRange === 'yesterday' || statisticDateRange === '24Hours') {
                return 'hour';
            }

            return 'day';
        },

        dateAgo() {
            const date = new Date();
            const selectedDateRange = this.statisticDateRanges.value;
            const dateRange = this.statisticDateRanges.options[selectedDateRange] ?? 0;

            if (selectedDateRange === '24Hours') {
                date.setHours(date.getHours() - dateRange);

                return date;
            }

            date.setDate(date.getDate() - dateRange);
            date.setHours(0, 0, 0, 0);

            return date;
        },

        chartOptionsCount() {
            return {
                title: {
                    text: 'Jobs',
                    style: {
                        fontSize: '16px',
                        fontWeight: '600',
                    },
                },
                xaxis: {
                    type: 'datetime',
                    min: this.dateAgo.getTime(),
                    labels: {
                        datetimeUTC: false,
                    },
                },
                yaxis: {
                    min: 0,
                    tickAmount: 3,
                    labels: {
                        formatter: (value) => {
                            return parseInt(value, 10);
                        },
                    },
                },
            };
        },
    },

    watch: {
        sortType() {
            this.initChartData();
        },
    },

    created() {
        this.initChartData();
    },

    beforeDestroy() {
        clearInterval(this.reloadInterval);
    },

    methods: {
        initChartData() {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('parentId', null));
            criteria.setLimit(999999);

            if (this.jobTypes !== []) {
                criteria.addFilter(Criteria.equalsAny('type', this.jobTypes));
            }

            return this.jobRepository.search(criteria, Shopware.Context.api).then(items => {
                this.items = items;
                if (this.sortType === 'status') {
                    this.createStatusChartSeries(items);
                } else if (this.sortType === 'type') {
                    this.createTypeChartSeries(items);
                }
            });
        },

        createTypeChartSeries(items) {
            this.chartSeries = items.reduce((currentSeries, item, index) => {
                const date = this.parseDate(item.createdAt);
                const type = currentSeries.find((chart) => {
                    return chart.name === item.name;
                });
                const defaultItem = {
                    x: date,
                    y: 1,
                };

                if (!type) {
                    currentSeries.push({
                        name: item.name,
                        data: [defaultItem],
                        color: this.colors[index] ? this.colors[index] : this.getRandomColor(index),
                    });
                } else {
                    const dateIndex = type.data.findIndex(e => e.x === date);

                    if (dateIndex === -1) {
                        type.data.push(defaultItem);
                    } else {
                        type.data[dateIndex].y += 1;
                    }
                }

                return currentSeries;
            }, []);
        },

        createStatusChartSeries(items) {
            this.chartSeries = [
                {
                    name: this.$tc('job-listing.page.listing.grid.job-status.succeed'),
                    data: this.getDataByItemStatus(items, 'succeed'),
                    color: '#37d046',
                },
                {
                    name: this.$tc('job-listing.page.listing.grid.job-status.error'),
                    data: this.getDataByItemStatus(items, 'error'),
                    color: '#de294c',
                },
                {
                    name: this.$tc('job-listing.page.listing.grid.job-status.pending'),
                    data: this.getDataByItemStatus(items, 'pending'),
                    color: '#d1d9e0',
                },
            ];
        },

        getDataByItemStatus(items, status) {
            return items.filter(item => item.status === status)
                .reduce((currentSeries, item) => {
                    const date = this.parseDate(item.createdAt);
                    const existingIndex = currentSeries.findIndex(e => e.x === date);

                    if (existingIndex !== -1) {
                        currentSeries[existingIndex].y += 1;
                    } else {
                        currentSeries.push({
                            x: date,
                            y: 1,
                        });
                    }

                    return currentSeries;
                }, []);
        },

        getRandomColor() {
            const n = (Math.random() * 0xfffff * 1000000).toString(16);
            return `#${n.slice(0, 6)}`;
        },

        statusCharts() {
            return [
                {
                    name: this.$tc('job-listing.page.listing.grid.job-status.succeed'),
                    data: [],
                    color: '#37d046',
                },
                {
                    name: this.$tc('job-listing.page.listing.grid.job-status.error'),
                    data: [],
                    color: '#de294c',
                },
                {
                    name: this.$tc('job-listing.page.listing.grid.job-status.pending'),
                    data: [],
                    color: '#d1d9e0',
                },
            ];
        },

        parseDate(date) {
            date = date.substring(0, date.lastIndexOf('T') + 1);
            const parsedDate = new Date(date.replace(/-/g, '/').replace('T', ' '));
            return parsedDate.valueOf();
        },

        onRefresh() {
            this.initChartData();
        },
    },
});
