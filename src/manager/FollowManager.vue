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
				<b-form-checkbox v-model="filters.state" value="following">Follower</b-form-checkbox>
				<b-form-checkbox v-model="filters.state" value="followback">Followback</b-form-checkbox>
				<b-form-checkbox v-model="filters.state" value="nofollowing">Not following</b-form-checkbox>
				<b-form-checkbox v-model="filters.state" value="whitelisted">Whitelisted</b-form-checkbox>
			</div>
			<div class="col-1 text-right">
				<a v-if="clUsers.elements > 50" href = "#" @click.prevent="toggleExpand" title="Toggle expand">
					<i :class="['fa', expanded?'fa-compress':'fa-expand']"/>
				</a>
			</div>
		</div>
		<div :class="['row', 'list', expanded?'expanded':'']" :style="expanded" @mouseenter="stopScroll(true)" @mouseleave="stopScroll(false)">
			<div v-for="user in clUsers.list" class="user col-6 row">
				<div class="col-3">
					<a>
						<img :src="user.img"/>
					</a>
				</div>
				<div class="col-9">
					<div class="userInfo">
						<a :href="user.profile_url" target="_blank"><b>{{user.username}}</b></a>
						<span v-if="user.fullname"> - {{user.fullname}}</span>
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
							<b-button variant="success" title="Like the photos of the user">Like</b-button>
						</b-button-group>
					</div>
				</div>
			</div>
			<Loading v-if="!users.length"/>
		</div>
		<div class="row">
			<div v-if="users.length" class="col">
				Showing 1-{{showAll?clUsers.elements:'50'}} of {{clUsers.elements}}
			</div>
			<div v-if="clUsers.elements > 50"  class="controlLinks text-right col">
				<a href="#" @click.prevent="showAll = !showAll">Show all</a>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
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

	.head {
		padding: 15px;
		line-height: 20px;
	}

	.list {
		max-height: 425px;
		overflow-y: auto;
		background-color: white;
		border-radius: 3px;

		&.expanded {
			max-height: inherit;
		}

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
				showAll: false,
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
		},
		methods: {
			whitelist (user, mode) {
				this.$send("directAction", {operation: "whitelistUser", id: user.id, add: mode, plug: this.plug});
				user.whitelisted = mode;
				this.$forceUpdate();
			},
			stopScroll (enabled) {
				if (enabled) {
					document.body.classList.add("stop-scrolling");
					window.scrollTo(0,document.body.scrollHeight);
				} else
					document.body.classList.remove("stop-scrolling")
			},
			toggleExpand () {
				if (this.expanded)
					this.expanded = false;
				else {
					this.expanded = {"height": (window.innerHeight - 50) + "px"};
					this.$nextTick(() => {
						window.scrollTo(0,document.body.scrollHeight);
					})
				}
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
					list: this.showAll?arr:arr.splice(0, 50)
				};
			}
		},
		components: {
			Loading
		}
	}
</script>