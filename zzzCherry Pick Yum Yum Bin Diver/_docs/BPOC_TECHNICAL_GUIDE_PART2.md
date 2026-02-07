# 🏗️ BPOC Platform - Technical Guide Part 2
**Continuation of:** BPOC_COMPLETE_TECHNICAL_GUIDE.md  
**Last Updated:** January 27, 2026

---

## 📚 This Document Contains:
- Complete Key Features & Systems documentation (remaining systems 5-7)
- Development Workflow
- Deployment & Infrastructure
- Testing & Quality Assurance
- API Reference
- Troubleshooting Guide

---

## 🔑 Key Features & Systems (Continued)

### 5. 📰 Content Engine (Insights Blog) - 7-Stage AI Pipeline

**Status:** ✅ Production-Ready  
**Tables:** `insights_posts`, `content_pipelines`, `article_embeddings`, `targeted_keywords`

#### The 7-Stage Pipeline

```
STAGE 1: BRIEF 📝
├── Input Methods:
│   ├── Voice recording (transcribed via Whisper)
│   ├── Written brief (direct text input)
│   └── Template-based form
│
├── Processing:
│   ├── If voice: Transcribe to text
│   ├── Extract: Topic, angle, keywords
│   ├── Identify: Target audience, content type
│   └── Set parameters: Word count, tone, silo
│
├── Storage:
│   INSERT INTO content_pipelines
│   ├── brief_transcript: Full transcription
│   ├── current_stage: 'brief'
│   ├── created_by: user_id
│   └── status: 'pending_research'
│
└── Next: Auto-progress to Research stage

---

STAGE 2: RESEARCH 🔍
├── Concurrent Research Streams:
│
│   ├─── [A] Competitor Analysis (Serper API)
│   │    ├── Query: Target keyword + "BPO Philippines"
│   │    ├── Retrieve: Top 10 Google results
│   │    ├── Extract:
│   │    │   ├── Title, URL, snippet
│   │    │   ├── Word count estimates
│   │    │   ├── Header structure
│   │    │   └── Keyword usage
│   │    └── Store: serper_results[]
│   │
│   ├─── [B] Internal Knowledge (HR KB)
│   │    ├── Vector search in hr_embeddings_kb
│   │    ├── Find: Related Labor Code articles
│   │    ├── Extract: Relevant sections
│   │    └── Store: hr_kb_results[]
│   │
│   └─── [C] Deep Research (Perplexity)
│        ├── Model: sonar-pro
│        ├── Query: Comprehensive research query
│        ├── Returns: 2026+ current data
│        ├── Citations: Academic, industry sources
│        └── Store: perplexity_results
│
├── Synthesis (GPT-4):
│   ├── Combine all research sources
│   ├── Identify: Key themes, gaps, opportunities
│   ├── Extract: Statistics, quotes, examples
│   └── Store: research_synthesis
│
└── Update: current_stage = 'research_complete'

---

STAGE 3: PLAN 📋
├── Outline Generation (GPT-4):
│   System Prompt:
│   "You are an SEO content strategist.
│    Create a detailed article outline for:
│    Topic: {topic}
│    Target Keyword: {keyword}
│    Word Count: {target_words}
│    Audience: {audience}
│    
│    Research Context:
│    {research_synthesis}
│    
│    Requirements:
│    - Compelling H1
│    - 5-8 H2 sections
│    - 2-3 H3 per H2
│    - Meta description
│    - Internal linking opportunities"
│
├── Outline Structure:
│   {
│     "h1": "Main Title",
│     "meta_description": "160 chars",
│     "introduction": {
│       "hook": "Opening statement",
│       "context": "Background",
│       "thesis": "Main argument",
│       "word_count_target": 150
│     },
│     "sections": [
│       {
│         "h2": "Section Title",
│         "word_count_target": 400,
│         "h3_subsections": [
│           {
│             "h3": "Subsection",
│             "key_points": ["Point 1", "Point 2"],
│             "word_count_target": 150
│           }
│         ],
│         "internal_links": [
│           {
│             "anchor": "Link text",
│             "target_slug": "/insights/related-article"
│           }
│         ]
│       }
│     ],
│     "conclusion": {
│       "summary": "Key takeaways",
│       "cta": "Call to action",
│       "word_count_target": 100
│     }
│   }
│
├── Storage:
│   UPDATE content_pipelines
│   SET article_plan = outline,
│       current_stage = 'plan_pending_approval'
│
├── Human Review:
│   ├── Admin reviews outline
│   ├── Can request changes
│   ├── Approve to proceed
│   └── OR reject to restart from research
│
└── On Approval: current_stage = 'approved_for_writing'

---

STAGE 4: WRITE ✍️
├── Full Article Generation (GPT-4):
│   System Prompt:
│   "You are Ate Yna, a professional Filipino content writer 
│    specializing in BPO industry content.
│    
│    Voice Characteristics:
│    - Warm, conversational Filipino/English mix
│    - Professional but approachable
│    - Uses local examples and context
│    - Empathetic to BPO workers' concerns
│    
│    Personality Profile:
│    {personality_profile from personality_profiles table}
│    
│    Writing Instructions:
│    - Follow the approved outline exactly
│    - Hit word count targets per section
│    - Use natural, human-like transitions
│    - Include Philippines-specific examples
│    - Cite research sources naturally
│    - Integrate internal links contextually
│    - Write for readability (Grade 8-10 level)
│    - Use active voice predominantly
│    - Vary sentence structure
│    
│    SEO Requirements:
│    - Target keyword: {keyword}
│    - Keyword density: 1-2%
│    - Use keyword in: H1, first paragraph, conclusion
│    - Use related keywords naturally
│    - Write compelling subheadings"
│
├── Section-by-Section Generation:
│   FOR each section in article_plan:
│     ├── Generate section content
│     ├── Apply personality voice
│     ├── Insert research citations
│     ├── Add internal links
│     ├── Check word count
│     └── Append to full article
│
├── Post-Processing:
│   ├── Combine all sections
│   ├── Check total word count
│   ├── Verify keyword density
│   ├── Validate internal links
│   └── Format markdown properly
│
├── Storage:
│   UPDATE content_pipelines
│   SET raw_article = full_article,
│       word_count = total_words,
│       current_stage = 'writing_complete'
│
└── Next: Auto-progress to Humanization

---

STAGE 5: HUMANIZE 🎭
├── AI Pattern Detection (Grok 4.1):
│   Grok System Prompt:
│   "You are an AI writing detector.
│    Analyze this article for AI-generated patterns:
│    
│    Common AI Patterns to Detect:
│    
│    1. STRUCTURE:
│       - Overly consistent paragraph lengths
│       - Predictable section transitions
│       - Formulaic introductions/conclusions
│    
│    2. LANGUAGE:
│       - Overused phrases: 'delve into', 'landscape',
│         'navigate', 'realm', 'tapestry'
│       - Excessive adverbs
│       - Corporate jargon overload
│       - Hedging language: 'arguably', 'potentially'
│    
│    3. TONE:
│       - Overly formal/stiff
│       - Lacks personality/emotion
│       - Generic enthusiasm
│       - Robotic transitions
│    
│    4. TRANSITIONS:
│       - 'Moreover', 'Furthermore', 'In addition'
│       - 'It's worth noting that'
│       - 'It's important to understand'
│    
│    5. PHRASING:
│       - Lists of three (always)
│       - Rhetorical questions (excessive)
│       - Call-to-action clichés
│    
│    Return JSON:
│    {
│      'overall_score': 0-100 (0=robotic, 100=human),
│      'detected_patterns': [
│        {
│          'type': 'structure|language|tone|transition|phrasing',
│          'severity': 'high|medium|low',
│          'instances': ['example 1', 'example 2'],
│          'recommendation': 'How to fix'
│        }
│      ]
│    }"
│
├── Pattern Analysis:
│   detection_result = await grok.analyze(raw_article);
│   human_score = detection_result.overall_score;
│
├── Rewriting (If score < 80):
│   Grok Rewrite Prompt:
│   "Rewrite this article to sound more human:
│    
│    Original Article:
│    {raw_article}
│    
│    Detected Issues:
│    {detected_patterns}
│    
│    Rewriting Guidelines:
│    - Vary sentence lengths naturally
│    - Use contractions where appropriate
│    - Add personal touches and anecdotes
│    - Replace AI clichés with fresh language
│    - Make transitions more casual
│    - Add subtle humor where fitting
│    - Use Filipino expressions naturally
│    - Write like a real person would talk
│    
│    Maintain:
│    - All facts and research citations
│    - SEO keyword placement
│    - Internal links
│    - Overall structure and message"
│
├── Iterative Improvement:
│   WHILE human_score < 85 AND iterations < 3:
│     ├── Rewrite article
│     ├── Re-analyze with Grok
│     ├── Calculate new human_score
│     └── iterations++
│
├── Pattern Cataloging:
│   FOR each detected_pattern:
│     ├── Check if exists in humanization_patterns
│     ├── If new: INSERT
│     ├── If exists: UPDATE frequency_detected++
│     └── Store before/after examples
│
├── Storage:
│   UPDATE content_pipelines
│   SET humanized_article = final_version,
│       human_score = final_score,
│       humanization_metadata = {
│         patterns_detected,
│         iterations_needed,
│         improvements_made
│       },
│       current_stage = 'humanization_complete'
│
└── Next: Auto-progress to SEO Optimization

---

STAGE 6: SEO OPTIMIZE 🎯
├── Meta Tag Generation (GPT-4):
│   ├── Meta Description (155-160 chars)
│   │   ├── Include target keyword
│   │   ├── Compelling CTA
│   │   └── Accurate preview
│   │
│   ├── Meta Title (50-60 chars)
│   │   ├── Keyword at start
│   │   ├── Brand name at end
│   │   └── Engaging format
│   │
│   └── Focus Keyphrase
│       └── Primary target keyword
│
├── Keyword Optimization:
│   ├── Analyze keyword density
│   │   ├── Target: 1-2% for primary
│   │   ├── Related keywords: 0.5-1% each
│   │   └── Adjust if needed
│   │
│   ├── Keyword Placement Check:
│   │   ├── ✓ In H1
│   │   ├── ✓ First 100 words
│   │   ├── ✓ At least 1 H2
│   │   ├── ✓ URL slug
│   │   ├── ✓ Meta description
│   │   └── ✓ Conclusion
│   │
│   └── Anti-Cannibalization Check:
│       ├── Query targeted_keywords table
│       ├── IF keyword already used:
│       │   ├── Alert: Potential cannibalization
│       │   ├── Suggest: Alternative keyword
│       │   └── Require: Approval to proceed
│       └── ELSE: Mark keyword as used
│
├── Internal Linking Automation:
│   ├── Extract existing internal links
│   ├── Semantic search for related articles
│   │   ├── Generate embedding for content
│   │   ├── Search article_embeddings table
│   │   ├── Find: Top 5 related articles
│   │   └── Calculate: Relevance scores
│   │
│   ├── Smart Link Insertion:
│   │   FOR each related_article:
│   │     ├── Identify: Contextual paragraph
│   │     ├── Generate: Natural anchor text
│   │     ├── Insert: Link in context
│   │     └── Log: article_links table
│   │
│   └── Link Balance:
│       ├── Target: 3-5 internal links per article
│       ├── Distribute: Throughout content
│       └── Avoid: Over-optimization
│
├── Readability Analysis:
│   ├── Flesch Reading Ease: Target 60-70
│   ├── Flesch-Kincaid Grade: Target 8-10
│   ├── Sentence length: Average 15-20 words
│   ├── Paragraph length: 2-4 sentences
│   └── Subheading frequency: Every 300 words
│
├── Schema Markup Generation:
│   {
│     "@context": "https://schema.org",
│     "@type": "Article",
│     "headline": "{h1}",
│     "description": "{meta_description}",
│     "author": {
│       "@type": "Person",
│       "name": "Ate Yna"
│     },
│     "publisher": {
│       "@type": "Organization",
│       "name": "BPOC",
│       "logo": {
│         "@type": "ImageObject",
│         "url": "https://bpoc.com/logo.png"
│       }
│     },
│     "datePublished": "{publish_date}",
│     "dateModified": "{modified_date}",
│     "image": "{hero_image_url}",
│     "articleBody": "{article_text}"
│   }
│
├── Storage:
│   UPDATE content_pipelines
│   SET seo_article = optimized_article,
│       seo_stats = {
│         keyword_density,
│         readability_score,
│         internal_links_count,
│         word_count
│       },
│       seo_metadata = {
│         meta_title,
│         meta_description,
│         schema_markup
│       },
│       current_stage = 'seo_complete'
│
└── Next: Ready for Publishing

---

STAGE 7: PUBLISH 🚀
├── Content Splitting (for loading optimization):
│   ├── Split article into 3 parts
│   │   ├── Part 1: Introduction + first 2 sections
│   │   ├── Part 2: Middle sections
│   │   └── Part 3: Remaining + conclusion
│   └── Store: content_part1, content_part2, content_part3
│
├── Hero Media Selection:
│   ├── If hero_type = 'video':
│   │   ├── Generate video script (GPT-4)
│   │   ├── Generate video (Runway/Stability)
│   │   ├── Upload to Supabase Storage
│   │   └── Store: hero video URL
│   │
│   └── If hero_type = 'image':
│       ├── Generate image prompt (GPT-4)
│       ├── Generate image (DALL-E 3)
│       ├── Upload to Supabase Storage
│       └── Store: hero image URL
│
├── Section Images:
│   FOR each major section:
│     ├── Generate contextual image prompt
│     ├── Generate image (DALL-E 3)
│     ├── Upload to Supabase Storage
│     ├── Add to images[] array
│     └── Log generation in image_generation_logs
│
├── Final Article Creation:
│   INSERT INTO insights_posts
│   ├── title: H1 from article
│   ├── slug: URL-friendly version
│   ├── content_part1/2/3: Split content
│   ├── meta_description: From SEO stage
│   ├── hero: Hero media URL
│   ├── hero_type: 'image' | 'video'
│   ├── images[]: Section images
│   ├── applied_links[]: Internal links used
│   ├── hr_kb_articles[]: Labor Code refs
│   ├── content_type: pillar | supporting | hub
│   ├── depth: Silo hierarchy level (0-4)
│   ├── parent_post_id: Parent article (if applicable)
│   ├── pipeline_id: Link to pipeline record
│   ├── generation_metadata: Full AI logs
│   ├── is_published: false (requires approval)
│   └── created_at: NOW()
│
├── URL Structure Setup:
│   ├── Base: /insights/{slug}
│   ├── Canonical: Full URL
│   ├── Sitemap: Add to XML sitemap
│   └── Robots: Ensure crawlable
│
├── Pre-Publish Checklist:
│   ✓ All images uploaded
│   ✓ Internal links valid
│   ✓ External links working
│   ✓ Schema markup valid
│   ✓ Meta tags complete
│   ✓ Readability acceptable
│   ✓ No spelling errors
│   ✓ No duplicate content
│
├── Human Approval:
│   ├── Admin reviews final article
│   ├── Can request changes
│   ├── Approve to publish
│   └── OR send back to specific stage
│
├── Publication:
│   UPDATE insights_posts
│   SET is_published = true,
│       published_at = NOW(),
│       published_by = admin_id
│
├── Post-Publication:
│   ├── Add to sitemap.xml
│   ├── Submit to Google Search Console
│   ├── Share on social media
│   ├── Notify email subscribers
│   └── Update targeted_keywords table
│
└── Pipeline Completion:
    UPDATE content_pipelines
    SET current_stage = 'published',
        completed_at = NOW(),
        status = 'success'
```

#### Anti-Cannibalization System

```sql
-- Before assigning keyword to article
CREATE FUNCTION check_keyword_cannibalization(
  p_keyword TEXT,
  p_article_id UUID
) RETURNS JSONB AS $$
DECLARE
  existing_usage RECORD;
  result JSONB;
BEGIN
  -- Check if keyword already used
  SELECT * INTO existing_usage
  FROM targeted_keywords
  WHERE keyword = p_keyword
    AND article_id != p_article_id;
  
  IF FOUND THEN
    -- Keyword already used - potential cannibalization
    result := jsonb_build_object(
      'can_use', false,
      'reason', 'keyword_already_used',
      'existing_article_id', existing_usage.article_id,
      'existing_article_title', (
        SELECT title FROM insights_posts 
        WHERE id = existing_usage.article_id
      ),
      'recommendation', 'Use alternative keyword or update existing article'
    );
  ELSE
    -- Keyword available
    result := jsonb_build_object(
      'can_use', true,
      'reason', 'keyword_available'
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

### 6. 📬 Outbound Lead System (Carpet Bomb)

**Status:** ✅ Production-Ready (23,132 leads!)  
**Tables:** `carpet_bomb_leads`, `email_campaigns`, `campaign_recipients`, `email_activity_log`

#### Complete Lead Lifecycle

```
Phase 1: Lead Import
├── CSV Upload Interface
│   ├── Admin uploads CSV file
│   ├── Validates: Required columns (email, first_name, last_name)
│   ├── Optional: phone, city, years_experience, source, etc.
│   └── Maps columns to database fields
│
├── Deduplication Strategy
│   ├── Option 1: Skip duplicates
│   ├── Option 2: Update existing records
│   ├── Option 3: Mark as duplicate
│   └── Based on: email address (primary key)
│
├── Batch Processing
│   INSERT INTO csv_import_batches
│   ├── filename, file_size, uploaded_by
│   ├── column_mapping: { csv_col → db_field }
│   ├── deduplication_strategy: skip | update | mark
│   └── status: processing
│
├── Row-by-Row Import
│   FOR each row in CSV:
│     ├── Validate: Email format, required fields
│     ├── Check: Duplicate exists?
│     │   ├── If Yes + strategy=skip: Skip row
│     │   ├── If Yes + strategy=update: UPDATE existing
│     │   └── If Yes + strategy=mark: Mark duplicate
│     │
│     ├── Insert/Update carpet_bomb_leads
│     │   ├── email, first_name, last_name
│     │   ├── phone, custom_fields{}
│     │   ├── source: CSV filename or campaign name
│     │   ├── been_contacted: false
│     │   ├── signed_up: false
│     │   └── email_validated: false (pending validation)
│     │
│     └── Handle errors:
│         └── Log to error_log{} in batch record
│
├── Email Validation (Optional - via API)
│   FOR each new email:
│     ├── Check: Email format valid?
│     ├── Check: Domain has MX records?
│     ├── Check: Disposable email provider?
│     ├── Update: email_validated = true/false
│     └── If invalid: Mark is_bounced = true
│
├── Import Summary
│   UPDATE csv_import_batches
│   SET status = 'completed',
│       total_rows = count,
│       imported_count = successful,
│       updated_count = updates,
│       duplicate_count = duplicates,
│       error_count = errors,
│       completed_at = NOW()
│
└── Notification
    └── Email admin: "Import complete: X leads imported"

---

Phase 2: Campaign Creation
├── Campaign Configuration
│   ├── Name & Description
│   ├── Email Template (HTML + plain text)
│   │   ├── Available variables:
│   │   │   {firstName}, {lastName}, {email},
│   │   │   {phone}, {customField1}, {customField2}
│   │   ├── Dynamic content blocks
│   │   └── Personalization tokens
│   │
│   ├── Target Audience
│   │   ├── Filter by: been_contacted, signed_up
│   │   ├── Filter by: tags[], custom_fields{}
│   │   ├── Filter by: source, date ranges
│   │   ├── SQL WHERE clause builder
│   │   └── Preview: Recipient count
│   │
│   ├── Scheduling
│   │   ├── Send immediately
│   │   ├── Schedule for specific date/time
│   │   └── Timezone: Philippines (GMT+8)
│   │
│   ├── Sending Configuration
│   │   ├── Batch size: 100-500 per batch
│   │   ├── Delay between batches: 30-60 seconds
│   │   ├── Rate limiting: Respect ISP limits
│   │   └── Sender: email & name
│   │
│   └── UTM Tracking
│       ├── utm_source: e.g., "email_campaign"
│       ├── utm_medium: "email"
│       ├── utm_campaign: Campaign name
│       ├── utm_content: Variation ID
│       └── utm_term: Keyword
│
├── Campaign Validation
│   ✓ Subject line not empty
│   ✓ Template has content
│   ✓ Sender email verified
│   ✓ At least 1 recipient
│   ✓ All variables have values
│   ✓ No broken links
│   ✓ Unsubscribe link present
│
├── Storage
│   INSERT INTO email_campaigns
│   ├── name, description, subject_line
│   ├── template_html, template_text
│   ├── target_filters: SQL WHERE clause
│   ├── recipient_count: Estimated
│   ├── status: draft | scheduled | sending
│   ├── scheduled_at: When to send
│   ├── batch_size, delay_between_batches
│   ├── sender_email, sender_name
│   ├── utm_source, utm_medium, utm_campaign
│   └── created_by: admin_id
│
└── Recipient List Generation
    INSERT INTO campaign_recipients
    SELECT 
      campaign_id,
      lead_id,
      email,
      status = 'pending',
      rendered_subject = render(subject_line, lead_data),
      rendered_html = render(template_html, lead_data)
    FROM carpet_bomb_leads
    WHERE {target_filters}
      AND email_validated = true
      AND is_bounced = false
      AND unsubscribed = false;

---

Phase 3: Campaign Execution
├── Sending Queue
│   ├── Fetch: Pending recipients in batches
│   ├── Order by: Created date (FIFO)
│   └── Limit: batch_size
│
├── Batch Processing Loop
│   WHILE has_pending_recipients:
│     │
│     ├── Fetch next batch (e.g., 100 recipients)
│     │
│     ├── FOR each recipient in batch:
│     │   │
│     │   ├── Render Email
│     │   │   ├── Replace: {variables} with actual data
│     │   │   ├── Add: Tracking pixel
│     │   │   ├── Add: UTM parameters to links
│     │   │   └── Add: Unsubscribe link with token
│     │   │
│     │   ├── Send via Resend API
│     │   │   POST https://api.resend.com/emails
│     │   │   {
│     │   │     "from": "sender@bpoc.com",
│     │   │     "to": "recipient@email.com",
│     │   │     "subject": "Rendered subject",
│     │   │     "html": "Rendered HTML",
│     │   │     "text": "Rendered plain text",
│     │   │     "headers": {
│     │   │       "X-Campaign-ID": "campaign_id",
│     │   │       "List-Unsubscribe": "<unsubscribe_url>"
│     │   │     }
│     │   │   }
│     │   │
│     │   ├── Handle Response
│     │   │   ├── If Success (202):
│     │   │   │   ├── UPDATE campaign_recipients
│     │   │   │   │   SET status = 'sent',
│     │   │   │   │       sent_at = NOW()
│     │   │   │   ├── UPDATE carpet_bomb_leads
│     │   │   │   │   SET been_contacted = true,
│     │   │   │   │       contact_count++,
│     │   │   │   │       last_contacted_at = NOW(),
│     │   │   │   │       total_emails_sent++
│     │   │   │   └── Log: email_activity_log (event: 'sent')
│     │   │   │
│     │   │   ├── If Error (4xx/5xx):
│     │   │   │   ├── UPDATE campaign_recipients
│     │   │   │   │   SET status = 'failed',
│     │   │   │   │       error_message = error,
│     │   │   │   │       retry_count++
│     │   │   │   ├── If retry_count < max_retries (3):
│     │   │   │   │   └── status = 'pending' (retry later)
│     │   │   │   └── Else:
│     │   │   │       └── status = 'failed' (permanent)
│     │   │   │
│     │   │   └── If Bounced:
│     │   │       ├── UPDATE carpet_bomb_leads
│     │   │       │   SET is_bounced = true,
│     │   │       │       bounce_reason = reason
│     │   │       └── Log: email_activity_log (event: 'bounced')
│     │   │
│     │   └── Rate Limiting
│     │       └── Sleep: 50-100ms between emails
│     │
│     ├── Update Campaign Progress
│     │   UPDATE email_campaigns
│     │   SET sent_count++
│     │
│     ├── Delay Between Batches
│     │   └── Sleep: delay_between_batches seconds
│     │
│     └── Continue to next batch
│
└── Campaign Completion
    UPDATE email_campaigns
    SET status = 'completed',
        completed_at = NOW()

---

Phase 4: Engagement Tracking
├── Tracking Pixel (Open Tracking)
│   ├── Image: 1x1 transparent pixel
│   ├── URL: /api/track/open/{campaign_id}/{recipient_id}
│   │
│   ├── When Loaded:
│   │   ├── Log: email_activity_log
│   │   │   ├── event_type: 'opened'
│   │   │   ├── user_agent, ip_address
│   │   │   └── event_timestamp
│   │   │
│   │   ├── UPDATE campaign_recipients
│   │   │   SET status = 'opened',
│   │   │       opened_at = NOW() (if first open),
│   │   │       open_count++
│   │   │
│   │   ├── UPDATE email_campaigns
│   │   │   SET opened_count++ (unique opens only)
│   │   │
│   │   └── UPDATE carpet_bomb_leads
│   │       SET total_emails_opened++
│   │
│   └── Return: 1x1 transparent PNG
│
├── Link Click Tracking
│   ├── Link Format: /api/track/click/{campaign_id}/{recipient_id}?url={target}
│   │
│   ├── When Clicked:
│   │   ├── Log: email_activity_log
│   │   │   ├── event_type: 'clicked'
│   │   │   ├── link_clicked: target_url
│   │   │   ├── user_agent, ip_address
│   │   │   └── event_timestamp
│   │   │
│   │   ├── UPDATE campaign_recipients
│   │   │   SET status = 'clicked',
│   │   │       clicked_at = NOW() (if first click),
│   │   │       click_count++
│   │   │
│   │   ├── UPDATE email_campaigns
│   │   │   SET clicked_count++ (unique clicks only)
│   │   │
│   │   ├── UPDATE carpet_bomb_leads
│   │   │   SET total_emails_clicked++
│   │   │
│   │   ├── Log: carpet_bomb_link_clicks
│   │   │   ├── lead_id, campaign_id
│   │   │   ├── link_url, clicked_at
│   │   │   ├── UTM parameters
│   │   │   └── user_agent, ip_address
│   │   │
│   │   └── Redirect: To target_url with UTM params
│   │
│   └── Landing Page Tracking
│       └── JavaScript: Track page views, time on site
│
├── Website Visit Tracking (via UTM)
│   ├── When lead visits site with UTM params:
│   │   ├── Extract: utm_source, utm_campaign, etc.
│   │   ├── Identify: lead_id from tracking param
│   │   │   OR match: email from session/cookie
│   │   │
│   │   └── UPDATE carpet_bomb_leads
│   │       SET visited_site = true,
│   │           first_visit_at = NOW() (if first),
│   │           visit_count++,
│   │           utm_source, utm_medium, utm_campaign
│   │
│   └── Session Tracking
│       └── Cookie: lead_tracking_id (7 days)
│
└── Conversion Tracking (Sign Up)
    ├── When lead signs up:
    │   ├── Match: email from signup to lead
    │   │
    │   └── UPDATE carpet_bomb_leads
    │       SET signed_up = true,
    │           signed_up_at = NOW(),
    │           candidate_id = new_candidate_id,
    │           converted_to_signup = true
    │
    └── Conversion Attribution
        └── Log: Which campaign led to signup

---

Phase 5: Unsubscribe Management
├── Unsubscribe Link
│   ├── Format: /unsubscribe/{lead_id}/{token}
│   ├── Token: SHA-256 hash of (lead_id + secret)
│   │
│   └── When Clicked:
│       ├── Validate: token matches lead_id
│       ├── Show: Unsubscribe confirmation page
│       ├── Optional: Feedback form (why unsubscribing)
│       │
│       ├── On Confirm:
│       │   ├── UPDATE carpet_bomb_leads
│       │   │   SET unsubscribed = true,
│       │   │       unsubscribed_at = NOW(),
│       │   │       unsubscribe_reason = feedback
│       │   │
│       │   ├── Log: email_activity_log
│       │   │   └── event_type: 'unsubscribed'
│       │   │
│       │   └── UPDATE email_campaigns
│       │       SET unsubscribed_count++
│       │
│       └── Confirmation: "You've been unsubscribed"
│
└── Compliance
    ├── CAN-SPAM Act (US)
    ├── Philippine Data Privacy Act (RA 10173)
    └── GDPR (if applicable)
```

---

### 7. 🛡️ Admin System - Platform Management

**Status:** ✅ Production-Ready  
**Tables:** `admin_audit_log`, `admin_notes`, `platform_errors`, `webhooks`

#### Admin Dashboard Features

```
Analytics Overview
├── User Metrics
│   ├── Total Candidates: Real-time count
│   ├── Active Candidates: Last 30 days
│   ├── New Signups: Today, this week, this month
│   ├── Growth Rate: % change vs previous period
│   └── Churn Rate: Inactive candidates
│
├── Recruitment Metrics
│   ├── Total Applications: All time
│   ├── Active Applications: In pipeline
│   ├── Applications by Status:
│   │   ├── Submitted: Awaiting review
│   │   ├── Under Review: Actively screening
│   │   ├── Shortlisted: Passed prescreen
│   │   ├── Interviewed: Completed interview
│   │   └── Hired: Successfully placed
│   ├── Average Time to Hire: Days from apply to hire
│   ├── Conversion Rate: Applications → Hires
│   └── Rejection Rate: By stage
│
├── Job Metrics
│   ├── Active Jobs: Currently open
│   ├── Filled Jobs: Successfully filled
│   ├── Average Time to Fill: Days to close
│   ├── Applications per Job: Average
│   └── Most Popular Jobs: By applications
│
├── Agency Metrics
│   ├── Total Agencies: All registered
│   ├── Active Agencies: Made activity in 30 days
│   ├── API Usage: Calls per day/week/month
│   ├── Webhook Deliveries: Success rate
│   └── Revenue: Subscription fees
│
├── System Health
│   ├── Database Size: Total storage used
│   ├── API Response Time: Average (ms)
│   ├── Error Rate: Errors per 1000 requests
│   ├── Uptime: % uptime this month
│   └── Active Sessions: Current users online
│
└── Engagement Metrics
    ├── HR Assistant Usage: Questions asked/day
    ├── Video Calls: Created, completed, recorded
    ├── Resume Uploads: Per day/week
    ├── Content Views: Blog traffic
    └── Email Opens/Clicks: Campaign performance

---

Candidate Management
├── Candidate List
│   ├── Search: Name, email, skills, location
│   ├── Filters:
│   │   ├── Status: Active, suspended, inactive
│   │   ├── Verified: Email verified
│   │   ├── Profile: Complete vs incomplete
│   │   ├── Last Login: Date range
│   │   └── Registration: Date range
│   │
│   ├── Sort: Name, email, created_at, last_login
│   │
│   └── Actions (per candidate):
│       ├── View Profile: Full details
│       ├── View Applications: All applications
│       ├── Suspend: Disable account
│       ├── Reactivate: Enable account
│       ├── Delete: Soft delete (mark inactive)
│       ├── Send Email: Direct message
│       └── Add Note: Internal memo
│
├── Candidate Details
│   ├── Profile Information
│   │   ├── Basic: Name, email, phone
│   │   ├── Location: City, province, region
│   │   ├── Work Status: Available, employed, etc.
│   │   └── Preferences: Salary, shifts, work type
│   │
│   ├── Resume Analysis
│   │   ├── Latest Resume: View/download
│   │   ├── AI Scores: ATS, content, presentation
│   │   └── Recommendations: AI suggestions
│   │
│   ├── Skills & Experience
│   │   ├── Skills: List with proficiency
│   │   ├── Work History: All positions
│   │   └── Education: Degrees & certifications
│   │
│   ├── Application History
│   │   ├── All Applications: Chronological
│   │   ├── Current Status: Each application
│   │   └── Timeline: Full activity log
│   │
│   ├── Activity Log
│   │   ├── Logins: Last 10 logins
│   │   ├── Profile Updates: Change history
│   │   ├── Resume Uploads: Version history
│   │   └── Job Applications: Application events
│   │
│   └── Admin Actions
│       ├── Suspend: With reason required
│       ├── Verify Email: Manual verification
│       ├── Reset Password: Send reset link
│       ├── Merge Accounts: Duplicate handling
│       └── Export Data: GDPR compliance
│
└── Bulk Actions
    ├── Export: CSV of selected candidates
    ├── Send Email: Bulk email campaign
    ├── Tag: Add tags to multiple
    └── Suspend: Bulk suspension

---

Agency Management
├── Agency List
│   ├── Search: Name, email, domain
│   ├── Filters:
│   │   ├── Status: Active, suspended
│   │   ├── API Enabled: Yes/No
│   │   ├── Tier: Free, Pro, Enterprise
│   │   └── Activity: Last API call date
│   │
│   └── Actions:
│       ├── View Details: Full agency info
│       ├── Manage Recruiters: Team members
│       ├── API Settings: Keys, webhooks
│       ├── Usage Statistics: API calls, limits
│       ├── Suspend: Disable agency
│       └── Change Tier: Upgrade/downgrade
│
├── Agency Details
│   ├── Profile
│   │   ├── Basic: Name, logo, website
│   │   ├── Contact: Email, phone, address
│   │   ├── Status: Active, suspended
│   │   └── Suspension: Reason, date (if suspended)
│   │
│   ├── API Configuration
│   │   ├── API Key: Show/regenerate
│   │   ├── API Enabled: Toggle
│   │   ├── API Tier: Free/Pro/Enterprise
│   │   ├── Rate Limits: Requests per minute
│   │   └── Webhook URL: Endpoint
│   │
│   ├── Team Members
│   │   ├── Recruiters: List all
│   │   ├── Roles: Owner, Admin, Recruiter, Viewer
│   │   ├── Permissions: Per recruiter
│   │   └── Invite: Send team invitation
│   │
│   ├── Job Postings
│   │   ├── Total Jobs: All posted
│   │   ├── Active Jobs: Currently open
│   │   └── Job List: With status
│   │
│   ├── Placements
│   │   ├── Total Hires: All time
│   │   ├── Active Placements: Currently employed
│   │   └── Success Rate: % of applications → hires
│   │
│   └── API Usage
│       ├── Calls This Month: Total requests
│       ├── Calls By Endpoint: Breakdown
│       ├── Average Response Time: Latency
│       └── Error Rate: % failed requests
│
└── Webhook Management
    ├── Webhook Configuration
    │   ├── URL: Endpoint to POST to
    │   ├── Secret: For HMAC signature
    │   ├── Events: job.created, application.submitted, etc.
    │   ├── Retry: Failed delivery retry settings
    │   └── Timeout: Request timeout (seconds)
    │
    ├── Delivery Log
    │   ├── Recent Deliveries: Last 100
    │   ├── Status: Success, failed, retrying
    │   ├── Response Code: HTTP status
    │   ├── Response Time: Latency
    │   └── Payload: Full JSON sent
    │
    └── Test Webhook
        └── Send: Test payload to URL

---

Error Dashboard (AI-Powered Kanban)
├── Kanban Board
│   ├── Columns: New, Analyzing, Diagnosed, In Progress, Resolved
│   │
│   ├── NEW Column
│   │   ├── Errors just reported
│   │   ├── Auto-trigger: AI diagnosis
│   │   └── Move to: Analyzing (auto)
│   │
│   ├── ANALYZING Column
│   │   ├── AI diagnosis in progress
│   │   ├── Gemini Pro analyzes:
│   │   │   ├── Error message, stack trace
│   │   │   ├── Request/response context
│   │   │   ├── Similar past errors
│   │   │   └── Code patterns
│   │   ├── Generates diagnosis:
│   │   │   ├── Root cause
│   │   │   ├── Suggested fix
│   │   │   ├── Related errors
│   │   │   └── Confidence score
│   │   └── Move to: Diagnosed (auto)
│   │
│   ├── DIAGNOSED Column
│   │   ├── AI diagnosis complete
│   │   ├── Admin reviews diagnosis
│   │   ├── Can: Assign to developer
│   │   ├── Can: Mark as duplicate
│   │   ├── Can: Close as "won't fix"
│   │   └── Move to: In Progress (manual)
│   │
│   ├── IN PROGRESS Column
│   │   ├── Being actively fixed
│   │   ├── Assigned to: Developer
│   │   ├── Notes: Resolution progress
│   │   └── Move to: Resolved (manual)
│   │
│   └── RESOLVED Column
│       ├── Fixed errors
│       ├── Resolution notes required
│       ├── Archived after: 30 days
│       └── Used for: AI learning
│
├── Filters
│   ├── Severity: Critical, High, Medium, Low
│   ├── Category: API, Database, Auth, UI, etc.
│   ├── Date Range: When occurred
│   ├── Occurrence: Single vs recurring
│   └── Assigned: Unassigned, Me, Others
│
├── Error Details Modal
│   ├── Error Information
│   │   ├── Message: Human-readable error
│   │   ├── Code: Error code
│   │   ├── Stack: Full stack trace
│   │   ├── Type: Exception type
│   │   └── Endpoint: Where occurred
│   │
│   ├── Request Context
│   │   ├── Method: GET, POST, etc.
│   │   ├── Headers: Request headers
│   │   ├── Body: Request payload
│   │   ├── Query Params: URL parameters
│   │   └── User: Who triggered
│   │
│   ├── Response Context
│   │   ├── Status Code: HTTP status
│   │   ├── Body: Response payload
│   │   └── Time: Response time (ms)
│   │
│   ├── AI Diagnosis
│   │   ├── Root Cause: What caused error
│   │   ├── Suggested Fix: How to resolve
│   │   ├── Related Errors: Similar issues
│   │   ├── Confidence: AI confidence (0-100%)
│   │   └── Model Used: AI model name
│   │
│   ├── Occurrence Tracking
│   │   ├── First Occurred: First timestamp
│   │   ├── Last Occurred: Most recent
│   │   ├── Count: Total occurrences
│   │   └── Frequency: Per hour/day
│   │
│   └── Admin Actions
│       ├── Assign: To developer
│       ├── Change Severity: Adjust priority
│       ├── Add Notes: Internal comments
│       ├── Mark Duplicate: Link to original
│       ├── Resolve: Mark as fixed
│       └── Close: Won't fix with reason
│
└── Analytics
    ├── Error Rate: Trend over time
    ├── MTTR: Mean time to resolution
    ├── Top Errors: Most frequent
    ├── Error by Endpoint: Breakdown
    └── Severity Distribution: Pie chart

---

Audit Log
├── Comprehensive Tracking
│   ├── Every Admin Action Logged
│   ├── Fields Tracked:
│   │   ├── admin_id: Who acted
│   │   ├── action: suspend, delete, etc.
│   │   ├── entity_type: candidate, job, etc.
│   │   ├── entity_id: UUID of entity
│   │   ├── reason: Why action was taken
│   │   ├── changes: Before/after values
│   │   ├── ip_address: Where from
│   │   └── timestamp: When occurred
│   │
│   └── Retention: Permanent
│
├── Audit Log Viewer
│   ├── Search: By admin, entity, action
│   ├── Filters:
│   │   ├── Date Range: When occurred
│   │   ├── Admin: Who performed
│   │   ├── Action Type: What was done
│   │   ├── Entity Type: What was affected
│   │   └── Has Reason: With/without reason
│   │
│   ├── Sort: Timestamp (desc/asc)
│   │
│   └── Details View
│       ├── Full Context: All fields
│       ├── Changes: Diff view
│       ├── Related Actions: Same entity
│       └── Export: Download as CSV
│
└── Compliance
    ├── GDPR: Right to erasure tracking
    ├── Data Privacy Act: Philippine compliance
    └── SOC 2: Audit trail for security

---

Internal Notes System
├── Add Notes To Any Entity
│   ├── Entities: Candidate, Job, Application, Agency
│   ├── Note Fields:
│   │   ├── Text: Rich text content
│   │   ├── Priority: Low, Medium, High
│   │   ├── Tags: Categorization
│   │   ├── Visibility: Internal only vs shared
│   │   └── Related: Link to other entities
│   │
│   └── Storage:
│       INSERT INTO admin_notes (
│         entity_type, entity_id,
│         note_text, priority, tags,
│         is_internal, created_by
│       )
│
├── Note Management
│   ├── View: All notes for entity
│   ├── Edit: Update existing note
│   ├── Delete: Remove note
│   ├── Pin: Keep at top
│   └── Archive: Hide from view
│
└── Use Cases
    ├── Red flags: "Candidate has fake resume"
    ├── Reminders: "Follow up on Monday"
    ├── Context: "Client prefers phone screen first"
    └── History: "Previous suspension: spam"
```

---

(Continued in next section with: Development Workflow, Deployment, Testing, API Reference, and Troubleshooting)

