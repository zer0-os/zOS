# ZERO

#### Flexible application platform for interacting with the Zer0 ecosystem

## Getting Started

1. clone the repo
1. generate a [GitHub Personal Access Token](https://github.com/settings/tokens) with the `read:package` scope
   1. add to npm by running `npm config set //npm.pkg.github.com/:\_authToken=YOUR_GITHUB_TOKEN`
1. run `npm install --legacy-peer-deps`
1. copy .env.example to .env and change/add the necessary values
1. run `npm start` to run the app or
1. `npm run test` to run the tests

## Ways to Participate

### Create an app

The [ZERO Feed app](https://github.com/zer0-os/zOS-feed) is the first core app, and provides a template to follow. Get in touch with the zOS core team to discuss having your app integrated.

1. fork the zOS repo, as new apps still require some changes to the platform at this stage.
1. follow the getting started steps above and make sure you have a running zOS instance.
1. add a repo for your new app. you can copy the feed app to get the basics, or just start from scratch.
1. an app is just a component that conforms to the interface required by the platform. once you have the basics of your app in place, you can add it to the platform to make sure it loads correctly:
   1. create a new folder for your app in [src/apps](https://github.com/zer0-os/zOS/tree/main/src/apps)
      - if your app is externally hosted, create an index.tsx file that uses the [ExternalApp](https://github.com/zer0-os/zOS/blob/main/src/apps/external-app/index.tsx) component and points to your app.
   1. add your app component to the [AppRouter](https://github.com/zer0-os/zOS/blob/main/src/apps/app-router.tsx)
   1. add a link to your app in the [AppBar](https://github.com/zer0-os/zOS/blob/3ace5002ed7561d3e0e3671982e3ee755fb97048/src/components/app-bar/index.tsx)
   1. once you have a stable version of your app, you can create a PR to the core zOS repo with the platform changes, and the version of your app you would like released.

### Contribute to the Platform

There is always work to be done on the core platform, so if you've noticed a bug or want to get involved at a deeper level, feel free to open a PR, or get in touch with the core team. Be sure to check out the [contributing guidelines](CONTRIBUTING.md) and [style guide](STYLE_GUIDE.md) before opening a PR.

### Architecture

A high level overview of the Component, Connected Component, Redux Saga, Normalizr, Redux architecture: https://miro.com/app/board/uXjVPL_sxFI=/

### Deployment

#### Production

1. Increment the version number in the `package.json` file and update the `package-lock.json` (`npm install --package-lock-only`)
1. Create a PR and merge your version update
1. View https://github.com/zer0-os/zOS/releases, find your new release and edit it, ensure that `Set as the latest release` is checked, and click the `Publish Release` button
1. View https://github.com/zer0-os/zOS/actions, watch for your release deployment to complete
1. View https://zos.zero.tech, open the Developer Tools Console, verify that your version number is correct (matches your version increment in package.json from the first step)

#### Matrix

For local development you can test against the development home server or run our matrix server locally: [https://github.com/zer0-os/zOS-chat-server](https://github.com/zer0-os/zOS-chat-server). If you want to run against your local home server set the env var and restart zOS: `REACT_APP_MATRIX_HOME_SERVER_URL=http://localhost:8008`
