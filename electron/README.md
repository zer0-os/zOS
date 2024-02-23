# zOS-electron

The `zOS-electron` application is managed separately from the main application here. [`Electron Forge`](https://www.electronforge.io/) is used for development, packaging, and pushing releases to GitHub.

## Development

- `npm install` inside this `electron` directory is required
- `npm run start` for local development
- `npm run package` to generate a packaged electron build
- `npm run make` to generate distributables (zips, installers, etc)
- `npm run publish` to generate a GitHub release with the distributables

## Configuration

- `forge.config.ts`: Electron Forge config
- `webpack.config.main.ts`: main process webpack config
- `webpack.config.preload.ts`: preload process webpack config
- `webpack.config.renderer.ts`: app (zOS) process webpack config
