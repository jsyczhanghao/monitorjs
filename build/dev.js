const typescript = require('rollup-plugin-typescript');
const path = require('path');

export default {
  input: path.resolve(__dirname, '../src/index.ts'),
  output: {
    file: path.resolve(__dirname, '../example/monitor.js'),
    format: 'umd',
    name: 'monitorjs'
  },
  plugins: [
    typescript({})
  ],
};