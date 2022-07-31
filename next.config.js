require("dotenv").config()
const withImages = require('next-images')

const webpack = require("webpack")
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY)
const host = JSON.stringify(process.env.HOST)
const devApp = JSON.stringify(process.env.DEV_APP)

module.exports = withImages({
  images: {
    disableStaticImages: true
  },
  webpack: (config) => {
    const env = { API_KEY: apiKey, HOST: host, DEV_APP: devApp }
    config.plugins.push(new webpack.DefinePlugin(env))

    // Add ESM support for .mjs files in webpack 4
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    })

    return config
  },
})
