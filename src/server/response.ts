import { NextResponse } from 'next/server';

export function jsonResponse<T>(data: T, message = 'Success', statusCode = 200) {
  return NextResponse.json(
    {
      statusCode,
      message,
      data,
      success: statusCode >= 200 && statusCode < 300,
    },
    { status: statusCode }
  );
}

export function errorResponse(message: string, statusCode = 400) {
  return NextResponse.json(
    {
      statusCode,
      message,
      data: null,
      success: false,
    },
    { status: statusCode }
  );
}
