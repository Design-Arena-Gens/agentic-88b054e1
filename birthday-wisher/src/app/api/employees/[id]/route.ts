import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteEmployee, getEmployeeById, updateEmployee } from '@/lib/employeeService';

const paramsSchema = z.object({
  id: z
    .string()
    .transform(Number)
    .refine((value) => Number.isInteger(value) && value > 0, 'Invalid id'),
});

const employeeSchema = z.object({
  name: z.string().min(1),
  designation: z.string().min(1),
  team: z.string().min(1),
  email: z.string().email(),
  dob: z.string().min(1),
  message: z.string().optional(),
  templateId: z
    .union([z.string().transform(Number), z.number()])
    .pipe(z.number().positive())
    .optional(),
  removePhoto: z.string().optional(),
});

const bufferFromFile = async (file?: File | null) => {
  if (!file) return undefined;
  const arrayBuffer = await file.arrayBuffer();
  return {
    base64: Buffer.from(arrayBuffer).toString('base64'),
    contentType: file.type || 'application/octet-stream',
  };
};

export const GET = async (_request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = paramsSchema.parse(await context.params);
  const employee = getEmployeeById(id);
  if (!employee) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ data: employee });
};

export const PUT = async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = paramsSchema.parse(await context.params);
  const formData = await request.formData();
  const removePhotoValue = formData.get('removePhoto');

  const parsed = employeeSchema.safeParse({
    name: formData.get('name'),
    designation: formData.get('designation'),
    team: formData.get('team'),
    email: formData.get('email'),
    dob: formData.get('dob'),
    message: formData.get('message') ?? '',
    templateId: formData.get('templateId') ? Number(formData.get('templateId')) : undefined,
    removePhoto: typeof removePhotoValue === 'string' ? removePhotoValue : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = getEmployeeById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const uploadedPhoto = await bufferFromFile(formData.get('photo') as File | null);
  let photo = uploadedPhoto
    ? { base64: uploadedPhoto.base64, contentType: uploadedPhoto.contentType }
    : null;

  if (!uploadedPhoto && parsed.data.removePhoto === 'true') {
    photo = null;
  } else if (!uploadedPhoto && parsed.data.removePhoto !== 'true') {
    photo =
      existing.photoBase64 && existing.photoContentType
        ? { base64: existing.photoBase64, contentType: existing.photoContentType }
        : null;
  }

  const updated = updateEmployee(id, {
    ...parsed.data,
    templateId: parsed.data.templateId ?? null,
    photo,
  });

  return NextResponse.json({ data: updated });
};

export const DELETE = async (
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = paramsSchema.parse(await context.params);
  deleteEmployee(id);
  return NextResponse.json({ success: true });
};
