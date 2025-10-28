export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOMNIA_GRAPHQL =
  "https://api.subgraph.somnia.network/api/public/962dcbf6-75ff-4e54-b778-6b5816c05e7d/subgraphs/somnia-perp/v1.0.0/gn";

const QUERY = `
  query GetPerpPool {
    perpPool {
      totalTrade
    }
  }
`;

export async function GET() {
  try {
    const upstream = await fetch(SOMNIA_GRAPHQL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: QUERY }),
      cache: "no-store"
    });

    if (!upstream.ok) {
      return new Response("upstream_error", { status: 502 });
    }

    const json = await upstream.json();
    const value = json?.data?.perpPool?.totalTrade;
    if (!value) {
      return new Response("missing_value", { status: 502 });
    }

    // Only the number, as plain text
    return new Response(String(value), {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "access-control-allow-origin": "*",
        "cache-control": "no-store"
      }
    });
  } catch {
    return new Response("proxy_error", { status: 502 });
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
