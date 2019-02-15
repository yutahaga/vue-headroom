/*!
 * vue-headroom v0.9.0
 * (c) 2016-present dalphyx <wjcbmk@gmail.com>
 * Released under the MIT License.
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var raf = _interopDefault(require('raf'));

function checkActions(states) {
  var direction = states.currentScrollY >= states.lastScrollY ? 'down' : 'up';
  var distanceScrolled = Math.abs(states.currentScrollY - states.lastScrollY);
  var action; // Scrolling down and past the offset.
  // Unpinned the header.

  if (direction === 'down' && states.currentScrollY >= states.offset && distanceScrolled > states.downTolerance) {
    action = 'unpin'; // Now, it's time to up.
    // Pin the header.
  } else if (direction === 'up' && distanceScrolled > states.upTolerance || states.currentScrollY <= states.offset) {
    action = 'pin';
  }

  return action;
}

// borrowed from modernizr
// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/transforms3d.js
function supports3d() {
  var div = document.createElement('div');
  var ret = false;
  var properties = ['perspectiveProperty', 'WebkitPerspective'];

  for (var i = properties.length - 1; i >= 0; i--) {
    ret = ret ? ret : div.style[properties[i]] !== undefined;
  }

  if (ret) {
    var st = document.createElement('style');
    st.textContent = '#modernizr{width:0;height:0} @media (transform-3d),(-webkit-transform-3d){#modernizr{width:7px;height:18px;margin:0;padding:0;border:0}}';
    document.getElementsByTagName('head')[0].appendChild(st);
    div.id = 'modernizr';
    document.body.appendChild(div);
    ret = div.offsetWidth === 7 && div.offsetHeight === 18;
    st.parentNode.removeChild(st);
    div.parentNode.removeChild(div);
  }

  return ret;
}

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultCls = {
  pinned: 'headroom--pinned',
  unpinned: 'headroom--unpinned',
  top: 'headroom--top',
  notTop: 'headroom--not-top',
  bottom: 'headroom--bottom',
  notBottom: 'headroom--not-bottom',
  initial: 'headroom'
};

var headroom = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { class: _vm.cls }, [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'vueHeadroom',

  data: function data() {
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
    };
  },


  props: {
    scroller: {
      type: Function,
      default: function _default() {
        return window;
      }
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

    onPin: Function,
    onUnpin: Function,
    onTop: Function,
    onNotTop: Function,
    onBottom: Function,
    onNotBottom: Function,

    offset: {
      type: Number,
      default: 0
    },

    classes: {
      type: Object,
      default: function _default() {
        return defaultCls;
      }
    }
  },

  watch: {
    disabled: function disabled(newVal) {
      if (newVal) {
        this.scroller().removeEventListener('scroll', this._handleScroll);
      } else {
        this.scroller().addEventListener('scroll', this._handleScroll);
      }
    }
  },

  mounted: function mounted() {
    this.isSupport3d = supports3d();

    if (!this.disabled) {
      this.scroller().addEventListener('scroll', this._handleScroll);
    }

    // When headroom is mounted, call handleScroll to set initial state.
    this._handleScroll();
  },
  beforeDestroy: function beforeDestroy() {
    this.scroller().removeEventListener('scroll', this._handleScroll);
  },


  computed: {
    clsOpts: function clsOpts() {
      return _extends({}, defaultCls, this.classes);
    },
    cls: function cls() {
      var _ref;

      var cls = this.clsOpts;
      return this.disabled ? {} : (_ref = {}, _defineProperty(_ref, cls.top, this.isTop), _defineProperty(_ref, cls.notTop, this.isNotTop), _defineProperty(_ref, cls.bottom, this.isBottom), _defineProperty(_ref, cls.notBottom, this.isNotBottom), _defineProperty(_ref, cls.pinned, this.isPinned), _defineProperty(_ref, cls.unpinned, this.isUnpinned), _defineProperty(_ref, cls.initial, true), _ref);
    },
    isInTop: function isInTop() {
      return this.state === 'pinned' || this.state === 'unpinned';
    }
  },

  methods: {
    _getViewportHeight: function _getViewportHeight() {
      return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    },

    _getElementPhysicalHeight: function _getElementPhysicalHeight(elm) {
      return Math.max(elm.offsetHeight, elm.clientHeight);
    },

    _getDocumentHeight: function _getDocumentHeight() {
      var body = document.body;
      var documentElement = document.documentElement;

      return Math.max(body.scrollHeight, documentElement.scrollHeight, body.offsetHeight, documentElement.offsetHeight, body.clientHeight, documentElement.clientHeight);
    },

    _getElementHeight: function _getElementHeight(elm) {
      return Math.max(elm.scrollHeight, elm.offsetHeight, elm.clientHeight);
    },

    _getScrollerPhysicalHeight: function _getScrollerPhysicalHeight() {
      var parent = this.scroller();

      return parent === window || parent === document.body ? this._getViewportHeight() : this._getElementPhysicalHeight(parent);
    },
    _getScrollerHeight: function _getScrollerHeight() {
      var parent = this.scroller();

      return parent === window || parent === document.body ? this._getDocumentHeight() : this._getElementHeight(parent);
    },
    _isOutOfBound: function _isOutOfBound(currentScrollY) {
      var pastTop = currentScrollY < 0;

      var scrollerPhysicalHeight = this._getScrollerPhysicalHeight();
      var scrollerHeight = this._getScrollerHeight();

      var pastBottom = currentScrollY + scrollerPhysicalHeight > scrollerHeight;

      return pastTop || pastBottom;
    },
    _handleScroll: function _handleScroll() {
      raf(this.update);
    },
    _getScrollY: function _getScrollY() {
      var top = void 0;
      if (this.scroller().pageYOffset !== undefined) {
        top = this.scroller().pageYOffset;
      } else if (this.scroller().scrollTop !== undefined) {
        top = this.scroller().scrollTop;
      } else {
        top = (document.documentElement || document.body.parentNode || document.body).scrollTop;
      }
      return top;
    },
    update: function update() {
      this.currentScrollY = this._getScrollY();

      if (this._isOutOfBound(this.currentScrollY)) {
        return;
      }

      if (this.currentScrollY <= this.offset) {
        this.top();
      } else {
        this.notTop();
      }

      if (this.currentScrollY + this._getViewportHeight() >= this._getScrollerHeight()) {
        this.bottom();
      } else {
        this.notBottom();
      }

      var action = checkActions(this);

      if (action === 'pin') {
        this.pin();
      } else if (action === 'unpin') {
        this.unpin();
      }

      this.lastScrollY = this.currentScrollY;
    },
    top: function top() {
      if (!this.isTop) {
        this.isTop = true;
        this.isNotTop = false;
        this.onTop && this.onTop();
      }
    },
    notTop: function notTop() {
      if (!this.isNotTop) {
        this.isTop = false;
        this.isNotTop = true;
        this.onNotTop && this.onNotTop();
      }
    },
    bottom: function bottom() {
      if (!this.isBottom) {
        this.isBottom = true;
        this.isNotBottom = false;
        this.onBottom && this.onBottom();
      }
    },
    notBottom: function notBottom() {
      if (!this.isNotBottom) {
        this.isNotBottom = true;
        this.isBottom = false;
        this.onNotBottom && this.onNotBottom();
      }
    },
    pin: function pin() {
      var _this = this;

      if (!this.isPinned) {
        this.isPinned = true;
        this.isUnpinned = false;
        this.onPin && this.onPin();
        this.$emit('pin');
        setTimeout(function () {
          _this.state = 'pinned';
        }, 0);
      }
    },
    unpin: function unpin() {
      var _this2 = this;

      if (this.isPinned || !this.isUnpinned) {
        this.isUnpinned = true;
        this.isPinned = false;
        this.onUnpin && this.onUnpin();
        this.$emit('unpin');
        setTimeout(function () {
          _this2.state = 'unpinned';
        }, 0);
      }
    }
  }

};

var install = function install(Vue) {

  if (install.installed) {
    return;
  }

  Vue.component(headroom.name, headroom);
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

var index = {
  headroom: headroom,
  install: install
};

module.exports = index;
