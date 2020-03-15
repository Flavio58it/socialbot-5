<template>
    <div>
        <b>
            Like options
        </b>
        <b-form-checkbox v-model="data.settings.modules.like.likeDash">
            Like dashboard
            <div class="description">Like the images from your dashboard</div>
        </b-form-checkbox>
        <div>
            <b>
                Like conditions
            </b>
            <div class="description">
                Select images to like basing on content of description
                <helper title="Like condition">
                    <div>
                        <p>This condition allows to select precisely what type of photos the bot will like basing on image description.</p>
                        <p>Click on the gear and insert text, hashtags or regex filters.</p>
                        <p>If you have previously liked a post it will not be unliked.</p>
                        <p>This filter will apply to tags/dashboard like actions</p>
                    </div>
                </helper>
            </div>
        </div>
        <div class="row">
            <div class="col-4">
                    <b-form-select 
                    v-model="data.settings.modules.like.filters.isTextInclusive" 
                    :options="[
                        {text: 'Include if', value: true},
                        {text: 'Exclude if', value: false}
                    ]" 
                    class="mb-3"/>
            </div>
            <FilterOptions class="col-8" v-model="data.settings.modules.like.filters.textFilters"/>
        </div>

        <div class="description">Like by the number of likes condition (0 is disabled)</div>
        <div class="row">
            <div class="col-3">
                    <b-form-select 
                    v-model="data.settings.modules.like.filters.isLikeNumberInclusive"
                    :options="[
                        {text: 'Include if', value: true},
                        {text: 'Exclude if', value: false}
                    ]" 
                    class="mb-3"/>
            </div>
            <div class="col-4">
                    <b-form-select 
                    v-model="data.settings.modules.like.filters.isLikeNumberMoreLess" 
                    :options="[
                        {text: 'More than', value: true},
                        {text: 'Less than', value: false}
                    ]" 
                    class="mb-3"/>
            </div>
            <div class="col-5">
                <b-form-input
                    type="number"
                    v-model="data.settings.modules.like.filters.isLikeNumber"
                />
            </div>
        </div>
        <div class="row" v-if="false">
            <div class="col-12">
                <div class="description">
                    AI Setting
                    <helper title="Artificial Intelligence Setting">
                        <div>
                            <p>Like if AI has approved the image in the selected category</p>
                            <p>Please note that the AI will cover all the normal cases with only tiny margin of error. If the image is messed up (strong contrast, messed color balance, white stripes) the correct result is not ensured.</p>
                        </div>
                    </helper>
                </div>
            </div>
        </div>
        <div>
            <b>Like limit</b>
            <div class="description">Like limits per round of the bot</div>
        </div>
        <div class="row">
            <div class="col-4">
                Hashtag follower
                <b-form-input
                    type="number"
                    v-model="data.settings.modules.like.limits.tag"
                />
            </div>
            <div class="col-4">
                Dashboard
                <b-form-input
                    type="number"
                    v-model="data.settings.modules.like.limits.dash"
                />
            </div>
            <div class="col-4" v-if="dev">
                Explore <helper title="Explore">The section listing the people that you don't follow but you may like</helper>
                <b-form-input
                    type="number"
                    v-model="data.settings.modules.like.limits.explorer"
                />
            </div>
        </div>
        <div>
            <b>Other</b>
        </div>
        <div class="row">
            <div class="col">
                <b-form-checkbox v-model="data.settings.modules.like.filters.videos">
                    Like videos
                    <div class="description">Like also if the post is a video</div>
                </b-form-checkbox>
            </div>
        </div>
    </div>
</template>

<script>
    import Helper from "components/Helper.vue";
    import FilterOptions from "../../FilterOptions.vue"

    export default {
        data () {
            return {
                dev: process.env.NODE_ENV === 'development',
            }
        },
        props: ['data'],

        components: {
            Helper,
            FilterOptions
        }
    }
</script>