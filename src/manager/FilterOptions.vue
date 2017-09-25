<template>
	<div id="main" class="row">
		<div v-if="value && value.length" class="col-9">
			{{value.length}} filters
		</div>
		<div v-else class="col-9">
			No filters
		</div>
		<div class="clear"></div>
		<div class="col-3">
			<i @click="addEditModal" class="fa fa-gear fa-2x"/>
		</div>
		<b-modal id="modalFilters" ref="modalFilters" title="Add/Edit comment filters" :ok-only="true">
			<div v-if="value.length">
				<div v-for="(option, i) in value">
					<div v-if="editIndex !== false && editIndex == i" class="row">
						<div class="col-2 text-center">
							<b-badge variant="info">Text</b-badge>
						</div>
						<div class="col-8">
							<b-form-input
								v-model="value[i]"
								@keyup.enter.stop="saveEl"
							/>
						</div>
						<div class="col-2 align-left"><i @click.prevent.stop="saveEl" class="fa fa-save"/></div>
					</div>
					<div v-else @click="editIndex = i"class="editable">
						{{option}}
					</div>
				</div>
			</div>
			<div v-else class="text-center">No entries</div>
			<button v-if="editIndex === false" @click="newEntry" class="btn btn-primary float-right">Add</button>
		</b-modal>
	</div>
</template>

<style lang="scss" scoped>
	#main {
		max-height: 50px;
		overflow: hidden;
		div {
			line-height: 40px;
		}
	} 
	i, .editable {cursor: pointer;}
</style>

<script>
	export default {
		props: ["value"],
		data () {
			return {
				editIndex: false
			}
		},
		methods: {
			addEditModal () {
				this.$refs.modalFilters.show()
			},
			saveEl () {
				this.editIndex = false
				this.$emit("input", this.value);
			},
			newEntry () {
				if (this.editIndex !== false)
					return;
				this.value.push("");
				this.editIndex = this.value.length - 1;
			}
		}
	}
</script>