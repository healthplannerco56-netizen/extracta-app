import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
  const response = await fetch(`${backendUrl}/api/jobs/${params.jobId}`);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
