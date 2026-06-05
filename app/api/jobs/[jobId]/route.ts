import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
  const response = await fetch(`${backendUrl}/api/jobs/${jobId}`);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
