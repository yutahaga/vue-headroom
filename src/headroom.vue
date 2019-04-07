<template>
  <div :class="cls">
    <slot></slot>
  </div>
</template>

<script>
import raf from 'raf'
import checkActions from './checkActions'
import support3d from './support3d'

const defaultCls = {
  pinned: 'headroom--pinned',
  unpinned: 'headroom--unpinned',
  top: 'headroom--top',
  notTop: 'headroom--not-top',
  bottom: 'headroom--bottom',
  notBottom: 'headroom--not-bottom',
  initial: 'headroom'
}

export default {
  name: 'vueHeadroom',

  data () {
    return {
      isTop: false,
      isNotTop: false,
      isBottom: false,
      isNotBottom: false,
      isPinned: false,
      isUnpinned: false,
      currentScrollY: 0,
      lastScrollY: 0,
      state: '',
      isSupport3d: false
    }
  },

  props: {
    scroller: {
      type: Function,
      default: () => window
    },

    disabled: {
      type: Boolean,
      default: false
    },

    upTolerance: {
      type: Number,
      default: 5
    },

    downTolerance: {
      type: Number,
      default: 0
    },

    offset: {
      type: Number,
      default: 0
    },

    classes: {
      type: Object,
      default () {
        return defaultCls
      }
    }
  },

  watch: {
    disabled (newVal) {
      if (newVal) {
        this.scroller().removeEventListener('scroll', this._handleScroll)
      } else {
        this.scroller().addEventListener('scroll', this._handleScroll)
      }
    }
  },

  mounted () {
    this.isSupport3d = support3d()

    if (!this.disabled) {
      this.scroller().addEventListener('scroll', this._handleScroll)
    }

    // When headroom is mounted, call handleScroll to set initial state.
    this._handleScroll()
  },

  beforeDestroy () {
    this.scroller().removeEventListener('scroll', this._handleScroll)
  },

  computed: {

    clsOpts () {
      return {
        ...defaultCls,
        ...this.classes
      }
    },

    cls () {
      let cls = this.clsOpts
      return this.disabled
        ? {}
        : {
          [cls.top]: this.isTop,
          [cls.notTop]: this.isNotTop,
          [cls.bottom]: this.isBottom,
          [cls.notBottom]: this.isNotBottom,
          [cls.pinned]: this.isPinned,
          [cls.unpinned]: this.isUnpinned,
          [cls.initial]: true
        }
    },

    isInTop () {
      return this.state === 'pinned' || this.state === 'unpinned'
    }
  },

  methods: {
    _getViewportHeight: () => {
      return window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight
    },

    _getElementPhysicalHeight: elm => Math.max(
      elm.offsetHeight,
      elm.clientHeight
    ),

    _getDocumentHeight: () => {
      const body = document.body
      const documentElement = document.documentElement

      return Math.max(
        body.scrollHeight, documentElement.scrollHeight,
        body.offsetHeight, documentElement.offsetHeight,
        body.clientHeight, documentElement.clientHeight
      )
    },

    _getElementHeight: elm => Math.max(
      elm.scrollHeight,
      elm.offsetHeight,
      elm.clientHeight
    ),

    _getScrollerPhysicalHeight () {
      const parent = this.scroller()

      return (parent === window || parent === document.body)
        ? this._getViewportHeight()
        : this._getElementPhysicalHeight(parent)
    },

    _getScrollerHeight () {
      const parent = this.scroller()

      return (parent === window || parent === document.body)
        ? this._getDocumentHeight()
        : this._getElementHeight(parent)
    },

    _isOutOfBound (currentScrollY) {
      const pastTop = currentScrollY < 0

      const scrollerPhysicalHeight = this._getScrollerPhysicalHeight()
      const scrollerHeight = this._getScrollerHeight()

      const pastBottom = currentScrollY + scrollerPhysicalHeight > scrollerHeight

      return pastTop || pastBottom
    },

    _handleScroll () {
      raf(this.update)
    },

    _getScrollY () {
      let top
      if (this.scroller().pageYOffset !== undefined) {
        top = this.scroller().pageYOffset
      } else if (this.scroller().scrollTop !== undefined) {
        top = this.scroller().scrollTop
      } else {
        top = (
          document.documentElement ||
          document.body.parentNode ||
          document.body
        ).scrollTop
      }
      return top
    },

    update () {
      this.currentScrollY = this._getScrollY()

      if (this._isOutOfBound(this.currentScrollY)) {
        return
      }

      if (this.currentScrollY <= this.offset) {
        this.top()
      } else {
        this.notTop()
      }

      if (Math.round(this.currentScrollY) +
        this._getViewportHeight() >= this._getScrollerHeight()) {
        this.bottom()
      } else {
        this.notBottom()
      }

      const action = checkActions(this)

      if (action === 'pin') {
        this.pin()
      } else if (action === 'unpin') {
        this.unpin()
      }

      this.lastScrollY = this.currentScrollY
    },

    top () {
      if (!this.isTop) {
        this.isTop = true
        this.isNotTop = false
        this.$emit('top')
      }
    },

    notTop () {
      if (!this.isNotTop) {
        this.isTop = false
        this.isNotTop = true
        this.$emit('not-top')
      }
    },

    bottom () {
      if (!this.isBottom) {
        this.isBottom = true
        this.isNotBottom = false
        this.$emit('bottom')
      }
    },

    notBottom () {
      if (!this.isNotBottom) {
        this.isNotBottom = true
        this.isBottom = false
        this.$emit('not-bottom')
      }
    },

    pin () {
      if (!this.isPinned) {
        this.isPinned = true
        this.isUnpinned = false
        this.$emit('pin')
        setTimeout(() => {
          this.state = 'pinned'
        }, 0)
      }
    },

    unpin () {
      if (this.isPinned || !this.isUnpinned) {
        this.isUnpinned = true
        this.isPinned = false
        this.$emit('unpin')
        setTimeout(() => {
          this.state = 'unpinned'
        }, 0)
      }
    }
  }

}
</script>
