<template>
  <div id = "app">
    <Headbar titlelink/>
    <div class="mainContent">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">
  body {
    background-color: $background-color;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, FontAwesome, sans-serif!important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $font_color;
  }
  .mainContent {
    padding: 15px;
  }
</style>

<script>
  import Headbar from "components/Headbar.vue";

  export default {
    data () {
      return {
        
      }
    },
    mounted () {
      this.$send("init");
    },
    components: {
      Headbar
    }
  }
</script>