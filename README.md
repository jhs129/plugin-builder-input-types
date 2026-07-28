# plugin-builder-input-types

A pnpm/turborepo workspace for the CMSLink Builder.io plugin and its companion pieces.

## Packages

| Package | Path | Publish target | Purpose |
| --- | --- | --- | --- |
| `@jhsdc/builder-input-types` | `plugins/builder-input-types` | npm (public) | Builder.io custom input types plugin — registers the `CMSLink` and `NumberSlider` editors. Bundled with webpack into `dist/plugin.system.js`. |
| `builder-plugins` | `packages/builder-plugins` | workspace-only | The `CMSLink` React component (search-model selector, Algolia-backed) consumed by the plugin above at build time. Not published on its own. |
| `@jhsdc/create-dynamic-link` | `packages/create-dynamic-link` | npm (public) | `npx` scaffolder that copies the `DynamicLink` component and its `/dynamiclink` redirect route into a consumer's Next.js App Router project. |

## Getting started

```bash
pnpm install
pnpm build   # builds every package via turbo
pnpm lint
```

See each package's own README for usage details:

- [plugins/builder-input-types/README.md](plugins/builder-input-types/README.md)
- [packages/create-dynamic-link/README.md](packages/create-dynamic-link/README.md)
