# @jhsdc/builder-input-types

Custom [Builder.io](https://www.builder.io) input types plugin. Registers a `CMSLink` editor for linking to a URL or a piece of Builder.io content, plus a `NumberSlider` input.

## Install

```bash
pnpm add @jhsdc/builder-input-types
```

## Usage

Register the plugin's bundled file (`dist/plugin.system.js`) as a Builder.io plugin, either by publishing it somewhere Builder.io's editor can fetch it (e.g. a CDN or static host) and adding that URL under **Account Settings → Plugins**, or by pointing your own build tooling at the file exposed by this package's `main` entry.

The plugin registers a `CMSLink` field editor that lets content editors choose between:

- An external **URL**
- A reference to a specific **model** entry (searchable by model name)

Configure which content models are searchable via the plugin's settings panel in Builder.io (**CMS Link Settings → Content Models to Search**).

## Peer dependencies

This plugin bundle expects the following to be available in the Builder.io editor environment at runtime (declared as `peerDependencies`, not bundled):

- `react`
- `react-dom`
- `@builder.io/react`
- `@builder.io/app-context`

## Development

From the repo root:

```bash
pnpm install
pnpm --filter @jhsdc/builder-input-types dev    # webpack-dev-server
pnpm --filter @jhsdc/builder-input-types build   # production bundle -> dist/plugin.system.js
```
