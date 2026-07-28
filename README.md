# plugin-builder-input-types

A pnpm/turborepo workspace for the **CMSLink** Builder.io plugin and its companion pieces: a custom link field editor for Builder.io, plus the app-side component and route needed to render what it produces.

## What this solves

Builder.io lets editors link to a URL, but out of the box there's no first-class way to link to *another piece of content* such that the link keeps working after that content's slug changes. This repo provides both halves of that:

- **In the Builder.io editor**: a `CMSLink` field type that lets editors search and pick a live content entry (or type a raw URL).
- **In your Next.js app**: a `DynamicLink` component that renders whatever the editor picked, plus a redirect route that resolves a content reference to its current URL at request time — so a slug rename in Builder.io never breaks an existing link.

```
┌─────────────────────────┐     picks a URL or a content       ┌──────────────────────────┐
│  Builder.io editor UI    │ ──  reference (CMSLink value)  ──> │  Saved on the component   │
│  (CMSLink field editor)  │                                    │  input as {type, href,    │
└─────────────────────────┘                                     │  model?, referenceId?}    │
            ▲                                                    └────────────┬─────────────┘
            │ registered by                                                   │ rendered by
┌───────────┴───────────────┐                                   ┌─────────────▼─────────────┐
│ @jhsdc/builder-input-types │                                   │  DynamicLink component      │
│ (published plugin bundle)  │                                   │  (scaffolded into your app) │
└────────────────────────────┘                                   └─────────────┬─────────────┘
                                                                                 │ for type: "model", links to
                                                                   ┌─────────────▼─────────────┐
                                                                   │ /dynamiclink/[model]/       │
                                                                   │   [type]/[id]/route.ts      │
                                                                   │ looks up the live URL at    │
                                                                   │ request time, 307 redirects │
                                                                   └────────────────────────────┘
```

## Packages

| Package | Path | Publish target | Purpose |
| --- | --- | --- | --- |
| [`@jhsdc/builder-input-types`](plugins/builder-input-types) | `plugins/builder-input-types` | [npm](https://www.npmjs.com/package/@jhsdc/builder-input-types) (public) | Builder.io plugin — registers the `CMSLink` field editor. Bundled with webpack into `dist/plugin.system.js`, which you register as a plugin URL in your Builder.io space (not npm-installed into an app). |
| `builder-plugins` | `packages/builder-plugins` | workspace-only | The `CMSLink` React component (content search/select UI, backed directly by Builder.io's Content API) consumed by the plugin above at build time via a webpack alias. Not published on its own. |
| [`@jhsdc/create-dynamic-link`](packages/create-dynamic-link) | `packages/create-dynamic-link` | [npm](https://www.npmjs.com/package/@jhsdc/create-dynamic-link) (public) | `npx` scaffolder that copies the `DynamicLink` component and its `/dynamiclink` redirect route into a consumer's Next.js App Router project. |

## Setting up a new project end to end

1. **Register the plugin in Builder.io** — add `https://cdn.jsdelivr.net/npm/@jhsdc/builder-input-types@1/dist/plugin.system.js` under Space Settings → Plugins. See [plugins/builder-input-types/README.md](plugins/builder-input-types/README.md#install) for details, and configure which content models the picker should search.
2. **Scaffold the app-side pieces** — from your Next.js app's directory, run `npx @jhsdc/create-dynamic-link`. See [packages/create-dynamic-link/README.md](packages/create-dynamic-link/README.md#usage).
3. **Set `NEXT_PUBLIC_BUILDER_API_KEY`** in your app's environment — the scaffolded redirect route uses it to query the Content API.
4. **Edit `MODEL_CONFIG`** in the generated `app/dynamiclink/[model]/[type]/[id]/route.ts` for every content model you want `CMSLink`/`DynamicLink` to be able to deep-link to.
5. **Register `DynamicLink`** in your Builder.io Gen2 component list, importing `registration` from the scaffolded `DynamicLink.builder.registration.tsx`.
6. Add a `CMSLink`-typed input (e.g. `link`) to any component registration where you want editors to pick a link — that field will automatically render the plugin's editor.

## Getting started (this repo)

```bash
pnpm install
pnpm build   # builds every package via turbo
pnpm lint
```

See each package's own README for full usage details:

- [plugins/builder-input-types/README.md](plugins/builder-input-types/README.md)
- [packages/create-dynamic-link/README.md](packages/create-dynamic-link/README.md)
