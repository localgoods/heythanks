// eslint-disable-next-line @typescript-eslint/no-var-requires
require('@babel/register')({
  presets: ['@babel/preset-env'],
  ignore: ['node_modules']
})

// Import the rest of our application.
module.exports = require('./server.js')
