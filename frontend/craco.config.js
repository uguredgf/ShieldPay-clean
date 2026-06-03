const path = require("path");
const webpack = require("webpack");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        assert: require.resolve("assert/"),
        buffer: require.resolve("buffer/"),
        crypto: false,
        stream: false,
        path: false,
        fs: false,
      };

      webpackConfig.resolve.extensionAlias = {
        ".js": [".js", ".ts"],
      };

      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
      });

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: require.resolve("process/browser.js"),
        })
      );

      return webpackConfig;
    },
  },
};
