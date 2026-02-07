import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { VeoService } from "@/lib/veo-service";

// Admin client for storage uploads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VIDEO_BUCKET_NAME = "hero-videos";

/**
 * Generate video using Google Veo 3.1
 */
async function generateWithVeo(prompt: string): Promise<{ videoUrl: string; isBase64: boolean } | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎬 [VIDEO GENERATION] Agent: GOOGLE_VEO_3.1`);
  console.log(`${'='.repeat(60)}`);

  if (!apiKey) {
    console.log("❌ [VIDEO] Agent: GOOGLE_VEO_3.1 - API key not configured");
    return null;
  }

  try {
    console.log("🎬 [VIDEO] Agent: GOOGLE_VEO_3.1 - STARTING generation...");
    console.log("🎬 [VIDEO] Prompt:", prompt.substring(0, 200));

    const veo = new VeoService(apiKey);
    const result = await veo.generateVideo({
      prompt,
      duration: 8,
      aspectRatio: '16:9',
      resolution: '1080p'
    });

    if (result.success && result.videoUrl) {
      console.log("✅ [VIDEO] Agent: GOOGLE_VEO_3.1 - SUCCESS!");
      console.log(`✅ [VIDEO] Generation time: ${result.generationTime?.toFixed(1)}s`);
      console.log(`✅ [VIDEO] Estimated cost: $${result.estimatedCost?.toFixed(2)}`);

      return {
        videoUrl: result.videoUrl,
        isBase64: result.videoUrl.startsWith('data:')
      };
    }

    console.log("❌ [VIDEO] Agent: GOOGLE_VEO_3.1 - FAILED:", result.error);
    return null;

  } catch (error: any) {
    console.error("❌ [VIDEO] Agent: GOOGLE_VEO_3.1 - ERROR:", error.message);
    return null;
  }
}

/**
 * Use GPT to create an optimized video prompt from article content
 * Creates concise, visual prompts that avoid any text/titles in the video
 */
async function optimizePromptWithGPT(title: string, content: string): Promise<string> {
  try {
    console.log("🤖 [VIDEO] Using GPT to optimize video prompt...");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a video prompt expert for Google Veo AI. Create ultra-concise visual prompts (max 400 chars) for 8-second looping corporate videos.

STRICT RULES:
- NO text, titles, captions, or words visible in the video
- NO logos, watermarks, or overlays
- Focus ONLY on visual scenes: people, environments, actions, lighting
- Describe camera movements (pan, zoom, dolly)
- Ensure seamless loop (end matches beginning)
- Philippine BPO/call center setting with Filipino professionals`
          },
          {
            role: 'user',
            content: `Create a video prompt for article: "${title}"

Summary: ${content.substring(0, 800)}

Output a single paragraph describing 3 visual scenes (no text in video). Keep under 400 characters total.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      let optimizedPrompt = data.choices[0].message.content.trim();

      // Append strict no-text instruction
      optimizedPrompt += " IMPORTANT: No text, titles, captions, or words visible in video. Pure visual footage only.";

      console.log("✅ [VIDEO] GPT-optimized prompt created:", optimizedPrompt.substring(0, 100) + "...");
      return optimizedPrompt;
    } else {
      console.log("⚠️ [VIDEO] GPT API failed, using fallback prompt");
      return buildFallbackPrompt(title);
    }
  } catch (error: any) {
    console.log("⚠️ [VIDEO] GPT error:", error.message);
    return buildFallbackPrompt(title);
  }
}

/**
 * Build fallback prompt when GPT is unavailable
 * Uses content-specific visual direction based on article title
 */
function buildFallbackPrompt(title: string): string {
  const titleLower = (title || '').toLowerCase();
  let topicScene = 'Filipino professionals at workstations';
  
  if (titleLower.includes('salary') || titleLower.includes('compensation') || titleLower.includes('pay')) {
    topicScene = 'Filipino professionals discussing compensation, reviewing salary documents at modern desk';
  } else if (titleLower.includes('interview') || titleLower.includes('hired')) {
    topicScene = 'Professional job interview scene, confident Filipino candidate in corporate meeting room';
  } else if (titleLower.includes('career') || titleLower.includes('promot')) {
    topicScene = 'Filipino team leader mentoring team, career advancement and leadership moment';
  } else if (titleLower.includes('benefit') || titleLower.includes('rights')) {
    topicScene = 'HR professional presenting benefits overview to engaged employees';
  } else if (titleLower.includes('company') || titleLower.includes('review')) {
    topicScene = 'Modern corporate office tour, team collaboration and vibrant workplace culture';
  }
  
  return `Cinematic 8-second loop: Modern Philippine BPO office. Scene 1 (0-3s): Wide establishing shot, glass walls, natural light. Scene 2 (3-6s): ${topicScene}, warm lighting. Scene 3 (6-8s): Pull back to wide shot matching scene 1 for seamless loop. Professional corporate atmosphere. No text, titles, or captions visible.`;
}

export async function POST(req: NextRequest) {
  console.log("🎬 [VIDEO] ========== VIDEO GENERATION REQUEST ==========");

  try {
    const body = await req.json();
    const { prompt, title, slug, brief, content } = body;

    console.log("🎬 [VIDEO] Generating for:", title || prompt);

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("❌ [VIDEO] Google API key not configured");
      return NextResponse.json({
        success: false,
        error: "Google API key not configured",
        suggestion: "Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.",
      }, { status: 503 });
    }

    const timestamp = Date.now();
    const safeSlug = (slug || title || "video")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    // Build enhanced prompt
    let enhancedPrompt = '';

    if (title && content) {
      enhancedPrompt = await optimizePromptWithGPT(title, content);
    } else if (brief) {
      enhancedPrompt = `Professional BPO career video: ${brief}. Three scenes with smooth transitions: 1) Modern Philippine call center overview 2) Close-up of Filipino professionals at work 3) Inspiring wide shot that loops back to start. Cinematic quality, professional lighting, seamless loop, no text.`;
    } else {
      enhancedPrompt = `${prompt || title}. Professional Philippine BPO call center environment. Three cinematic scenes with smooth transitions showing modern office, professionals at work, and inspiring overview. Seamless loop. High quality corporate video.`;
    }

    // Ensure under 1000 characters (API limit)
    if (enhancedPrompt.length > 1000) {
      console.log(`⚠️ [VIDEO] Prompt too long (${enhancedPrompt.length} chars), truncating`);
      enhancedPrompt = enhancedPrompt.substring(0, 997) + '...';
    }

    console.log(`🎬 [VIDEO] Prompt length: ${enhancedPrompt.length} characters`);

    // Generate with Google Veo 3.1
    const veoResult = await generateWithVeo(enhancedPrompt);

    if (veoResult && veoResult.videoUrl) {
      // Upload to Supabase
      if (veoResult.isBase64) {
        console.log("🎬 [VIDEO] Uploading base64 video to Supabase...");

        try {
          const base64Data = veoResult.videoUrl.split(',')[1];
          const videoBuffer = Buffer.from(base64Data, 'base64');
          const fileName = `ai-generated/${safeSlug}-${timestamp}.mp4`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from(VIDEO_BUCKET_NAME)
            .upload(fileName, videoBuffer, {
              contentType: "video/mp4",
              cacheControl: "31536000",
              upsert: true,
            });

          if (!uploadError) {
            const { data: urlData } = supabaseAdmin.storage
              .from(VIDEO_BUCKET_NAME)
              .getPublicUrl(fileName);

            console.log("✅ [VIDEO] Uploaded to Supabase:", urlData.publicUrl);

            return NextResponse.json({
              success: true,
              videoUrl: urlData.publicUrl,
              permanent: true,
              generatedWith: "google-veo-3.1",
              message: "Video generated and saved successfully!",
              prompt: enhancedPrompt,
              metadata: { altText: `${title} - Hero video`, title, description: `AI-generated hero video for: ${title}` },
            });
          } else {
            console.error("❌ [VIDEO] Supabase upload error:", uploadError);
            return NextResponse.json({
              success: true,
              videoUrl: veoResult.videoUrl,
              permanent: false,
              generatedWith: "google-veo-3.1",
              message: "Video generated but upload failed",
              prompt: enhancedPrompt,
            });
          }
        } catch (uploadError: any) {
          console.error("❌ [VIDEO] Upload error:", uploadError);
          return NextResponse.json({
            success: true,
            videoUrl: veoResult.videoUrl,
            permanent: false,
            generatedWith: "google-veo-3.1",
            message: "Video generated but storage failed",
            prompt: enhancedPrompt,
          });
        }
      } else {
        // Download from URL and upload to Supabase
        console.log("🎬 [VIDEO] Downloading video from URL...");

        try {
          const videoResponse = await fetch(veoResult.videoUrl);

          if (!videoResponse.ok) {
            return NextResponse.json({
              success: true,
              videoUrl: veoResult.videoUrl,
              permanent: false,
              generatedWith: "google-veo-3.1",
              message: "Video generated but download failed",
              prompt: enhancedPrompt,
            });
          }

          const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
          const fileName = `ai-generated/${safeSlug}-${timestamp}.mp4`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from(VIDEO_BUCKET_NAME)
            .upload(fileName, videoBuffer, {
              contentType: "video/mp4",
              cacheControl: "31536000",
              upsert: true,
            });

          if (!uploadError) {
            const { data: urlData } = supabaseAdmin.storage
              .from(VIDEO_BUCKET_NAME)
              .getPublicUrl(fileName);

            console.log("✅ [VIDEO] Uploaded to Supabase:", urlData.publicUrl);

            return NextResponse.json({
              success: true,
              videoUrl: urlData.publicUrl,
              permanent: true,
              generatedWith: "google-veo-3.1",
              message: "Video generated and saved successfully!",
              prompt: enhancedPrompt,
              metadata: { altText: `${title} - Hero video`, title, description: `AI-generated hero video for: ${title}` },
            });
          } else {
            console.error("❌ [VIDEO] Supabase upload error:", uploadError);
            return NextResponse.json({
              success: true,
              videoUrl: veoResult.videoUrl,
              permanent: false,
              generatedWith: "google-veo-3.1",
              message: "Video generated but upload failed",
              prompt: enhancedPrompt,
            });
          }
        } catch (downloadError: any) {
          console.error("❌ [VIDEO] Download/upload error:", downloadError);
          return NextResponse.json({
            success: true,
            videoUrl: veoResult.videoUrl,
            permanent: false,
            generatedWith: "google-veo-3.1",
            message: "Video generated but storage failed",
            prompt: enhancedPrompt,
          });
        }
      }
    }

    // Generation failed
    console.log(`\n${'='.repeat(60)}`);
    console.log("❌ [VIDEO GENERATION] GOOGLE_VEO_3.1 FAILED");
    console.log("   Please upload a video manually.");
    console.log(`${'='.repeat(60)}\n`);

    return NextResponse.json({
      success: false,
      error: "Video generation failed",
      message: "Google Veo 3.1 video generation failed. Please upload a video manually.",
      suggestion: "Use the upload button to add your own video file, or try generating again later.",
    }, { status: 500 });

  } catch (error: any) {
    console.error("❌ [VIDEO] Error:", error.message);

    return NextResponse.json({
      success: false,
      error: error.message || "Generation failed",
      suggestion: "Please upload a video manually.",
    }, { status: 500 });
  }
}
