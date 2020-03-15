<template>
    <div>
        <div>
            <b>Like timer</b>
            <div class="description">The upper and lower limit for the like timer</div>
        </div>
        <div class="row">
            <div class="col-4">
                From (seconds)
                <b-form-input
                    type="number"
                    :formatter="checkLowerLimitValid"
                    v-model="data.settings.waiter.actionLower"
                    lazy-formatter
                />
            </div>
            <div class="col-4">
                To (seconds)
                <b-form-input
                    type="number"
                    :formatter="checkUpperLimitValid"
                    v-model="data.settings.waiter.actionUpper"
                    lazy-formatter
                />
            </div>
            <div class="col-4">
                
            </div>
        </div>
        <hr/>
        <div>
            <b>Pause timer</b>
            <div class="description">The time between one round and another</div>
        </div>
        <div class="row">
            <div class="col-6">
                Time (minutes)
                <b-form-input
                    type="number"
                    v-model="data.settings.waiter.roundPause"
                />
            </div>
        </div>
        <hr/>
        <div>
            <b>Like Rates</b>
            <div class="description">Limit hourly, daily and monthly rates in order to avoid instagram limitations</div>
        </div>
        <div class="row">
            <div class="col-4">
                Time period
                <b-form-input
                    type="number"
                    v-model="data.settings.rates.timePeriod"
                />
            </div>
            <div class="col-4">
                Like Limit
                <b-form-input
                    type="number"
                    v-model="data.settings.rates.likeLimit"
                />
            </div>
            <div class="col-4">
                Follow limit
                <b-form-input
                    type="number"
                    v-model="data.settings.rates.followLimit"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import FilterOptions from "../../FilterOptions.vue";

    export default {
        props: ['data'],

        methods: {
            checkUpperLimitValid (val) {
				if (val <= parseInt(this.settings.waiter.actionLower) + 10)
					return parseInt(this.settings.waiter.actionLower) + 10;
				return val;
			},
			checkLowerLimitValid (val) {
				return (val < 3)?3:val;
			}
        },

        components: {
            FilterOptions
        }
    }
</script>