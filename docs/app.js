/* global Vue */
// eslint-disable-next-line new-cap
const md = new window.markdownit()

const props = document.querySelector('#props-content').innerHTML

// eslint-disable-next-line no-new
new Vue({
  el: '.page-container',
  data: {
    usage: md.render(`
      <template>
        <headroom>
          <header>
            Put your head code here...
          </header>
        </headroom>
      </template>

      <script>
      import headroom from 'vue-headroom'

      Vue.use(headroom)

      // or
      import { headroom } from 'vue-headroom'

      export default {
        components: {
          headroom
        }
      }
      </script>
    `),

    props: md.render(props)
  }
})
