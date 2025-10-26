import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createTemplate, getTemplates } from '@/lib/templateService';

const templateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  message: z.string().optional(),
});

const bufferFromFile = async (file?: File | null) => {
  if (!file) return undefined;
  const arrayBuffer = await file.arrayBuffer();
  return {
    base64: Buffer.from(arrayBuffer).toString('base64'),
    contentType: file.type || 'application/octet-stream',
  };
};

export const GET = async () => {
  const templates = getTemplates();
  return NextResponse.json({ data: templates });
};

export const POST = async (request: Request) => {
  const formData = await request.formData();

  const parsed = templateSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    message: formData.get('message') ?? '',
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const file = await bufferFromFile(formData.get('file') as File | null);

  if (!file) {
    return NextResponse.json({ error: 'Missing file upload' }, { status: 400 });
  }

  const template = createTemplate({
    ...parsed.data,
    file,
  });

  return NextResponse.json({ data: template }, { status: 201 });
};
