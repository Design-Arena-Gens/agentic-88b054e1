import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createEmployee, getEmployees } from '@/lib/employeeService';

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
  const employees = getEmployees();
  return NextResponse.json({ data: employees });
};

export const POST = async (request: Request) => {
  const formData = await request.formData();

  const parsed = employeeSchema.safeParse({
    name: formData.get('name'),
    designation: formData.get('designation'),
    team: formData.get('team'),
    email: formData.get('email'),
    dob: formData.get('dob'),
    message: formData.get('message') ?? '',
    templateId: formData.get('templateId') ? Number(formData.get('templateId')) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const photo = await bufferFromFile(formData.get('photo') as File | null);

  const employee = createEmployee({
    ...parsed.data,
    templateId: parsed.data.templateId ?? null,
    photo: photo
      ? {
          base64: photo.base64,
          contentType: photo.contentType,
        }
      : null,
  });

  return NextResponse.json({ data: employee }, { status: 201 });
};
