<template>
  <div id = "app">
    <Headbar :user="userinfo"/>
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
        userinfo: {
          image: "http://nope"
        }
      }
    },
    mounted () {
      this.$send("init");
    },
    message (action, data){

    },
    methods: {

    },
    components: {
      Headbar
    }
  }
</script>