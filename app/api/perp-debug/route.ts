export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOMNIA_GRAPHQL =
  "https://api.subgraph.somnia.network/api/public/962dcbf6-75ff-4e54-b778-6b5816c05e7d/subgraphs/somnia-perp/v1.0.0/gn";

const QUERY = `
  query GetPerpPool {
    perpPool {
      totalTrade
      latestUpdateTimestamp
      before24 { totalTrade totalFees }
    }
  }
`;

export async function GET() {
  const res = await fetch(SOMNIA_GRAPHQL, {
    method: "POST",
    headers: { "content-type": "application/json", "accept": "application/json" },
    body: JSON.stringify({ query: QUERY, operationName: "GetPerpPool", variables: {} }),
    cache: "no-store"
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" }
  });
}
