import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ImagenService } from "@/lib/imagen-service";

// Admin client for storage uploads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET_NAME = "insights-images";

// Negative prompt to avoid unwanted styles
const NEGATIVE_STYLE = "ABSOLUTELY NO: clipart, vector art, cartoon, illustration, anime, 3D render, CGI, artificial looking, stock illustration, flat design, icons, digital art, painting, drawing, sketch, watercolor, oil painting, graphic design, infographic, diagram, AI artifacts, plastic skin, uncanny valley, distorted faces, extra limbs, blurry, low resolution, watermark, text overlay, logo, any text or words or letters or numbers in the image";

/**
 * Use GPT to create an optimized image prompt from section content
 */
async function optimizeImagePromptWithGPT(sectionContent: string, title: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    const firstLine = sectionContent.split('\n')[0].replace(/^#+\s*/, '').trim();
    return `${firstLine} - Professional BPO office scene`;
  }

  try {
    console.log("🤖 [IMAGE] Using GPT to optimize image prompt...");

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
            content: 'You are an expert at creating concise, visual image prompts for professional BPO/call center photography. Create hyper-realistic photography prompts (max 500 chars) that describe a specific scene showing Filipino professionals in authentic Philippine BPO office environments.'
          },
          {
            role: 'user',
            content: `Create a photography prompt for this article section about "${title}":\n\n${sectionContent.substring(0, 1500)}\n\nFormat: Describe ONE specific scene with Filipino BPO professionals. Include camera details, lighting, and composition. Keep under 500 characters.`
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const optimizedPrompt = data.choices[0].message.content.trim();
      console.log("✅ [IMAGE] GPT-optimized prompt created");
      return optimizedPrompt;
    } else {
      const firstLine = sectionContent.split('\n')[0].replace(/^#+\s*/, '').trim();
      return `${firstLine} - Professional BPO office scene with Filipino professionals`;
    }
  } catch (error: any) {
    console.log("⚠️ [IMAGE] GPT error:", error.message);
    const firstLine = sectionContent.split('\n')[0].replace(/^#+\s*/, '').trim();
    return `${firstLine} - Professional BPO office scene with Filipino professionals`;
  }
}

/**
 * Upload image buffer to Supabase Storage
 */
async function uploadToSupabase(
  imageBuffer: Uint8Array,
  contentType: string,
  slug: string,
  title: string,
  isSection: boolean = false
): Promise<string | null> {
  const timestamp = Date.now();
  const safeSlug = (slug || title || "image")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);

  const ext = contentType.includes('png') ? 'png' : 'webp';
  const folder = isSection ? 'section' : 'heroes';
  const fileName = `${folder}/${safeSlug}-${timestamp}.${ext}`;

  console.log("📤 [IMAGE] Uploading to Supabase:", fileName);

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(fileName, imageBuffer, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    });

  if (uploadError) {
    console.error("❌ [IMAGE] Supabase upload error:", uploadError);
    return null;
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  console.log("✅ [IMAGE] Uploaded to Supabase:", urlData.publicUrl);
  return urlData.publicUrl;
}

export async function POST(req: NextRequest) {
  console.log("🎨 [IMAGE] ========== IMAGE GENERATION REQUEST ==========");

  try {
    const { prompt, title, style, slug, brief, content, sectionContent } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("❌ [IMAGE] Google API key not configured");
      return NextResponse.json({
        success: false,
        error: "Google API key not configured",
        suggestion: "Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.",
      }, { status: 503 });
    }

    console.log("🎨 [IMAGE] Generating for:", title || prompt);

    // Build prompt
    let basePrompt = prompt || `Article hero image for: ${title}`;

    if (sectionContent) {
      basePrompt = await optimizeImagePromptWithGPT(sectionContent, title || 'BPO Article');
    } else if (brief || content) {
      const articleContext = brief || content?.slice(0, 300) || '';
      basePrompt = `Professional hero image for article: "${title}". Context: ${articleContext}. Show Filipino BPO professionals in authentic work environment.`;
    }
    
    // Add topic-specific visual direction based on title
    const titleLower = (title || '').toLowerCase();
    let topicVisuals = '';
    if (titleLower.includes('salary') || titleLower.includes('compensation') || titleLower.includes('pay')) {
      topicVisuals = ' Show salary discussion, compensation review meeting, or professional reviewing pay documents.';
    } else if (titleLower.includes('interview') || titleLower.includes('hired')) {
      topicVisuals = ' Show professional job interview in modern meeting room, confident candidate.';
    } else if (titleLower.includes('career') || titleLower.includes('promot')) {
      topicVisuals = ' Show career advancement, team leader mentoring, professional celebrating milestone.';
    } else if (titleLower.includes('benefit') || titleLower.includes('rights')) {
      topicVisuals = ' Show HR benefits presentation, employee wellness program.';
    } else if (titleLower.includes('company') || titleLower.includes('review')) {
      topicVisuals = ' Show modern corporate office tour, team collaboration, vibrant workplace.';
    }
    basePrompt += topicVisuals;

    // Build enhanced prompt for Imagen
    const imagenPrompt = `Hyper-realistic photograph: ${basePrompt}. Real Filipino call center professionals in modern BPO office. Shot on professional DSLR, natural lighting, 8K quality, shallow depth of field, authentic expressions. ${NEGATIVE_STYLE}`;

    console.log("🎨 [IMAGE] Prompt:", imagenPrompt.substring(0, 150) + "...");
    console.log(`🎨 [IMAGE] Prompt length: ${imagenPrompt.length} characters`);

    // Generate with Google Imagen 4 using the service
    const imagen = new ImagenService(apiKey);
    const result = await imagen.generateImage({
      prompt: imagenPrompt,
      aspectRatio: '16:9',
      numberOfImages: 1,
      safetyFilterLevel: 'block_few',
      personGeneration: 'allow_adult'
    });

    if (result.success && result.imageBase64) {
      try {
        const imageBuffer = new Uint8Array(Buffer.from(result.imageBase64, 'base64'));
        const permanentUrl = await uploadToSupabase(
          imageBuffer,
          result.mimeType || 'image/png',
          slug,
          title,
          !!sectionContent
        );

        if (permanentUrl) {
          console.log("✅ [IMAGE] Final result: Generated with GOOGLE_IMAGEN_4");
          return NextResponse.json({
            success: true,
            imageUrl: permanentUrl,
            permanent: true,
            generatedWith: "google-imagen-4",
            generationTime: result.generationTime,
            prompt: imagenPrompt,
            metadata: {
              altText: `${title} - Filipino BPO professionals in modern office setting`,
              title: title,
              description: `Professional photograph illustrating ${title}. Features Filipino BPO professionals in an authentic corporate environment.`,
              caption: title,
            },
          });
        } else {
          console.error("❌ [IMAGE] Upload to Supabase failed");
          return NextResponse.json({
            success: false,
            error: "Image upload to storage failed. Please try again."
          }, { status: 500 });
        }
      } catch (uploadError: any) {
        console.error("❌ [IMAGE] Upload error:", uploadError.message);
        return NextResponse.json({
          success: false,
          error: `Image upload failed: ${uploadError.message}`
        }, { status: 500 });
      }
    }

    // Generation failed
    console.log(`\n${'='.repeat(60)}`);
    console.log("❌ [IMAGE GENERATION] GOOGLE_IMAGEN_4 FAILED");
    console.log(`   Error: ${result.error || 'Unknown error'}`);
    console.log("   Please try again or upload manually.");
    console.log(`${'='.repeat(60)}\n`);

    return NextResponse.json({
      success: false,
      error: result.error || "Google Imagen 4 failed to generate image. Please try again or upload manually.",
      suggestion: "Check that your GOOGLE_GENERATIVE_AI_API_KEY has access to Imagen 4."
    }, { status: 500 });

  } catch (error: any) {
    console.error("❌ [IMAGE] Error:", error.message);
    console.error("❌ [IMAGE] Stack:", error.stack);

    if (error?.error?.code === "content_policy_violation") {
      return NextResponse.json({
        success: false,
        error: "Content policy violation. Try a different prompt."
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error.message || "Image generation failed. Check server logs for details."
    }, { status: 500 });
  }
}
