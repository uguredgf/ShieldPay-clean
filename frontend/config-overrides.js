module.exports = function override(config) {
  config.resolve.fallback = {
    assert: require.resolve("assert/"),
    buffer: require.resolve("buffer/"),
    crypto: false,
    stream: false,
    path: false,
    fs: false,
  };

  config.resolve.extensionAlias = {
    ".js": [".js", ".ts"],
  };

  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  const webpack = require("webpack");
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: require.resolve("process/browser.js"),
    })
  );

  return config;
};