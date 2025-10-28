export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOMNIA_GRAPHQL =
  "https://api.subgraph.somnia.network/api/public/962dcbf6-75ff-4e54-b778-6b5816c05e7d/subgraphs/somnia-perp/v1.0.0/gn";

// Query the collection and take the newest record by timestamp
const QUERY = /* GraphQL */ `
  query LatestPerpPool {
    perpPools(first: 1, orderBy: latestUpdateTimestamp, orderDirection: desc) {
      id
      totalTrade
      latestUpdateTimestamp
    }
  }
`;

export async function GET() {
  try {
    const res = await fetch(SOMNIA_GRAPHQL, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        query: QUERY,
        operationName: "LatestPerpPool",
        variables: {}
      }),
      cache: "no-store"
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(`upstream_http_${res.status}: ${text.slice(0, 300)}`, {
        status: 502,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "access-control-allow-origin": "*"
        }
      });
    }

    const json = await res.json();

    if (json?.errors?.length) {
      return new Response(
        `upstream_graphql_error: ${JSON.stringify(json.errors).slice(0, 300)}`,
        {
          status: 502,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "access-control-allow-origin": "*"
          }
        }
      );
    }

    const value: string | undefined = json?.data?.perpPools?.[0]?.totalTrade;

    if (!value) {
      return new Response(
        `upstream_missing_value: ${JSON.stringify(json).slice(0, 300)}`,
        {
          status: 502,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "access-control-allow-origin": "*"
          }
        }
      );
    }

    // Emit only the number, no whitespace
    const out = String(value).trim().replace(/\s+/g, "");

    return new Response(out, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "access-control-allow-origin": "*",
        "cache-control": "no-store"
      }
    });
  } catch (err: any) {
    return new Response(err?.message || "proxy_error", {
      status: 502,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "access-control-allow-origin": "*"
      }
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
