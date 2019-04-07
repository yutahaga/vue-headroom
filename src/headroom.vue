<template>
  <div :class="cls">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import checkActions, { States } from './checkActions'
import support3d from './support3d'

type Prop<T> = () => T

const defaultCls = {
  pinned: 'headroom--pinned',
  unpinned: 'headroom--unpinned',
  top: 'headroom--top',
  notTop: 'headroom--not-top',
  bottom: 'headroom--bottom',
  notBottom: 'headroom--not-bottom',
  initial: 'headroom'
}

export default Vue.extend({
  name: 'vueHeadroom',

  data() {
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
      default: (): Window | HTMLElement => window
    },

    disabled: {
      type: Boolean as Prop<boolean>,
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
      type: Object as Prop<typeof defaultCls>,
      default() {
        return defaultCls
      }
    }
  },

  watch: {
    disabled(newVal: boolean) {
      if (newVal) {
        this.scroller().removeEventListener('scroll', this._handleScroll)
      } else {
        this.scroller().addEventListener('scroll', this._handleScroll)
      }
    }
  },

  mounted() {
    this.isSupport3d = support3d()

    if (!this.disabled) {
      this.scroller().addEventListener('scroll', this._handleScroll)
    }

    // When headroom is mounted, call handleScroll to set initial state.
    this._handleScroll()
  },

  beforeDestroy() {
    this.scroller().removeEventListener('scroll', this._handleScroll)
  },

  computed: {
    clsOpts(): typeof defaultCls {
      return {
        ...defaultCls,
        ...this.classes
      }
    },

    cls(): Record<string, boolean> {
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

    isInTop(): boolean {
      return this.state === 'pinned' || this.state === 'unpinned'
    }
  },

  methods: {
    _getViewportHeight: (): number => {
      return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    },

    _getElementPhysicalHeight: (elm: HTMLElement): number => Math.max(elm.offsetHeight, elm.clientHeight),

    _getDocumentHeight: (): number => {
      const body = document.body
      const documentElement = document.documentElement

      return Math.max(
        body.scrollHeight,
        documentElement.scrollHeight,
        body.offsetHeight,
        documentElement.offsetHeight,
        body.clientHeight,
        documentElement.clientHeight
      )
    },

    _getElementHeight: (elm: HTMLElement): number => Math.max(elm.scrollHeight, elm.offsetHeight, elm.clientHeight),

    _getScrollerPhysicalHeight(): number {
      const parent = this.scroller()

      return parent === window || parent === document.body
        ? this._getViewportHeight()
        : this._getElementPhysicalHeight(parent)
    },

    _getScrollerHeight(): number {
      const parent = this.scroller()

      return parent === window || parent === document.body ? this._getDocumentHeight() : this._getElementHeight(parent)
    },

    _isOutOfBound(currentScrollY: number): boolean {
      const pastTop = currentScrollY < 0

      const scrollerPhysicalHeight = this._getScrollerPhysicalHeight()
      const scrollerHeight = this._getScrollerHeight()

      const pastBottom = currentScrollY + scrollerPhysicalHeight > scrollerHeight

      return pastTop || pastBottom
    },

    _handleScroll(): void {
      window.requestAnimationFrame(this.update)
    },

    _getScrollY(): number {
      let top
      if (this.scroller().pageYOffset !== undefined) {
        top = this.scroller().pageYOffset
      } else if (this.scroller().scrollTop !== undefined) {
        top = this.scroller().scrollTop
      } else {
        top = (document.documentElement || document.body.parentNode || document.body).scrollTop
      }
      return top
    },

    update(): void {
      this.currentScrollY = this._getScrollY()

      if (this._isOutOfBound(this.currentScrollY)) {
        return
      }

      if (this.currentScrollY <= this.offset) {
        this.top()
      } else {
        this.notTop()
      }

      if (Math.round(this.currentScrollY) + this._getViewportHeight() >= this._getScrollerHeight()) {
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

    top(): void {
      if (!this.isTop) {
        this.isTop = true
        this.isNotTop = false
        this.$emit('top')
      }
    },

    notTop(): void {
      if (!this.isNotTop) {
        this.isTop = false
        this.isNotTop = true
        this.$emit('not-top')
      }
    },

    bottom(): void {
      if (!this.isBottom) {
        this.isBottom = true
        this.isNotBottom = false
        this.$emit('bottom')
      }
    },

    notBottom(): void {
      if (!this.isNotBottom) {
        this.isNotBottom = true
        this.isBottom = false
        this.$emit('not-bottom')
      }
    },

    pin(): void {
      if (!this.isPinned) {
        this.isPinned = true
        this.isUnpinned = false
        this.$emit('pin')
        setTimeout(() => {
          this.state = 'pinned'
        }, 0)
      }
    },

    unpin(): void {
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
})
</script>
