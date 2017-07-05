import Vue from 'vue'
import App from './App.vue'

import frontComm from "comm/frontComm";

// This functionality insert into Vue the ability to send and receive directly messages from backend.
Vue.use(frontComm, {name: "popup", debug: false});

new Vue({
  el: '#app',
  render: h => h(App)
})
