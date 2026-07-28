# @jhsdc/create-dynamic-link

Scaffolds the `DynamicLink` component and its `/dynamiclink` redirect route straight into your Next.js App Router project — shadcn-style. There's no runtime npm dependency to keep updated; the CLI copies editable source files into your own repo so you can adapt them to your project.

Pairs with [`@jhsdc/builder-input-types`](../../plugins/builder-input-types) — `DynamicLink` renders the value produced by that plugin's `CMSLink` field editor.

## Table of contents

- [End-to-end flow](#end-to-end-flow)
- [Usage](#usage)
- [Monorepo usage](#monorepo-usage)
- [CLI flags](#cli-flags)
- [What gets copied](#what-gets-copied)
- [Theming](#theming)
- [Peer requirements](#peer-requirements)
- [Troubleshooting](#troubleshooting)

## End-to-end flow

This CLI only makes sense in the context of the full CMSLink → DynamicLink → redirect pipeline:

1. A content editor edits a Builder.io component input of type `CMSLink` (registered by [`@jhsdc/builder-input-types`](../../plugins/builder-input-types)) and either types a URL or searches for and picks a live content entry.
2. Builder.io saves that pick as a plain value: `{ type: "model", model: "article", referenceId: "abc123", href: "..." }` (or `{ type: "url", href: "..." }` for a raw link).
3. Your Next.js app renders that value with the `DynamicLink` component this CLI scaffolds. For `type: "model"`, it doesn't use the saved `href` (which is a stale snapshot) — it links to `/dynamiclink/{model}/builder/{referenceId}` instead.
4. The scaffolded `app/dynamiclink/[model]/[type]/[id]/route.ts` handles that request: it queries the Builder.io Content API for the entry's current slug/handle/url at request time, and issues a 307 redirect to the real destination.

The net effect: editors can rename an article's slug in Builder.io at any time, and every `DynamicLink` pointing at it keeps working without a rebuild.

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

## Monorepo usage

Run the command from inside the Next.js app's own directory, not the monorepo root — detection (`src/app` vs `app`) is relative to the current working directory, and a monorepo root typically has neither.

```bash
cd apps/web         # the actual Next.js app inside your monorepo
npx @jhsdc/create-dynamic-link
```

If you'd rather invoke it from the monorepo root (e.g. from a root-level script), pass explicit paths instead of relying on detection:

```bash
npx @jhsdc/create-dynamic-link --app-dir=apps/web/src/app --components-dir=apps/web/src/components/DynamicLink
```

## CLI flags

| Flag | Default | Purpose |
| --- | --- | --- |
| `--force`, `-f` | off | Overwrite files that already exist instead of skipping them |
| `--app-dir=<path>` | auto-detected (`src/app` or `app`) | Where to write the `dynamiclink/[model]/[type]/[id]/route.ts` route |
| `--components-dir=<path>` | auto-detected (`src/components/DynamicLink` or `components/DynamicLink`) | Where to write the `DynamicLink` component files |
| `--help`, `-h` | — | Print usage and exit |

## What gets copied

### `components/DynamicLink`

| File | Purpose |
| --- | --- |
| `index.tsx` | The `DynamicLink` component. Renders a Next.js `<Link>`, resolving a `CMSLinkProps` value (from the `CMSLink` input) to either a raw URL or, for a model reference, `/dynamiclink/{model}/builder/{referenceId}`. |
| `DynamicLink.builder.registration.tsx` | A `RegisteredComponent[]` you can pass to your Builder.io Gen2 SDK registration list (`@builder.io/sdk-react`). Declares the `link`, `label`, `openInNewTab`, `title`, and `ariaLabel` inputs, plus theme inputs. |
| `theme.ts`, `ThemeContext.tsx`, `useTheme.ts`, `ThemeProvider.tsx` | A minimal theme system (`light`/`dark`/`accent`/`warm`/`gradient`/`transparent-light`/`transparent-dark`) used only when `inheritTheme={false}` is passed explicitly. Delete these and simplify `index.tsx` if you don't need themed variants — `DynamicLink` otherwise renders a plain `<Link>` with no theme wrapper. |
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

Model names are converted to camelCase for the GraphQL query (Builder.io's GraphQL schema camelCases dash-separated model names, e.g. `blog-article` → `blogArticle`) — you don't need to do this yourself in `MODEL_CONFIG`, just use the model's actual name.

If the first lookup by `id` returns nothing, the route retries once with the id prefixed by your API key (`{apiKey}_{id}`) — this handles content synced in from another Builder.io space, which Builder stores under a prefixed id.

**Required environment variable:** `NEXT_PUBLIC_BUILDER_API_KEY` — the same public API key your Builder.io SDK client already uses. The route queries `https://cdn.builder.io/api/v3/graphql/{apiKey}` directly, so no additional server-side secret is needed.

## Theming

`DynamicLink` only applies a theme when you explicitly pass `inheritTheme={false}` — by default (`inheritTheme={true}`, the default prop value) it renders a bare `<Link>` and inherits whatever styling the surrounding page/section already provides.

```tsx
<DynamicLink link={value} label="Learn more" inheritTheme={false} theme="dark" />
```

To register the theme fields on your own components (not just `DynamicLink`), spread `themeableInputs` from `theme.ts` into that component's Builder.io registration `inputs` array, matching the pattern used in `DynamicLink.builder.registration.tsx`.

## Peer requirements

The copied component/route source expects these to already be installed in your project (not bundled, not auto-installed):

- `react`, `react-dom`
- `next` (App Router)
- `@builder.io/sdk-react` (for the `RegisteredComponent` type used by the registration file — only needed if you use the Gen2 registration export)

## Troubleshooting

- **`npx @jhsdc/create-dynamic-link` 404s right after a new version is published.** npm's registry has a known indexing lag for brand-new package versions — the tarball is live immediately but the aggregate package listing `npx` depends on can take a few minutes to propagate. Wait a bit and retry.
- **Route returns 404 for a valid entry.** Check that the model name in your `MODEL_CONFIG` (or the model's actual name, for the `url`-field fallback) matches what Builder.io's GraphQL API expects, and that `NEXT_PUBLIC_BUILDER_API_KEY` has read access to the space the entry lives in.
- **Files were skipped on a rerun.** That's expected — existing files aren't touched unless you pass `--force`. Diff before forcing if you've since customized the generated files.
