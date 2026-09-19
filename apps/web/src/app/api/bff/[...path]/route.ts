import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { getServerApiUrl } from '@/lib/server-api-url';
import { SESSION_COOKIE } from '@/lib/session-cookie';

async function proxy(request: NextRequest, pathSegments: string[]) {
  const upstreamPath = pathSegments.join('/');
  const url = new URL(`${getServerApiUrl()}/${upstreamPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const token = cookies().get(SESSION_COOKIE)?.value;
  const headers = new Headers();
  headers.set('Accept', 'application/json');
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const upstream = await fetch(url.toString(), init);
  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}

type RouteContext = { params: { path: string[] } };

export async function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}
