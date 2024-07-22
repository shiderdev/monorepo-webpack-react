# How to Create a Monorepo Using Webpack Configurations Instead of Workspaces (Typescript + React + MUI)

Managing multiple projects within a single repository (monorepo) has become a popular approach in modern web development. Monorepos offer several advantages, such as simplified dependency management and easier code sharing. While tools like `Lerna` and `npm` workspaces are commonly used to manage monorepos, you can also achieve this with Webpack configurations. This article will guide you through setting up a monorepo using Webpack configurations and pnpm, without relying on workspaces. In addition, you will learn how to run the projects locally using a Webpack Dev server, and how to share and extend MUI theme between the two React projects. You can find the complete code and a demo page in a link under this article.

## Step-by-Step Guide to Setting Up a Monorepo with Webpack

### Step 1: Setting Up the Project Structure

Start by creating a directory structure for your monorepo. In this example, we'll have two React applications (`admin-app` and `client-app`) and a shared code folder (`shared-code`).

```sh
mkdir my-monorepo
cd my-monorepo
mkdir admin-app client-app shared-code
```

### Step 2: Initialize the Monorepo

Initialize a new pnpm project in the root directory:

```sh
pnpm init
```

### Step 3: Install Dependencies

Install the necessary dependencies for React and Webpack in the root directory:

```sh
pnpm add react react-dom @mui/material @emotion/react @emotion/styled

pnpm add -D webpack webpack-cli webpack-dev-server babel-loader @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript html-webpack-plugin mini-css-extract-plugin css-loader style-loader ts-loader typescript
```

### Step 4: Create Webpack Configuration Files

We will create separate Webpack configurations for common settings and for each application. This allows us to share configuration across multiple projects while customizing specific settings for each app.

#### `webpack.js`

First, create a Webpack configuration file with the following contents:

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const adminConfig = {
  // omitted for brevity
};

const clientConfig = {
  // omitted for brevity
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
```

We have two objects `adminConfig` and `clientConfig` that contain each React app configuration. Webpack allows us to have a function returning one or multiple configurations. The `env` function parameter contains parameters passed through the console as well as other variables. `WEBPACK_SERVE` is always included if we start the webpack dev server. If we detect it, this means that we want to work on one of the apps. We pass an additional parameter `project` in the console to select the right app to be started with the dev server. We will return an array with both configuration in case that `WEBPACK_SERVE` is not present, because this means that a build command was executed.

Here is how the `scripts` part of your `package.json` file should look like

```json
"scripts": {
    "build": "webpack --mode=production --env mode=production",
    "start:admin": "webpack serve --open --mode=development --env project=admin",
    "start:client": "webpack serve --open --mode=development"
  },
```

If you want to work on the client app, you just type in

```sh
pnpm start:client
```

If you want to build both apps, just type

```sh
pnpm build
```

Before you can run the commands, we should fill in the exact configuration for each React app. Here is the configuration for the `client-app`

```js
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
```

This configuration sets up a Webpack build process for a React application using TypeScript, CSS, and HTML, with a development server configured for hot reloading.

#### Context and Entry

- **context**: Sets the base directory for resolving entry points and loaders to `src/client-app`.
- **entry**: Defines the entry point of the application, specifying `index.tsx` as the main entry file.

#### Resolve

- **extensions**: Automatically resolves certain file extensions, so you can import files without specifying their extensions (e.g., `.js`, `.ts`, `.tsx`).
- **modules**: Instructs Webpack to look for modules in `node_modules` and `src` directories.

#### Module Rules

- **module.rules**: Specifies how different file types should be processed.
  - **test: /\.tsx?$/**: Uses `babel-loader` for `.ts` and `.tsx` files, with presets for ES6, React, and TypeScript.
  - **test: /\.css$/i**: Uses `MiniCssExtractPlugin.loader` and `css-loader` to handle CSS files.
  - **test: /\.html$/i**: Uses `html-loader` to process HTML files.
  - **test: /\.ts$/**: Uses `ts-loader` for `.ts` files, excluding `node_modules`.

#### DevServer

- **devServer**: Configures the development server.
  - **static**: Serves static files from the `./build` directory.
  - **hot**: Enables hot module replacement.
  - **port**: Sets the development server to run on port `3001`.
  - **historyApiFallback**: Ensures the server responds to 404s with the index.html file, useful for single-page applications.
  - **client**: Configures client overlay settings to display only errors.

#### Plugins

- **plugins**: Utilizes plugins to extend Webpack's functionality.
  - **HtmlWebpackPlugin**: Generates an HTML file (`index.html`) using the specified template (`assets/index-template.html`), setting the public path to `/`.
  - **MiniCssExtractPlugin**: Extracts CSS into separate files (`client-app.css`).

#### Target

- **target**: Sets the build target to `web`, specifying the output should be optimized for web browsers.

#### Output

- **output**: Configures the output settings for the build.
  - **filename**: Specifies the name of the output bundle (`client-app.js`).
  - **path**: Sets the output directory to `build`.
  - **clean**: Cleans the output directory before each build.
  - **publicPath**: Sets the public URL of the output directory to an empty string.

The confguration for the `admin-app` is similar.

```js
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
```

The paths are changed to point to the app's folder `src/admin-app`. The HtmlWebpackPlugin and the output folder designate the `publicPath` as `/admin`, because the `admin-app` will be deployed in the path `/admin` after the domain, while the `client-app` will be deployed directly under the domain `/`. This change requires an additional property in the dev server configuration

```js
proxy: { "/": "http://localhost:3002/admin" }
```

This line will enable the web server to serve the `admin-app` from the index instead of the `/admin`. Please note, that both apps can be deployed on the same domain with the current configuration. However, if you start one dev server for each app to develop locally, the `client-app` will run on `localhost:3001` and the `admin-app` will run on `localhost:3002`.

### Step 6: Shared Code

Create shared code in the `shared-code` folder that can be used by both applications. I prefer to import any shared object or method mentioning only the folder's name like this

```ts
import { SomeComponent, someMethod } from "shared-code";
```

How can we achieve this? The `shared-code` folder has an `index.ts` file, that exports every object or method directly. We export the method `themeWithMode` that returns a React MUI theme object from `src/shared-code/theme/theme.ts`.

#### `shared-code/index.ts`

```ts
export * from "./theme/theme";
```

#### `shared-code/theme/theme.ts`

```ts
import { createTheme, PaletteMode, Theme } from "@mui/material";
import { ColorEnum, ThemeModeEnum } from "shared-code/enum";

type ThemeWithMode = (mode: PaletteMode) => Theme;
export const themeWithMode: ThemeWithMode = (mode) => {
  if (!(mode === ThemeModeEnum.light || mode === ThemeModeEnum.dark)) {
    mode = ThemeModeEnum.light;
  }
  return createTheme(
    {
      palette: {
        mode,
        primary: {
          main: ColorEnum.purple,
        },
      },
    },
    {
      components: {
        MuiTextField: {
          defaultProps: { variant: "filled" },
        },
      },
    }
  );
};
```

The exported theme has predefined settings that all text inputs should be of variant `filled` by default and sets the primary color to `purple`. In the next step, we will see how the `admin-app` will use the theme directly, while the `client-app` will take the theme and extend it.

### Step 7: Set Up Folder Structure for Each App

Create the necessary folders and files for each application.

#### `admin-app/src/index.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### `admin-app/src/App.tsx`

```tsx
import React from "react";
import "./app.css";
import { TextField, ThemeProvider } from "@mui/material";
import { themeWithMode } from "shared-code";

const App = () => {
  const theme = themeWithMode("light");
  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          margin: "auto",
          width: "400px",
          height: "400px",
          fontSize: "44px",
        }}
      >
        <p>Admin App</p>
        <TextField label="First Name" required sx={{ mr: 2, mb: 5 }} />
        <TextField label="Middle Name" sx={{ mr: 2, mb: 5 }} />
        <TextField label="Last Name" required />
      </div>
      ;
    </ThemeProvider>
  );
};

export default App;
```

#### `admin-app/src/assets/index-template.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Repeat similar steps for `client-app`.

#### `client-app/src/index.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### `client-app/src/App.tsx`

```tsx
import React from "react";
import "./app.css";
import { TextField, ThemeProvider } from "@mui/material";
import createCustomTheme from "./theme";
import { ThemeModeEnum } from "shared-code";

const App = () => {
  const theme = createCustomTheme(ThemeModeEnum.light);
  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          margin: "auto",
          width: "400px",
          height: "400px",
          fontSize: "44px",
        }}
      >
        <a href="/admin">Go to Admin Panel</a>
        <p>Client App</p>
        <TextField label="First Name" required sx={{ mr: 2 }} />
        <TextField label="Middle Name" sx={{ mr: 2 }} />
        <TextField label="Last Name" required />
      </div>
    </ThemeProvider>
  );
};

export default App;
```

#### `client-app/src/assets/index-template.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Client App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Instead of `themeWithMode` method from the `shared-code`, we use the `createCustomTheme` method from the theme.ts in the `client-app` root folder

```ts
import { createTheme, PaletteMode } from "@mui/material";
import { themeWithMode } from "shared-code";

const createCustomTheme = (mode: PaletteMode) =>
  createTheme(themeWithMode(mode), {
    components: {
      MuiTextField: {
        defaultProps: { variant: "outlined" },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: { borderRadius: 0, marginBottom: "20px" },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            fontSize: "36px",
          },
        },
      },
    },
  });

export default createCustomTheme;
```

We take the theme object from the `shared-code` and keep the primary color but change the text input's default variant to `outlined`. We also make the edges sharp and set a giant font of 36px for the input thus making the appearance in the `client-app` vastly different than the one in the `admin-app`. Webpack, React, and MUI offer a way to reduce code repetition without sacrificing the ability to customize and extend styles, settings, and other code.

### Step 8: Run the Applications

Add scripts to the `package.json` in the root directory to run each application.

#### `package.json`

```json
{
  "name": "monorepo-webpack",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "webpack --mode=production --env mode=production",
    "start:admin": "webpack serve --open --mode=development --env project=admin",
    "start:client": "webpack serve --open --mode=development --env project=client"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.21.4",
    "@babel/plugin-proposal-decorators": "^

7.21.0",
    "@babel/plugin-transform-runtime": "^7.21.4",
    "@babel/preset-env": "^7.21.4",
    "@babel/preset-react": "^7.18.6",
    "@babel/preset-typescript": "^7.24.7",
    "@typescript-eslint/eslint-plugin": "^5.60.0",
    "@typescript-eslint/parser": "^5.60.0",
    "babel-loader": "^9.1.2",
    "babel-plugin-transform-globalthis": "^1.0.0",
    "css-loader": "^6.7.3",
    "eslint": "^8.43.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-webpack-plugin": "^4.0.1",
    "file-loader": "^6.2.0",
    "html-loader": "^4.2.0",
    "html-webpack-plugin": "^5.5.1",
    "mini-css-extract-plugin": "^2.7.5",
    "postcss": "^8.4.23",
    "postcss-loader": "^7.2.4",
    "string-replace-loader": "^3.1.0",
    "style-loader": "^3.3.2",
    "ts-loader": "^9.4.2",
    "typescript": "^5.0.4",
    "url-loader": "^4.1.1",
    "webpack": "^5.80.0",
    "webpack-cli": "^5.0.1",
    "webpack-dev-server": "^4.13.3"
  },
  "dependencies": {
    "@emotion/react": "^11.13.0",
    "@emotion/styled": "^11.13.0",
    "@mui/material": "^5.16.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

Run the admin app:

```sh
pnpm start:admin
```

Run the client app:

```sh
pnpm start:client
```

### Conclusion

This setup allows you to manage multiple React applications within a single repository using Webpack configurations. By leveraging the shared code folder, you can maintain and reuse common code components across different applications, thus improving code maintainability and consistency. This approach is particularly useful when you want to avoid the complexity of workspace tools and prefer a more straightforward Webpack-based solution.
