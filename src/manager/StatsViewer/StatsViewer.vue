<template>
    <div>
        <MainChart class="chart" :stats='stats.month'/>
        <b class="todayStatsTitle">Today stats</b>
        <b-row>
            <b-col>
                <StatsCol
                    :qty="stats.today[0].likes"
                    :refQty="stats.month[0].likes"
                    category="likes"
                />
            </b-col>
            <b-col>
                <StatsCol
                    :qty="stats.today[0].likeBack"
                    :refQty="stats.month[0].likeBack"
                    category="liked back"
                />
            </b-col>
            <b-col>
                <StatsCol
                    :qty="stats.today[0].followBack"
                    :refQty="stats.month[0].followBack"
                    category="follow back"
                />
            </b-col>
        </b-row>
    </div>
</template>

<style lang="scss" scoped>
 .chart {
    height: 220px;
 }

 .todayStatsTitle {
    display: block;
    margin-top: 10px;
 }
</style>

<script>
    import MainChart from "./MainChart.vue"
    import StatsCol from "./StatsCol.vue"

    // TODO: Loading mode

    export default {
        props: {
            stats: {
                type: Object,
                default () {
                    return {
                        today: [{}],
                        month: [{}]
                    }
                }
            }
        },
        components: {
            MainChart,

            StatsCol
        }
    }
</script>