<template>
	<div id = "userlist">
		<div class="head">
			filter by name, state (blacklisted/whitelisted) if is following or not
		</div>
		<div class="row">
			<div v-for="user in users" class="user col-6">
				<img :src="user.img"/>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	
</style>

<script>
	export default {
		props: ["type"],
		data () {
			return {
				users: []
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