<template>
    <div>
        <div>
            <b-form-checkbox v-model="data.settings.modules.likeBack.enabled">
                LikeBack 
                <Helper title="LikeBack">
                    <p>When a user like one of the your images the bot will check their gallery and like back a couple of images.</p>
                    <p>In order to not over-like a user who likes more than one of your photos a control will be performed. If the user has been already liked by the bot in the last {{data.settings.modules.likeBack.ignoreTime}} days will be skipped.</p>
                </Helper>
                <div class="description">When a user likes a photo of yours the bot will like a couple of theirs.</div>
            </b-form-checkbox>
            <b-form-checkbox v-model="data.settings.modules.likeBack.useLikeFilters">
                Enable likes filter
                <div class="description">Filter LikeBack operations with same filters as normal likes</div>
            </b-form-checkbox>
        </div>
        <div>
            <b>Ignore time</b>
            <div class="description">After you have liked back a user wait before liking his dashboard again [days]</div>
        </div>
        <div class="row">
            <div class="col-4">
                <b-form-input
                    type="number"
                    v-model="data.settings.modules.likeBack.ignoreTime"
                />
            </div>
        </div>
        <div>
            <b>Likes number</b>
            <div class="description">How much photos to like per user. If less photos are available will stop automatically.</div>
        </div>
        <div class="row">
            <div class="col-4">
                <b-form-input
                    type="number"
                    v-model="data.settings.modules.likeBack.likes"
                />
            </div>
        </div>
        <div>
            <b>Managed users per round</b>
            <div class="description">How much users to like per round. The missing users will be managed in the next one.</div>
        </div>
        <div class="row">
            <div class="col-4">
                <b-form-input
                    type="number"
                    v-model="data.settings.modules.likeBack.maxUsersLike"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import Helper from "components/Helper.vue";

    export default {
        props: ['data'],

        components: {
            Helper
        }
    }
</script>