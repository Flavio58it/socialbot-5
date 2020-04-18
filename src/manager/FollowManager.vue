<template>
	<div id = "userlist">
		<div class="head form-inline">
			<div class="input-group col-4">
				<b-form-input 
					v-model="filters.name"
					placeholder="Name, username"
					type="text"
				/>
			</div>
			<div class="input-group col-7">
				<b-form-checkbox v-model="filters.state" value="following">&nbsp;Follower&nbsp;</b-form-checkbox>
				<b-form-checkbox v-model="filters.state" value="followback">&nbsp;Followback&nbsp;</b-form-checkbox>
				<b-form-checkbox v-model="filters.state" value="nofollowing">&nbsp;Not following&nbsp;</b-form-checkbox>
				<b-form-checkbox v-model="filters.state" value="whitelisted">&nbsp;Whitelisted&nbsp;</b-form-checkbox>
			</div>
			<div class="col-1 text-right">
				
			</div>
		</div>
		<div :class="['row', 'list', expanded?'expanded':'']">
			<div v-for="(user, i) in clUsers.list" class="user col-6 row" :key="i">
				<div class="col-3">
					<a>
						<img :src="user.img || user.details.img"/>
					</a>
				</div>
				<div class="col-9">
					<div class="userInfo">
						<a :href="user.profile_url" target="_blank"><b>{{user.username}}</b></a>
						<span v-if="user.fullname || user.details.fullName"> - {{user.fullname || user.details.fullName}}</span>
					</div>
					<div>
						<b-badge :variant="user.follows_me?'success':'danger'" :title="user.follows_me?'The user is following you':'The user is not following you'">Follower</b-badge>
						<b-badge v-if="user.status == 'followback'" variant="info" title="You are following him back">Followback</b-badge>
						<b-badge v-if="user.status == 'following'" variant="warning" title="You are following him">Following</b-badge>
						<b-badge v-if="user.details && user.details.autoFollowed" variant="">Auto-followed</b-badge>
					</div>
					<hr/>
					<div>
						<b-button-group size="sm">
							<b-button v-if="user.status=='following' || user.status=='followback'" variant="danger">Unfollow</b-button>
							<b-button v-else variant="info">Follow</b-button>
							<b-button v-if="!user.whitelisted" @click="whitelist(user, true)">Whitelist</b-button>
							<b-button v-else @click="whitelist(user, false)">Remove from whitelist</b-button>
							<b-button v-if="!user.blacklisted" @click="blacklist(user, true)">Blacklist</b-button>
						</b-button-group>
					</div>
				</div>
			</div>
			<Loading v-if="!users.length"/>
		</div>
		<div class="row">
			<div v-if="users.length" class="col">
				Showing {{show + 1}}-{{(show===true)?clUsers.elements:(show + 50)}} of {{clUsers.elements}}
			</div>
			<div v-if="clUsers.elements > 50"  class="controlLinks text-right col">
				<a href="#" @click.prevent="showAllUsers">Show all</a>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	#userlist {
		padding: 10px;

		.user {
			padding: 15px;

			img {
				width: 90px;
			}

			hr {
				margin-top:5px;
				margin-bottom: 7px;
				padding:0;
			}
		}
	}

	.head {
		padding: 15px;
		line-height: 20px;
	}

	.list {
		overflow: hidden;
		overflow-y: auto;
		background-color: white;
		border-radius: 3px;

		.userInfo {
			display: inline-block;
		    white-space: nowrap;
		    overflow: hidden;
		    text-overflow: ellipsis;
		}
	}

	button {
		cursor: pointer;
	}
</style>

<script>
	import Loading from "components/Loading.vue";

	export default {
		props: ["plug"],
		data () {
			return {
				show: 0,
				expanded: false,
				users: [],
				filters: {
					name: "",
					state: []
				}
			}
		},
		mounted () {
			this.$send("getUsers", {plug: this.plug})
		},
		message (action, data) {
			if (action == "usersData" && data.plug == this.plug)
				this.users = data.list;
			console.log("Message", data.list)
			console.log("Message", data.list[0].details)
		},
		methods: {
			whitelist (user, mode) {
				this.$send("directAction", {operation: "whitelistUser", id: user.id, add: mode, plug: this.plug});
				user.whitelisted = mode;
				this.$forceUpdate();
			},
			showAllUsers () {
				if (this.show === 0)
					this.show = true;
				else if (this.show === true)
					this.show = 0
			}
		},
		computed: {
			clUsers () {
				var arr = this.users.slice(0), filters = this.filters;
				if (filters.name)
					arr = arr.filter((t) => {
						return t.username.indexOf(filters.name) >= 0;
					})
				if (filters.state.length){
					if (filters.state.indexOf('whitelisted') >= 0)
						arr = arr.filter((t) => {
							return t.whitelisted;
						})
					if (filters.state.indexOf('following') >= 0)
						arr = arr.filter((t) => {
							return t.follows_me;
						})
					if (filters.state.indexOf('followback') >= 0)
						arr = arr.filter((t) => {
							return t.status == "followback";
						})
					if (filters.state.indexOf('nofollowing') >= 0)
						arr = arr.filter((t) => {
							return !t.follows_me;
						})
				}

				return {
					elements: arr.length,
					list: this.show === true?arr:arr.splice(this.show, 50)
				};
			}
		},
		components: {
			Loading
		}
	}
</script>