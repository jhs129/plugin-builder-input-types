import { NextResponse } from "next/server";

// Resolves a Builder.io "model" link (produced by the CMSLink input / DynamicLink
// component's resolveHref) into a real URL and redirects to it. DynamicLink points
// at this route as `/dynamiclink/${model}/builder/${referenceId}` whenever a content
// editor links to a piece of content instead of typing a raw URL — that way the link
// keeps working even if the target's slug/handle changes later, since this route
// looks up the current value at request time instead of baking it in at build time.

interface RouteParams {
  model: string;
  type: string;
  id: string;
}

interface ModelConfig {
  field: string;
  toPath: (value: string) => string;
}

// Models that resolve via a named slug/handle field rather than a `url` field.
// Add an entry here for every model that DynamicLink should be able to point at
// that doesn't already have a `url` field returned by the Content API. Models not
// listed here fall back to reading a `url` field directly off the entry's data.
const MODEL_CONFIG: Record<string, ModelConfig> = {
  article: { field: "slug", toPath: (slug) => `/blogs/${slug}` },
  event: { field: "handle", toPath: (handle) => `/events/${handle}` },
};

// Builder.io model names are typically camelCase in the GraphQL schema even when
// the model itself is named with dashes (e.g. `blog-article` -> `blogArticle`).
function toGraphQLModelName(model: string): string {
  return model.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

async function fetchContent(
  endpoint: string,
  graphQLQuery: string,
  model: string,
  field: string
): Promise<string | null> {
  const response = await fetch(`${endpoint}?query=${encodeURIComponent(graphQLQuery)}`, {
    headers: { "Content-Type": "application/json" },
  });
  const { data } = await response.json();
  const record = data?.[model]?.[0]?.data;
  if (!record) return null;
  return record[field] ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { model, type, id } = await params;

  if (!model || !type || !id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Set this in your Next.js environment (e.g. .env.local) — it's the same
  // public API key your Builder.io SDK client is already initialized with.
  const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const endpoint = `https://cdn.builder.io/api/v3/graphql/${apiKey}`;
    const graphQLModel = toGraphQLModelName(model);
    const config = MODEL_CONFIG[model];
    const dataField = config?.field ?? "url";

    let graphQLQuery = `query { ${graphQLModel}(query: { id: "${id}" }) { data { ${dataField} } } }`;
    let fieldValue = await fetchContent(endpoint, graphQLQuery, graphQLModel, dataField);

    // Content synced from another space is stored with the key prefixed by the
    // reading space's API key — retry with that shape if the plain id misses.
    if (!fieldValue) {
      const prefixedId = `${apiKey}_${id}`;
      graphQLQuery = `query { ${graphQLModel}(query: { id: "${prefixedId}" }) { data { ${dataField} } } }`;
      fieldValue = await fetchContent(endpoint, graphQLQuery, graphQLModel, dataField);
    }

    if (fieldValue) {
      const destination = config ? config.toPath(fieldValue) : fieldValue;
      return NextResponse.redirect(new URL(destination, _request.url), 307);
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("DynamicLink redirect error:", error);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
