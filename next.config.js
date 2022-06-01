require("dotenv").config();
const withImages = require('next-images')

const webpack = require("webpack");
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);
const host = JSON.stringify(process.env.HOST);

module.exports = withImages({
  images: {
    disableStaticImages: true
  },
  webpack: (config) => {
    const env = { API_KEY: apiKey, HOST: host };
    config.plugins.push(new webpack.DefinePlugin(env));

    // Add ESM support for .mjs files in webpack 4
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
});
