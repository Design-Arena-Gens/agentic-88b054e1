import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteTemplate, getTemplateById } from '@/lib/templateService';

const paramsSchema = z.object({
  id: z
    .string()
    .transform(Number)
    .refine((value) => Number.isInteger(value) && value > 0, 'Invalid id'),
});

export const DELETE = async (
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = paramsSchema.parse(await context.params);
  const existing = getTemplateById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  deleteTemplate(id);
  return NextResponse.json({ success: true });
};
