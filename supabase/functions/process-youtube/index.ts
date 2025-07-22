import { corsHeaders } from "@shared/cors.ts";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { url, outputFormat, includeTimestamps, speakerLabels, language } = await req.json();
    // 1. YouTube videosundan mp3 linkini al
    const ytApiRes = await fetch(`https://yt-api.org/audio?url=${encodeURIComponent(url)}`);
    if (!ytApiRes.ok) {
      const err = await ytApiRes.text();
      return new Response(JSON.stringify({
        error: "YouTube audio API error",
        details: err
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }
    const ytApiJson = await ytApiRes.json();
    const mp3Url = ytApiJson.url;
    if (!mp3Url) {
      return new Response(JSON.stringify({
        error: "No mp3 url found from YouTube audio API"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }
    // 2. mp3 dosyasını indir
    const audioRes = await fetch(mp3Url);
    if (!audioRes.ok) {
      const err = await audioRes.text();
      return new Response(JSON.stringify({
        error: "Failed to download mp3",
        details: err
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }
    const audioBuffer = new Uint8Array(await audioRes.arrayBuffer());
    const audioBlob = new Blob([
      audioBuffer
    ], {
      type: "audio/mpeg"
    });
    // 3. Whisper API'ye gönder
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.mp3");
    formData.append("model", "whisper-1");
    if (language) {
      formData.append("language", language);
    }
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
    let transcriptText = result.text;
    let finalOutput = transcriptText;
    if ((outputFormat === "summary" || outputFormat === "notes") && transcriptText) {
      // GPT-3.5 ile özet/not çıkar
      const prompt = outputFormat === "summary"
        ? `Aşağıdaki transcripti özetle:\n\n${transcriptText}`
        : `Aşağıdaki transcriptten önemli ders notları çıkar:\n\n${transcriptText}`;
      const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Sen bir asistan olarak transkriptleri özetler ve notlar çıkarırsın." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1024,
          temperature: 0.4
        })
      });
      if (gptRes.ok) {
        const gptJson = await gptRes.json();
        finalOutput = gptJson.choices?.[0]?.message?.content || transcriptText;
      }
    }
    // 4. Output formatlama
    const formattedTranscript = generateMockTranscript(outputFormat, includeTimestamps, speakerLabels, url, finalOutput);
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
      return transcriptText ? `Summary for ${fileName}:\n${transcriptText}` : "Key Points:\n• Introduction and welcome\n• Main topic discussion begins\n• Important insights shared\n• Action items mentioned";
    case "notes":
      return transcriptText ? `Notes for ${fileName}:\n${transcriptText}` : "Topic: Introduction\nDuration: 2:15\nNotes: Clean, formatted text with proper punctuation and structure. The discussion covers the main points in a well-organized manner.";
    default:
      return transcriptText ? `Transcript from ${fileName}:\n${transcriptText}` : "Transcript content would appear here based on the selected format.";
  }
}
