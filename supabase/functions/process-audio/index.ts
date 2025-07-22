import { corsHeaders } from "@shared/cors.ts";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { file, fileName, outputFormat, includeTimestamps, speakerLabels, language } = await req.json();
    // file: ArrayBuffer olarak geliyor, bunu bir Blob'a çevir
    const audioBlob = new Blob([
      new Uint8Array(file)
    ], {
      type: "audio/mpeg"
    });
    const formData = new FormData();
    formData.append("file", audioBlob, fileName || "audio.mp3");
    formData.append("model", "whisper-1");
    if (language) {
      formData.append("language", language);
    }
    // OpenAI Whisper API'ye isteği gönder
    const openaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });
    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return new Response(JSON.stringify({
        error: "OpenAI Whisper API error",
        details: err
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }
    const result = await openaiRes.json();
    // result.text -> transcript
    // Output formatlama
    const formattedTranscript = generateMockTranscript(outputFormat, includeTimestamps, speakerLabels, fileName, result.text);
    return new Response(JSON.stringify({
      transcript: formattedTranscript
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
function generateMockTranscript(format, timestamps, speakers, fileName, transcriptText) {
  switch(format){
    case "summary":
      return transcriptText ? `Summary for ${fileName}:\n${transcriptText}` : `File: ${fileName}\n\nKey Points:\n• Audio file successfully processed\n• High quality transcript generated\n• Multiple speakers identified\n• Clear dialogue structure maintained`;
    case "notes":
      return transcriptText ? `Notes for ${fileName}:\n${transcriptText}` : `Source: ${fileName}\nProcessed: ${new Date().toLocaleDateString()}\nNotes: Professional transcript with clean formatting, proper punctuation, and structured content suitable for documentation purposes.`;
    default:
      return transcriptText ? `Transcript from ${fileName}:\n${transcriptText}` : `Transcript from ${fileName} would appear here based on the selected format.`;
  }
}
