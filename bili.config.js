module.exports = {
  input: 'src/index.js',
  output: {
    format: ['cjs', 'umd', 'umd-min', 'es'],
    fileName: 'vue-headroom[min].[format].js',
    moduleName: 'vueHeadroom'
  },
  plugins: {
    vue: {
      compileTemplate: true
    }
  },
  babel: {
    babelrc: false,
    exclude: 'node_modules/**',
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 3
        }
      ]
    ]
  },
  banner: {
    year: 2016
  }
}
