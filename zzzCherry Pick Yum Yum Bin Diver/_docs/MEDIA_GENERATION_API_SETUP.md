# Media Generation API Setup

## Environment Variables Required

Add these to your `.env` file:

```bash
# Runway API (for video generation)
RUNWAY_API_KEY=your_runway_api_key_here

# Google Imagen API (for image generation)
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_PROJECT_ID=your_google_project_id_here
```

---

## 1. Runway API Setup (Video Generation)

### Get API Key:
1. Go to https://runwayml.com/
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Create a new API key
5. Copy the key and add to `.env` as `RUNWAY_API_KEY`

### API Details:
- **Endpoint:** `https://api.runwayml.com/v1/gen3a-turbo`
- **Model:** Gen-3 Alpha Turbo
- **Duration:** 5 seconds per video
- **Ratio:** 16:9 (landscape)
- **Polling:** Checks every 5 seconds for completion

### Pricing:
- Check current pricing at https://runwayml.com/pricing
- Typically charged per second of video generated

---

## 2. Google Imagen API Setup (Image Generation)

### Get API Key:
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable the "Vertex AI API"
4. Go to "APIs & Services" → "Credentials"
5. Create API key
6. Copy the key and add to `.env` as `GOOGLE_API_KEY`
7. Copy your project ID and add to `.env` as `GOOGLE_PROJECT_ID`

### Update API URL:
In `src/app/api/admin/insights/pipeline/generate-image/route.ts`, replace:
```typescript
const IMAGEN_API_URL = 'https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/imagegeneration@006:predict';
```

With:
```typescript
const IMAGEN_API_URL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/imagegeneration@006:predict`;
```

### API Details:
- **Model:** imagegeneration@006
- **Aspect Ratio:** 16:9
- **Output:** Base64 encoded PNG
- **Safety:** Block some unsafe content

### Pricing:
- Check current pricing at https://cloud.google.com/vertex-ai/pricing
- Typically charged per image generated

---

## 3. Media Upload API

The upload endpoint (`/api/admin/upload-media`) should already exist in your project. If not, it needs to:

1. Accept FormData with `file` and `type` fields
2. Upload to your storage (e.g., Supabase Storage, AWS S3)
3. Return `{ success: true, url: 'uploaded_file_url' }`

---

## Testing

### Test Video Generation:
```bash
curl -X POST http://localhost:3000/api/admin/insights/pipeline/generate-video \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Professional BPO office environment", "insightId": "test-123"}'
```

### Test Image Generation:
```bash
curl -X POST http://localhost:3000/api/admin/insights/pipeline/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "BPO career growth illustration"}'
```

---

## API Endpoints Created

### ✅ Video Generation
- **Path:** `/api/admin/insights/pipeline/generate-video`
- **Method:** POST
- **Body:** `{ prompt: string, insightId: string }`
- **Response:** `{ success: boolean, videoUrl: string, taskId: string }`
- **Provider:** Runway Gen-3 Alpha Turbo

### ✅ Image Generation
- **Path:** `/api/admin/insights/pipeline/generate-image`
- **Method:** POST
- **Body:** `{ prompt: string }`
- **Response:** `{ success: boolean, imageUrl: string }`
- **Provider:** Google Imagen

---

## Workflow in PublishStage

### Hero Video:
1. User clicks "Generate Video (Runway)"
2. Calls `/api/admin/insights/pipeline/generate-video`
3. API creates Runway task
4. Polls every 5 seconds for completion (max 5 minutes)
5. Returns video URL
6. Video displayed in preview

### Section Images:
1. User clicks "Generate Image" for a section
2. Calls `/api/admin/insights/pipeline/generate-image`
3. API calls Google Imagen
4. Returns base64 image as data URL
5. Image displayed in preview

---

## Alternative: Use Existing APIs

If you already have video/image generation APIs in your project, update the endpoints in `PublishStage.tsx`:

```typescript
// Line 83: Change video generation endpoint
const res = await fetch('/api/your-existing-video-endpoint', {
  // ...
});

// Line 133: Change image generation endpoint
const res = await fetch('/api/your-existing-image-endpoint', {
  // ...
});
```

---

## Notes

- **Video generation takes 30-60 seconds** - UI shows loading spinner
- **Image generation is faster** - Usually 5-10 seconds
- **Polling timeout:** 5 minutes for video generation
- **Error handling:** Shows toast notifications on failure
- **Upload alternative:** Users can always upload their own media

---

## Status

✅ API routes created
✅ Runway integration ready
✅ Imagen integration ready
⚠️ Requires API keys in `.env`
⚠️ Requires Google Project ID update in code
