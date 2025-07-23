import { NextRequest, NextResponse } from "next/server";
import ytdl from "ytdl-core";

export async function POST(req: NextRequest) {
  try {
    const { url, outputFormat, includeTimestamps, speakerLabels } = await req.json();
    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // YouTube'dan sadece ses streamini al
    const audioStream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });

    // Stream'i buffer'a çevir
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk as Buffer);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Supabase function'a gönder
    const whisperRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        file: Array.from(new Uint8Array(audioBuffer)),
        fileName: "audio.mp3",
        outputFormat,
        includeTimestamps,
        speakerLabels,
      }),
    });

    const data = await whisperRes.json();
    return NextResponse.json(data, { status: whisperRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}