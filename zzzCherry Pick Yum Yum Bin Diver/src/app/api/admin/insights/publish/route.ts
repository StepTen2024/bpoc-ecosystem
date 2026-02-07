import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    console.log(`📤 [PUBLISH] Action: ${action} on post ${id}`);

    if (action === "publish") {
      const { data, error } = await supabaseAdmin
        .from("insights_posts")
        .update({ is_published: true })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ [PUBLISH] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("✅ [PUBLISH] Published:", data.title);
      return NextResponse.json({
        success: true,
        message: `"${data.title}" is now LIVE!`,
        post: data
      });
    }

    if (action === "unpublish") {
      const { data, error } = await supabaseAdmin
        .from("insights_posts")
        .update({ is_published: false })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ [UNPUBLISH] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("✅ [UNPUBLISH] Unpublished:", data.title);
      return NextResponse.json({
        success: true,
        message: `"${data.title}" is now a draft`,
        post: data
      });
    }

    if (action === "delete") {
      // First get the post title for confirmation message
      const { data: post } = await supabaseAdmin
        .from("insights_posts")
        .select("title")
        .eq("id", id)
        .single();

      console.log(`🗑️ Deleting post and related data: ${post?.title}`);

      // Delete SEO metadata first (foreign key)
      const { error: seoError } = await supabaseAdmin
        .from("seo_metadata")
        .delete()
        .eq("post_id", id);
      if (seoError) console.log("Note: seo_metadata delete:", seoError.message);

      // Delete article links (both directions)
      const { error: linksError } = await supabaseAdmin
        .from("article_links")
        .delete()
        .or(`from_article_id.eq.${id},to_article_id.eq.${id}`);
      if (linksError) console.log("Note: article_links delete:", linksError.message);

      // Delete article embeddings
      const { error: embeddingsError } = await supabaseAdmin
        .from("article_embeddings")
        .delete()
        .eq("article_id", id);
      if (embeddingsError) console.log("Note: article_embeddings delete:", embeddingsError.message);

      // Delete targeted keywords
      await supabaseAdmin
        .from("targeted_keywords")
        .delete()
        .eq("article_id", id);

      // Delete image generation logs
      const { error: imageLogsError } = await supabaseAdmin
        .from("image_generation_logs")
        .delete()
        .eq("insight_id", id);
      if (imageLogsError) console.log("Note: image_generation_logs delete:", imageLogsError.message);

      // Delete content pipeline (AI pipeline data)
      const { error: pipelineError } = await supabaseAdmin
        .from("content_pipelines")
        .delete()
        .eq("insight_id", id);
      if (pipelineError) console.log("Note: content_pipelines delete:", pipelineError.message);

      // Delete the post
      const { error } = await supabaseAdmin
        .from("insights_posts")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("❌ [DELETE] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("✅ [DELETE] Deleted:", post?.title);
      return NextResponse.json({
        success: true,
        message: `"${post?.title}" has been deleted`
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("❌ [PUBLISH API] Error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

