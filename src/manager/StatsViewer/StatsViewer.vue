<template>
    <b-row>
        <b-col>
            <MainChart :stats='stats'/>
        </b-col>
        <b-col>
            Yup
        </b-col>
    </b-row>
</template>

<style lang="scss" scoped>

</style>

<script>
    import MainChart from "./MainChart.vue"

    export default {
        props: {
            stats: {
                type: Object,
                default: () => {}
            }
        },
        components: {
            MainChart
        }
    }
</script>