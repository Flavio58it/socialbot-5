<template>
	<div>
		<div id="main" class="row">
			<div v-if="value && value.length" class="col-9">
				<div v-for="option in value">
					Test
				</div>
			</div>
			<div v-else class="col-9">
				No filters
			</div>
			<div class="col-3">
				<i @click="addEditModal" class="fa fa-gear fa-2x"/>
			</div>
			<b-modal id="modalFilters" ref="modalFilters" title="Add/Edit comment filters" :ok-only="true">
				<div v-for="(option, i) in value">
					<div v-if="editIndex == i">
						<b-form-input
							v-model="current"
						/>
						<i @click="save(i)" class="fa fa-save"/>
					</div>
					<div v-else @click="enableEditor(i)" class="editable">
						{{option}}
					</div>
				</div>
			</b-modal>
		</div>
	</div>
</template>

<style lang="scss" scoped>
	#main div {
		line-height: 40px;
	}
	i, .editable {cursor: pointer;}
</style>

<script>
	export default {
		props: ["value"],
		data () {
			return {
				editIndex: false,
				current: false
			}
		},
		mounted () {
			console.log(this.value)
			if ((this.value && !this.value.length) || !this.value) {
				this.$emit("input", [""]);
				this.current = "";
				this.editIndex = 0;
			}
		},
		methods: {
			addEditModal () {
				this.$refs.modalFilters.show()
			},
			enableEditor (i) {
				this.editIndex = i;
				this.current = value[i];
			},
			save (i) {
				if (this.editIndex === false)
					this.value.push(this.current)
				else
					this.value[i] = this.current;
				this.current = false;
				this.editIndex = false;
				this.$emit("input", this.value);
			}
		}
	}
</script>