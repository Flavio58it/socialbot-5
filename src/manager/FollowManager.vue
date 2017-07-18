<template>
	<div id = "userlist">
		filter by name, state (blacklisted/whitelisted) if is following or not
		<div class="head row">
			<div class="col-4">
				<b-form-input 
					v-model="filters.name"
					placeholder="Name, username"
					type="text"
				/>
			</div>
		</div>
		<div class="row list">
			<div v-for="user in users" class="user col-6 row">
				<div class="col-3">
					<img :src="user.img"/>
				</div>
				<div class="col-9">
					<div>
						<a :href="user.profile_url" target="_blank"><b>{{user.username}}</b></a>
						<span v-if="user.fullname"> - {{user.fullname}}</span>
					</div>
					<div>
						<b-badge :variant="user.follows_me?'success':'danger'" :title="user.follows_me?'The user is following you':'The user is not following you'">Follower</b-badge>
						<b-badge v-if="user.status == 'followback'" variant="info" title="You are following him back">Followback</b-badge>
					</div>
					<div>Actions</div>
				</div>
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
	}

	.head {
		padding: 15px;
	}

	.list {
		max-height: 425px;
		overflow-y: auto;
		background-color: white;
		border-radius: 3px;
	}
</style>

<script>
	export default {
		props: ["type"],
		data () {
			return {
				users: [],
				filters: {
					name: "",
					following: null
				}
			}
		},
		mounted () {
			this.$send("getUsers", {type: this.type})
		},
		message (action, data) {
			if (action == "usersData" && data.type == this.type)
				this.users = data.list;
		}
	}
</script>