import { NextResponse, type NextRequest } from 'next/server';
import { invalidRequestBody } from '@/lib/api/errors';
import { applyCorsHeaders } from '@/lib/api/cors';
import { buildResourceBody } from '@/lib/api/responses';
import { CACHE } from '@/lib/api/cache';
import { buildErrorResponse, optionsRoute } from '@/lib/api/handler';
import { newRequestId } from '@/lib/api/request-id';
import { uploadImage } from '@/lib/firebase/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PURPOSES = new Set([
  'logo',
  'alt_logo',
  'flag',
  'league_logo',
  'team_logo',
  'asset',
]);

async function handleUpload(request: NextRequest): Promise<NextResponse> {
  const requestId = newRequestId();
  const origin = request.headers.get('origin');

  try {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw invalidRequestBody('Request body must be multipart form data with a "file" field.');
    }

    const file = form.get('file');
    if (!(file instanceof File)) {
      throw invalidRequestBody('Missing "file" in multipart form data.');
    }

    const purposeRaw = (form.get('purpose') ?? 'asset').toString().trim() || 'asset';
    const purpose = ALLOWED_PURPOSES.has(purposeRaw) ? purposeRaw : 'asset';
    const entityId = (form.get('entityId') ?? '').toString().trim() || null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage({
      buffer,
      contentType: file.type || 'application/octet-stream',
      purpose,
      entityId,
    });

    const body = buildResourceBody({ url }, new Date().toISOString());
    const headers = new Headers();
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('X-Request-Id', requestId);
    applyCorsHeaders(headers, origin);
    headers.set('Cache-Control', CACHE.none);
    return new NextResponse(JSON.stringify(body), { status: 201, headers });
  } catch (err) {
    return buildErrorResponse(err, requestId, origin);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleUpload(request);
}

export const OPTIONS = optionsRoute();
