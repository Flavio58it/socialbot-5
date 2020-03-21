<script>
    import { Line, mixins } from 'vue-chartjs'

    export default {
        props: ['stats'],
        data () {
            return {
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        },
        mounted () {
            if (this.stats)
                this.updateChart(this.data.stats)
        },
        watch: {
            stats: function () {
                this.updateChart(this.data.stats)
            }
        },
        methods: {
            updateChart(data) {
                console.log(data)
                this.renderChart(data, this.options)
            }
        },
        extends: Line
    }
</script>