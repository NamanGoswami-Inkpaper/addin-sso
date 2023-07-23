/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const urlDev = "https://localhost:3000/";
const urlProd = "https://www.contoso.com/"; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const config = {
    devtool: "source-map",
    target: "node",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      vendor: ["react", "react-dom", "core-js", "@fluentui/react"],
      taskpane: ["react-hot-loader/patch", "./src/taskpane/index.tsx", "./src/taskpane/taskpane.html"],
      commands: "./src/commands/commands.ts",
      middletier:"./src/middle-tier/app.js",
      fallbackauthdialog: "./src/helpers/fallbackauthdialog.js",
    },
    output: {
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-typescript"],
            },
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: ["react-hot-loader/webpack", "ts-loader"],
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext][query]",
          },
        },
        { test: /\.svg$/, loader: 'svg-inline-loader' }
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets/*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "manifest*.xml",
            to: "[name]" + "[ext]",
            transform(content) {
              if (dev) {
                return content;
              } else {
                return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
              }
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["taskpane", "vendor", "polyfills"],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["commands"],
      }),
      new webpack.ProvidePlugin({
        Promise: ["es6-promise", "Promise"],
      }),
    ],
    devServer: {
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 3000,
    },
  };

  return config;
};


/* eslint-disable no-undef */

// const CopyWebpackPlugin = require("copy-webpack-plugin");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const nodeExternals = require("webpack-node-externals");

// const urlDev = "https://localhost:3000/";
// const urlProd = "https://www.contoso.com/"; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

// module.exports = async (env, options) => {
//   const dev = options.mode === "development";
//   const config = [{
//     devtool: "source-map",
//     entry: {
//       polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
//       vendor: ["react", "react-dom", "core-js", "@fluentui/react"],
//       taskpane: ["react-hot-loader/patch", "./src/taskpane/index.tsx", "./src/taskpane/taskpane.html"],
//       commands: "./src/commands/commands.ts",
//     },
//     output: {
//       clean: true,
//     },
//     resolve: {
//       extensions: [".ts", ".tsx", ".html", ".js"],
//         fallback: {
//           buffer: require.resolve("buffer/"),
//           http: require.resolve("stream-http"),
//           https: require.resolve("https-browserify"),
//           url: require.resolve("url/"),
//         },
//       },
//       module: {
//         rules: [
//           {
//             test: /\.js$/,
//             exclude: /node_modules/,
//             use: {
//               loader: "babel-loader",
//               options: {
//                 presets: ["@babel/preset-env"],
//               },
//             },
//           },
//           {
//             test: /\.html$/,
//             exclude: /node_modules/,
//             use: "html-loader",
//           },
//           {
//             test: /\.(png|jpg|jpeg|gif|ico)$/,
//             type: "asset/resource",
//             generator: {
//               filename: "assets/[name][ext][query]",
//             },
//           },
//         ],
//       },
//       plugins: [
//         new HtmlWebpackPlugin({
//           filename: "taskpane.html",
//           template: "./src/taskpane/taskpane.html",
//           chunks: ["polyfill", "taskpane"],
//         }),
//         new HtmlWebpackPlugin({
//           filename: "commands.html",
//           template: "./src/commands/commands.html",
//           chunks: ["polyfill", "commands"],
//         }),
//         new HtmlWebpackPlugin({
//           filename: "fallbackauthdialog.html",
//           template: "./src/helpers/fallbackauthdialog.html",
//           chunks: ["polyfill", "fallbackauthdialog"],
//         }),
//         new CopyWebpackPlugin({
//           patterns: [
//             {
//               from: "assets/*",
//               to: "assets/[name][ext][query]",
//             },
//             {
//               from: "manifest*.xml",
//               to: "[name]" + "[ext]",
//               transform(content) {
//                 if (dev) {
//                   return content;
//                 } else {
//                   return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
//                 }
//               },
//             },
//           ],
//         }),
//       ],
//     },
//     {
//       devtool: "source-map",
//       target: "node",
//       entry: {
//         middletier: "./src/middle-tier/app.js",
//       },
//       output: {
//         clean: true,
//       },
//       externals: [nodeExternals()],
//       resolve: {
//         extensions: [".ts", ".tsx", ".html", ".js"],
//       },
//       module: {
//         rules: [
//           {
//                       test: /\.ts$/,
//                       exclude: /node_modules/,
//                       use: {
//                         loader: "babel-loader",
//                         options: {
//                           presets: ["@babel/preset-typescript"],
//                         },
//                       },
//                     },
//                     {
//                       test: /\.tsx?$/,
//                       exclude: /node_modules/,
//                       use: ["react-hot-loader/webpack", "ts-loader"],
//                     },
//           {
//             test: /\.js$/,
//             exclude: /node_modules/,
//             use: {
//               loader: "babel-loader",
//               options: {
//                 presets: ["@babel/preset-env"],
//               },
//             },
//           },
//           {
//                       test: /\.html$/,
//                       exclude: /node_modules/,
//                       use: "html-loader",
//                     },
//                     {
//                       test: /\.(png|jpg|jpeg|gif|ico)$/,
//                       type: "asset/resource",
//                       generator: {
//                         filename: "assets/[name][ext][query]",
//                       },
//                     },
//                     { test: /\.svg$/, loader: 'svg-inline-loader' }
//         ],
//       },
//       plugins: [
//         new CopyWebpackPlugin({
//           patterns: [
//             {
//               from: ".env",
//               to: ".",
//             },
//           ],
//         }),
//       ],
//     },
//   ];

//   return config;
// };
