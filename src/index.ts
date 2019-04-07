import Vue from 'vue'
import headroom from './headroom.vue'

const install = function(_Vue: typeof Vue): void {
  if (install['installed'] || (typeof window !== 'undefined' && !('requestAnimationFrame' in window))) {
    return
  }

  _Vue.component(headroom.name, headroom)
}

if (typeof window !== 'undefined' && (window as any).Vue) {
  install((window as any).Vue)
}

export default {
  headroom,
  install
}
