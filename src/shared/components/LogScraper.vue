<template>
	<div id ="logScraper">
		<div id="head" class="row">
			<div class="col">
				<b>Latest activity</b>
			</div>
			<Filters v-model="filter"class="col text-right"/>
		</div>
		<div id="logs">
			<div v-for="log in list" class="row logItem">
				<div v-if="log.details.img" class="col-3 mainimg">
					<img :src="log.details.img"/>
				</div>
				<div class="col-9 description">
					<b>Liked</b> image
					<hr/>
					<b-button variant="danger" size="sm">Unlike it</b-button>
				</div>
			</div>
			<Loading v-if="!list"/>
			<div v-if="list instanceof Array && !list.length" class="text-center">
				<div>No logs available</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	#logScraper {
		//height: 400px;
		//overflow-x: auto;
	}

	#head {
		line-height: 40px;
		background-color: $background-color-darker;
	}

	#logs {
		.logItem {
			padding: 10px;
		}

		.mainimg img{
			width: 100%;
			min-height: 90px;
		}
	}
</style>

<script>
	import moment from "moment";

	import Loading from "components/Loading.vue"
	import Filters from "./Filters.vue";

	var timer = false;
	export default {
		props: ["loggerid"],
		data () {
			return {
				list: false,
				filter: "all"
			}
		},
		mounted () {
			timer = setInterval(() => {
				this.$send("getLogs", {limit: 50, date: "latest", forWhich: this.loggerid, filter: this.filter})
			}, 3000);
		},
		message (action, data) {
			if (action == "logs" && data.forWhich == this.loggerID) {
				this.list = data.list;
			}
		},
		watch: {
			filter () {
				this.list = false;
			}
		},
		components: {
			Loading,
			Filters
		}
	}
</script>