# @jhsdc/create-dynamic-link

Scaffolds the `DynamicLink` component and its `/dynamiclink` redirect route straight into your Next.js App Router project — shadcn-style. There's no runtime npm dependency to keep updated; the CLI copies editable source files into your own repo so you can adapt them to your project.

Pairs with [`@jhsdc/builder-input-types`](../../plugins/builder-input-types) — the `DynamicLink` component renders the value produced by that plugin's `CMSLink` field editor.

## Usage

From the root of your Next.js project:

```bash
npx @jhsdc/create-dynamic-link
```

This writes:

- `components/DynamicLink/` (or `src/components/DynamicLink/` if a `src/` directory exists) — the `DynamicLink` component, its Builder.io Gen2 registration, and a small self-contained theme system it depends on.
- `app/dynamiclink/[model]/[type]/[id]/route.ts` (or under `src/app/` — same detection rule) — the redirect handler.

Existing files are left alone on repeat runs. Pass `--force` to overwrite, or `--app-dir=<path>` / `--components-dir=<path>` to override the detected locations.

```bash
npx @jhsdc/create-dynamic-link --force
npx @jhsdc/create-dynamic-link --app-dir=apps/web/app --components-dir=apps/web/components/DynamicLink
```

## What gets copied

### `components/DynamicLink`

| File | Purpose |
| --- | --- |
| `index.tsx` | The `DynamicLink` component. Renders a Next.js `<Link>`, resolving a `CMSLinkProps` value (from the `CMSLink` input) to either a raw URL or, for a model reference, `/dynamiclink/{model}/builder/{referenceId}`. |
| `DynamicLink.builder.registration.tsx` | A `RegisteredComponent[]` you can pass to your Builder.io Gen2 SDK registration list (`@builder.io/sdk-react`). |
| `theme.ts`, `ThemeContext.tsx`, `useTheme.ts`, `ThemeProvider.tsx` | A minimal theme system (`light`/`dark`/etc.) used only when `inheritTheme={false}` is passed explicitly. Delete these and simplify `index.tsx` if you don't need themed variants — `DynamicLink` otherwise renders a plain `<Link>` with no theme wrapper. |
| `types.ts` | `CMSLinkProps` (the shape produced by the CMSLink input) and `Stylable`. |

### `app/dynamiclink/[model]/[type]/[id]/route.ts`

A `GET` route handler that resolves a Builder.io content reference to its live URL and issues a 307 redirect. `DynamicLink` links to this route whenever an editor picks "link to content" instead of typing a raw URL, so the link keeps working even if the target's slug changes later — the route looks up the current value at request time.

**Why this exists as a copied file, not an import:** Next.js App Router discovers routes by file path under your project's `app/` directory — that file-based convention can't be satisfied by an npm package alone, and where a URL should redirect to for a given model (`slug`, `handle`, a raw `url` field, or something else) is inherently specific to your content models. You're expected to open the generated file and edit `MODEL_CONFIG`.

```ts
const MODEL_CONFIG: Record<string, ModelConfig> = {
  article: { field: "slug", toPath: (slug) => `/blogs/${slug}` },
  event: { field: "handle", toPath: (handle) => `/events/${handle}` },
  // add an entry for every model DynamicLink should be able to deep-link to
};
```

Models not listed fall back to reading a `url` field directly off the entry.

**Required environment variable:** `NEXT_PUBLIC_BUILDER_API_KEY` — the same public API key your Builder.io SDK client already uses. The route queries `https://cdn.builder.io/api/v3/graphql/{apiKey}` directly, so no additional server-side secret is needed.

## Peer requirements

The copied component/route source expects these to already be installed in your project (not bundled, not auto-installed):

- `react`, `react-dom`
- `next` (App Router)
- `@builder.io/sdk-react` (for the `RegisteredComponent` type used by the registration file — only needed if you use the Gen2 registration export)
