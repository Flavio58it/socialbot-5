<template>
    <div>
        <b>Follow options</b>
        <div>
            <b-form-checkbox v-model="data.settings.modules.follow.followBack">
                Followback
                <div class="description">Follow back the people who follows you (Blacklist applied)</div>
            </b-form-checkbox>
        </div>
        <div>
            <b-form-checkbox v-model="data.settings.modules.follow.unFollowBack">
                UnFollowback
                <div class="description">When a user unfollows you will be unfollowed back. (Whitelist applied)</div>
            </b-form-checkbox>
        </div>
        <div>
            <b>Follow conditions</b>
            <div class="description">Leave the filter to 0 to disable it.</div>
        </div>
        <div class="row">
            <div class="description col-12">Filter by user followers number</div>
            <div class="col-6">
                <b-form-select 
                    v-model="data.settings.modules.follow.filters.followers.more"
                    :options="[
                        {text: 'More than', value: true},
                        {text: 'Less than', value: false}
                    ]" 
                    :disabled="followConditionsMode == 'ratio'"
                    class="mb-3"
                />
            </div>
            <div class="col-6">
                <b-form-input
                    type="number"
                    :disabled="followConditionsMode == 'ratio'"
                    @input="followFilterManager()"
                    :formatter="toDefault"
                    lazy-formatter
                    v-model="data.settings.modules.follow.filters.followers.number"
                />
            </div>
        </div>
        <div class="row">
            <div class="description col-12">Filter by user following number</div>
            <div class="col-6">
                <b-form-select 
                    v-model="data.settings.modules.follow.filters.following.more"
                    :options="[
                        {text: 'More than', value: true},
                        {text: 'Less than', value: false}
                    ]" 
                    :disabled="followConditionsMode == 'ratio'"
                    class="mb-3"
                />
            </div>
            <div class="col-6">
                <b-form-input
                    type="number"
                    :disabled="followConditionsMode == 'ratio'"
                    @input="followFilterManager()"
                    :formatter="toDefault"
                    lazy-formatter
                    v-model="data.settings.modules.follow.filters.following.number"
                />
            </div>
        </div>
        <!--
        This code has been removed server side as not useful. It will be reconsidered in future.
        <div class="row">
            <div class="col-12">
                <span class="description">Filter by user following ratio</span>
                <helper title="Following ratio filter">
                    <p>This filter will allow to follow only the users above a follower/following ratio.</p>
                    <p></p>
                    <p>Putting 0 will disable this filter and enable the other ones.</p>
                </helper>
            </div>
            <div class="col-4">
                <b-form-input
                    type="number"
                    @input="followFilterManager()"
                    :disabled="followConditionsMode == 'fixed'"
                    :formatter="toDefault"
                    lazy-formatter
                    v-model="data.settings.filters.follow.ratio"
                />
            </div>
        </div>
        -->
    </div>
</template>

<script>
    export default {
        props: ['data', 'followConditionsMode'],
        
        methods: {
            toDefault (val){
				if (val == "" || parseInt(val) < 0)
					return "0";
				return val;
			}
        }
    }
</script>