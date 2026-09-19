export const runtime = "nodejs";

export const GET = (): Response =>
  Response.json(
    { ok: true, service: "hack-the-andes-web" },
    { headers: { "cache-control": "no-store" } },
  );
