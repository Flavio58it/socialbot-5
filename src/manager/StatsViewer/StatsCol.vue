<template>
    <div class="statsCol">
        <i :class="{
            'fa': true,
            'fa-2x': !equals,
            'fa-sort-up': isMore && !equals,
            'fa-sort-down': !isMore && !equals,
            'fa-equals': equals
        }"/>
        <b>{{qty}}</b> <span class="description"> {{category}}</span>
    </div>
</template>

<style lang="scss" scoped>
    .statsCol {
        margin: 0px auto;
        text-align: center;
        font-size: $font-huge + 6;

        i{
            padding: 0 10px;

            &.fa-equals {
                vertical-align: middle;
                line-height: 30px;
            }

            &.fa-sort-up {
                color: green;
                vertical-align: bottom;
                line-height: 15px;
            }

            &.fa-sort-down {
                color: red;
                vertical-align: top;
                line-height: 20px;
            }
        }

        b, .description {
            font-size: $font-huge;
            line-height: 30px;
            vertical-align: middle;
        }
    }
</style>

<script>
    export default {
        props: {
            qty: {
                type: Number,
                required: true,
                default: 0
            },
            refQty: {
                type: Number,
                required: true,
                default: 0
            },
            category: {
                type: String,
                required: true,
                default: ""
            }
        },
        computed: {
            isMore () {
                return this.qty > this.refQty;
            },
            equals () {
                return this.qty === this.refQty
            }
        }
    }
</script>