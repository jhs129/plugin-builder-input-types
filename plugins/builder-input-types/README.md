# @jhsdc/builder-input-types

A custom [Builder.io](https://www.builder.io) plugin that registers a `CMSLink` field editor — a link input that lets content editors choose between an external URL and a live reference to another piece of Builder.io content.

Distributed as a pre-bundled `dist/plugin.system.js` file that you register directly in your Builder.io space; there's nothing to `import` into application code.

## Table of contents

- [How it works](#how-it-works)
- [Install](#install)
- [Configuration](#configuration)
- [The CMSLink value shape](#the-cmslink-value-shape)
- [Rendering the value](#rendering-the-value)
- [Peer dependencies](#peer-dependencies)
- [Development](#development)
- [Package layout](#package-layout)
- [Troubleshooting](#troubleshooting)

## How it works

Builder.io lets a plugin register a custom "editor" — a React component that renders in place of the default field UI whenever a component input declares that editor's `type`. This package registers one:

```ts
Builder.registerEditor({
  name: "CMSLink",
  component: CMSLinkInput,
});
```

Any component input declared with `"type": "CMSLink"` (in your app's Builder.io component registrations) renders this editor instead of a plain text box. The editor shows a **Type** selector (`URL` / `Reference`) and, for `Reference`, a **Select** button that opens a modal to search and pick a live entry from one of your configured content models.

The counterpart on the rendering side is [`@jhsdc/create-dynamic-link`](../../packages/create-dynamic-link) — its `DynamicLink` component knows how to render whatever value this editor produces.

## Install

This package isn't `npm install`ed into an app. Instead, host `dist/plugin.system.js` somewhere Builder.io's editor can fetch it (npm's CDN mirrors work well for this — no separate hosting/deploy needed), then register that URL:

1. Go to **Space Settings → Plugins** in Builder.io.
2. Under **Custom Plugins**, add:
   ```
   https://cdn.jsdelivr.net/npm/@jhsdc/builder-input-types@1/dist/plugin.system.js
   ```
   (Pin an exact version instead of the `@1` range if you want reproducible behavior across environments — e.g. `@1.0.0`.)
3. Save. Builder.io fetches and evaluates the bundle, which self-registers the `CMSLink` editor and a **CMS Link** plugin settings panel.

## Configuration

After installing, a **CMS Link** entry appears under **Space Settings → Plugins** with one setting group:

| Setting | Type | Purpose |
| --- | --- | --- |
| CMS Link Settings → Content Models to Search | list of `{ name, displayName }` | Which Builder.io models the **Reference** picker searches, and the label shown for each in its dropdown. `name` must match the actual model name in your space; `displayName` is cosmetic. |

If you don't configure this list, the editor falls back to a built-in default of `page` and `data`.

The editor also needs a Builder.io **public API key** to query the Content API for search results and to resolve a previously-picked reference's display name. It resolves this automatically from the Builder.io app context (`appState.user.mainSpaceApiKey`) — no separate configuration is required for the common case of linking within the same space.

## The CMSLink value shape

Whatever a content editor picks is saved on the input as a plain object:

```ts
type CMSLinkValue = {
  type: "url" | "model";
  href: string;         // raw URL for type "url"; a best-guess path for type "model" (see below)
  model?: string;        // model name, only set when type is "model"
  referenceId?: string;  // the picked entry's id, only set when type is "model"
};
```

- **`type: "url"`** — `href` is whatever the editor typed. `model` / `referenceId` are cleared.
- **`type: "model"`** — the editor searched a model and picked an entry. `model` is that model's name, `referenceId` is the entry's Builder.io `id`, and `href` is set from that entry's `data.url` or `data.slug` at pick-time — but this is a snapshot, not something to rely on for rendering (see below), since the target's slug can change after the fact.

## Rendering the value

Don't render `href` directly for `type: "model"` values — it's a snapshot taken when the editor picked the entry, and goes stale if the target's slug/URL changes later. Instead:

- Use [`@jhsdc/create-dynamic-link`](../../packages/create-dynamic-link) to scaffold the `DynamicLink` component, which resolves `type: "model"` values to `/dynamiclink/{model}/builder/{referenceId}` — a route that looks up the live URL at request time.
- Or replicate that same resolution logic yourself if you're not using the `DynamicLink` component.

## Peer dependencies

The Builder.io editor environment already provides these at runtime, so they're declared as `peerDependencies`, not bundled into `dist/plugin.system.js`:

- `react` ^19
- `react-dom` ^19
- `@builder.io/react` ^8
- `@builder.io/app-context` ^1

## Development

From the repo root:

```bash
pnpm install
pnpm --filter @jhsdc/builder-input-types dev     # webpack-dev-server on :1269
pnpm --filter @jhsdc/builder-input-types build    # production bundle -> dist/plugin.system.js
pnpm --filter @jhsdc/builder-input-types lint
pnpm --filter @jhsdc/builder-input-types type-check
```

To iterate against a real space while developing, register `http://localhost:1269/plugin.system.js` as the plugin URL instead of the published one, then reload the Builder.io editor after each change.

## Package layout

```
src/
  plugin.tsx                    entry point — injects Tailwind, registers the CMSLink editor + plugin settings
  components/
    CMSLinkInput.tsx            editor wrapper: reads plugin settings/apiKey from Builder.io app context, renders CMSLink
    NumberSlider.tsx            a range-input + number-input component (not currently registered as an editor — see below)
  types/                        shared TypeScript types for the above
  tw.css                        Tailwind entry, injected as a <style> tag into the plugin's rendering root at runtime
```

The actual search/select UI (`CMSLink`) lives in the sibling [`packages/builder-plugins`](../../packages/builder-plugins) workspace package and is bundled in at build time via a webpack alias (`@builder-plugins` → `packages/builder-plugins/src`) — it is not a runtime npm dependency of the published package.

**Note on `NumberSlider`:** the component ships in this bundle but `plugin.tsx` does not currently call `Builder.registerEditor` for it, so it isn't yet selectable as a field editor in Builder.io. It's available for a future registration if you want a slider-based numeric input.

## Troubleshooting

- **Styles look unstyled / editor renders as plain HTML inputs.** The plugin injects its Tailwind CSS into whichever Shadow DOM root Builder.io mounts the variation/styles panel into (`[data-variation-panel]` or `[data-styles-panel]`), falling back to `document.head`. If Builder.io changes those DOM hooks in a future release, the style injection in `plugin.tsx` will need updating to match.
- **Reference picker shows no results.** Confirm the model name under CMS Link Settings exactly matches a model in your space, and that the resolved API key has read access to it.
- **Picked content's label shows "Content not found."** The editor looks up the entry by `id` via the Content API to display its name — this fails if the entry was deleted, or if the resolved API key doesn't have access to the space it lives in.
