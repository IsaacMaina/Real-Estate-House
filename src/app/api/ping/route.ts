// src/app/api/ping/route.ts
export async function HEAD() {
  return new Response(null, { status: 200 });
}

export async function GET() {
  return new Response('OK', { status: 200 });
}