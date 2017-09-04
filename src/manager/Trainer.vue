<template>
	<div class="container">
		<h3 v-if="plug">Trainer for {{plug}}</h3>
		<template v-if="!exported">
			<div v-if="trainImages" id="aitrainer" class="row">
	          <hr/>
	          <div v-for="(image, i) in trainImages" :class="['col-2', (image.output === 1?'ok':'nok'), 'image']">
	            <img @click.prevent="toggleOutput(i)" :src="image.src" >
	          </div>
	          <hr/>
	          <a href="#" @click.prevent="save" class="button apply">Export</a>
	      </div>
      	  <Loading v-else/>
      </template>
      <textarea v-if="exported" v-model="exported" cols="30" rows="10" class="col-12" :readonly="true"></textarea>
      <a href="#" @click.prevent="train">Train</a>
	</div>
</template>

<style lang="scss" scoped>
	.image {
		//min-height: 200px;
		padding: 15px;

		img {
			cursor: pointer;
			width: 100%;
			height: 100%;
		}

		&.ok img{
			border: 1px solid green;
		}
		&.nok img{
			border: 1px solid red;
		}
	}
</style>

<script>
	import Loading from "components/Loading.vue";

	export default {
		data () {
			return {
				plug: false,
				trainImages: false,
				exported: false
			}
		},
		mounted () {
			this.$send('sendAll', {forwardAction: 'getImages', data: {plug: 'instagram'}});
		},
		message (action, data){
	      if (action == "moderateImages") {
	        this.trainImages = data.arr;
	        this.plug = data.plug;
	      }
	    },
	    methods: {
	    	toggleOutput (i) {
	    		this.trainImages[i].output = (this.trainImages[i].output === 1)?0:1;
	    	},
	    	save () {
	    		this.trainImages.forEach((images) => {
	    			delete images.src;
	    		})
	    		this.exported = JSON.stringify(this.trainImages)
	    	},
	    	train () {
	    		this.$send("trainAI", {})
	    	}
	    },
		components: {
			Loading
		}
	}
</script>