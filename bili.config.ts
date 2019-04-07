import { Config } from 'bili'

const config: Config = {
  input: 'src/index.ts',
  output: {
    format: ['cjs', 'umd', 'umd-min', 'es'],
    fileName: 'vue-headroom[min].[format].js',
    moduleName: 'vueHeadroom'
  },
  plugins: {
    vue: {
      compileTemplate: true
    },
    typescript2: true
  },
  babel: {
    babelrc: false,
    configFile: true
  }
}

export default config
