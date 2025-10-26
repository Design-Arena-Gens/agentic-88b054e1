import { NextResponse } from 'next/server';
import { sendBirthdayEmailsForDate } from '@/lib/sendService';

export const POST = async () => {
  try {
    const result = await sendBirthdayEmailsForDate(new Date());
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Email send failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
};
