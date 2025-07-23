import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const outputFormat = formData.get("outputFormat");
  const includeTimestamps = formData.get("includeTimestamps");
  const speakerLabels = formData.get("speakerLabels");

  // Dosyayı arrayBuffer olarak oku
  const fileBuffer = file && typeof file !== "string" ? await file.arrayBuffer() : null;

  const supabaseRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-audio`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        file: fileBuffer ? Array.from(new Uint8Array(fileBuffer)) : undefined,
        fileName: file && typeof file !== "string" ? file.name : undefined,
        outputFormat,
        includeTimestamps,
        speakerLabels,
      }),
    }
  );
  const data = await supabaseRes.json();
  return NextResponse.json(data, { status: supabaseRes.status });
} 