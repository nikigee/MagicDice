import Vue from 'vue'
import MagicDice from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(MagicDice),
}).$mount('#app')
