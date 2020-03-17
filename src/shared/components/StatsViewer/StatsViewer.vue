<template>
    <b-row>
        <b-col>
            <MainChart/>
        </b-col>
        <b-col>
            Yup
        </b-col>
    </b-row>
</template>

<style lang="scss" scoped>

</style>

<script>
    import MainChart from "./MainChart"

    export default {
        data: {
            stats: {
                likes: []
            }
        },
        components: {
            MainChart
        }
    }
</script>