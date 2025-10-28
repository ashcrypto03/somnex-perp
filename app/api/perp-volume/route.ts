export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOMNIA_GRAPHQL =
  "https://api.subgraph.somnia.network/api/public/962dcbf6-75ff-4e54-b778-6b5816c05e7d/subgraphs/somnia-perp/v1.0.0/gn";

const QUERY = /* GraphQL */ `
  query GetPerpPool {
    perpPool {
      totalTrade
      latestUpdateTimestamp
    }
  }
`;

async function getTotalTrade(): Promise<string> {
  const res = await fetch(SOMNIA_GRAPHQL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify({
      query: QUERY,
      operationName: "GetPerpPool",
      variables: {}
    }),
    cache: "no-store"
  });

  // If the upstream returns non-200, bubble up the plain text body for quick debugging
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`upstream_http_${res.status}: ${text.slice(0, 300)}`);
  }

  const json = await res.json();

  // GraphQL errors array
  if (json?.errors?.length) {
    throw new Error(`upstream_graphql_error: ${JSON.stringify(json.errors).slice(0, 300)}`);
  }

  const value = json?.data?.perpPool?.totalTrade;
  if (!value) {
    throw new Error(`upstream_missing_value: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return String(value);
}

export async function GET() {
  try {
    const value = await getTotalTrade();
    return new Response(value, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "access-control-allow-origin": "*",
        "cache-control": "no-store"
      }
    });
  } catch (err: any) {
    // Return the error text so you can see *why* it failed
    return new Response(err?.message || "proxy_error", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": "*" }
    });
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}
