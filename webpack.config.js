const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const adminConfig = {
  context: path.resolve(__dirname, "src/admin-app"),
  entry: {
    main: { import: "./index.tsx" },
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".tsx"],
    modules: ["node_modules", "src"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { runtime: "automatic" }],
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    static: "./build",
    proxy: { "/": "http://localhost:3002/admin" },
    hot: true,
    port: 3002,
    historyApiFallback: true,
    client: { overlay: { warnings: false, errors: true } },
  },
  target: "web",
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      chunks: ["main"],
      publicPath: "/admin",
      template: "assets/index-template.html",
    }),
    new MiniCssExtractPlugin({
      filename: "admin-app.css",
    }),
  ],
  output: {
    filename: "admin-app.js",
    path: path.resolve(__dirname, "build/admin"),
    clean: true,
    publicPath: "/admin",
  },
};

const clientConfig = {
  context: path.resolve(__dirname, "src/client-app"),
  entry: {
    main: { import: "./index.tsx" },
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    modules: ["node_modules", "src"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { runtime: "automatic" }],
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    static: "./build",
    hot: true,
    port: 3001,
    historyApiFallback: true,
    client: { overlay: { warnings: false, errors: true } },
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      publicPath: "/",
      template: "assets/index-template.html",
    }),
    new MiniCssExtractPlugin({
      filename: "client-app.css",
    }),
  ],
  target: "web",
  output: {
    filename: "client-app.js",
    path: path.resolve(__dirname, "build"),
    clean: true,
    publicPath: "",
  },
};

module.exports = (env) => {
  console.log("env", env);
  if (!env.WEBPACK_SERVE) {
    return [adminConfig, clientConfig];
  }

  if (env.project === "admin") {
    return adminConfig;
  }

  return clientConfig;
};
