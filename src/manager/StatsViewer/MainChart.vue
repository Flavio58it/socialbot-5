<script>
    import { Line, mixins } from 'vue-chartjs'

    const colors = [
        "green",
        "yellow",
        "lightblue",
        "pink",
        "violet"
    ]

   function transformFromCamelCase (string) {
       return string
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function(str){ return str.toUpperCase(); })
   }        

    export default {
        props: {
            stats: {
                type: Array,
                default () {
                    return []
                }
            }
        },
        data () {
            return {
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            },
                            gridLines: {
                                color: "rgba(0, 0, 0, 0.05)"
                            }   
                        }],
                        xAxes: [{
                            gridLines: {
                                color: "rgba(0, 0, 0, 0.05)"
                            }
                        }]
                    },
                    elements: {
                        point:{
                            radius: 0
                        }
                    }
                }
            }
        },
        mounted () {
            if (this.stats && this.stats.length)
                this.updateChart(this.stats)
        },
        watch: {
            stats: function () {
                this.updateChart(this.stats)
            }
        },
        methods: {
            updateChart(data) {
                console.log("Received data", data)
                var retroDays = [], retroData = {};
                
                var keyIndex = 0;

                // The chart shows stats in the latest 29 days (starting from yesterday)
                data.forEach((dayStats, index) => {
                    var date = new Date()
                    date.setDate(date.getDate() - (index + 2))

                    retroDays.push(date.getDate() + "/" + (date.getMonth() + 1))

                    for (let key in dayStats) {
                        let dayData = dayStats[key];

                        if (!retroData[key]) {
                            retroData[key] = {
                                label: transformFromCamelCase(key),
                                data: [dayData],
                                backgroundColor: [colors[keyIndex]]
                            }
                            keyIndex += 1
                        } else {
                            retroData[key].data.push(dayData)
                        }
                    }
                });

                const datasets = []

                for (let key in retroData) {
                    datasets.push(retroData[key])
                }

                this.renderChart({
                    labels: retroDays,
                    datasets
                }, this.options)
            }
        },
        extends: Line
    }
</script>