<template>
  <div id = "app" style="width: 480px;">
    <Headbar showsettings showaccounts separator/>
    <div class="container">
      <div class="status"></div>
      <LogScraper loggerid = "popup"/>
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
    background-color: $background-color;
  }
</style>

<script>
  import Headbar from "components/Headbar.vue";
  import LogScraper from "components/LogScraper.vue";

  export default {
    data () {
      return {
        
      }
    },
    mounted () {
      this.$send("init");
    },
    components: {
        Headbar,
        LogScraper
    }
  }
</script>