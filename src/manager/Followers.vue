<template>
    <div>
        <div>
            <b>Followers manager</b>
            <Helper title="Followers manager">
                <p>With this tool you can see the overall situation of the your account.</p>
                <p>You can filter by name and the user situation towards you and then perform actions</p>

                <p>FollowManager is disabled by default as needs a lot of resources to operate. In order to have filtering and stats controls available the system will load all your followers. This may take <b>a lot</b> of time, depending of your number of followers.</p>

                <hr/>
                <b>Badges:</b>
                <div>
                    <div><b-badge variant="success">Follower</b-badge> - The user is following you</div>
                    <div><b-badge variant="danger">Follower</b-badge> - The user is NOT following you</div>
                    <div><b-badge variant="info">Followback</b-badge> - You are following him back</div>
                    <div><b-badge variant="warning">Following</b-badge> - You are following him (and he is not following you)</div>
                </div>
            </Helper>
        </div>
        <FollowManager v-if="plug" :plug="plug"/>
    </div>
</template>

<script>
    import FollowManager from "./FollowManager.vue";
    import Helper from "components/Helper.vue";

    export default {
        computed: {
            plug: function () {
                return this.$route.params.plug || false
            }
        },
        components: {
            FollowManager,
            Helper
        }
    }
</script>