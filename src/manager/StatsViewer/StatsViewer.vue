<template>
    <div>
        <MainChart class="chart" :stats='stats.month'/>
    </div>
</template>

<style lang="scss" scoped>
 .chart {
     height: 220px;
 }
</style>

<script>
    import MainChart from "./MainChart.vue"

    export default {
        props: {
            stats: {
                type: Object,
                default () {
                    return {}
                }
            }
        },
        components: {
            MainChart
        }
    }
</script>