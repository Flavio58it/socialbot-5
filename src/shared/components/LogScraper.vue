<template>
	<div id ="logScraper">
		<div id="head" class="row">
			<div class="col">
				<b>Latest activity</b>
			</div>
			<Filters v-model="filter" class="col text-right"/>
		</div>
		<div id="logs" class="row">
			<div v-for="(log, i) in list" :key="i" :class="['logItem', 'col-12']">
				<div class="row">
					<div v-if="log.details.img" :class="[(i==0)?'col-5':'col-3', 'mainimg']">
						<div :class="[(i==0)?'big':'small', 'imgwrapper']">
							<img :src="log.details.img"/>
						</div>
					</div>
					<div :class="[(i==0)?'col-7':'col-9', 'description']">
						<span v-if="log.action == 'USER_LIKE'">
							<b>Liked</b> image <span v-if="log.details.userName">from <b>{{log.details.userName}}</b></span> 
							<span v-if="log.details.tag">(#{{log.details.tag}})</span>
						</span>
						<span v-else-if="log.action == 'USER_FOLLOWBACK'">
							<b>Followed back </b> user {{log.details.userName}}
						</span>
						<span v-else-if="log.action == 'USER_UNFOLLOWBACK'">
							<b>Unfollowed back </b> user {{log.details.userName}}
						</span>
						<span v-else-if="log.action == 'USER_LIKEBACK'">
							<b>Likeback to </b> user <b>{{log.details.userName}}</b>
						</span>
						<div class="row date">
							<div class="col">{{log.time|fromNow}}</div>
						</div>
						<hr/>
						<div class="row pull-left actions">
							<b-button v-if="log.action == 'USER_LIKE'" variant="danger" size="sm">Unlike it</b-button>
							<b-button v-else-if="log.action == 'USER_FOLLOWBACK'" variant="danger" size="sm">Unfollow</b-button>
						</div>
					</div>
				</div>
			</div>
			<Loading v-if="!list"/>
			<div v-if="list instanceof Array && !list.length" class="col text-center noLogs">
				No logs available
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	#logScraper {
		//height: 400px;
		//overflow-x: auto;
	}

	.noLogs {
		height: 120px;
		line-height: 120px;
	}

	#head {
		line-height: 40px;
		background-color: $background-color-darker;
	}

	#logs {
		.logItem {
			padding: $spacer-small $spacer;
			
			.mainimg {
				text-align: center;
				padding: 5px;

				.imgwrapper{
					overflow: hidden;
					vertical-align: middle;

					&.small {
						height: 85px;
					}

					&.big {
						height: 150px;
					}
				}

				img{
					width: 100%;
				}
			}
		}

		

		.date, .tag {
			font-size: $font-small;
		}
	}

	hr {
		margin-top:5px;
		margin-bottom: 7px;
		padding:0;
	}
</style>

<script>
	import moment from "moment";

	import Loading from "components/Loading.vue"
	import Filters from "./Filters.vue";

	var timer = false;

	moment.locale("en");
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
		filters: {
			fromNow (date) {
				return moment(date).fromNow();
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