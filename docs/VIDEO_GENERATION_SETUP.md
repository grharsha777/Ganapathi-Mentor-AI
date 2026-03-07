# 🎬 Video Generation Setup Guide (No Paid Subscription Needed)

## ✅ Quick Setup (Choose One or Both)

### **Option 1: HuggingFace (Completely Free) - RECOMMENDED**

1. **Get API Key** (5 minutes):
   - Go to https://huggingface.co/settings/tokens
   - Click "New token"
   - Create token with "read" permissions
   - Copy the token

2. **Add to `.env.local`:**
   ```bash
   HUGGINGFACE_API_KEY=hf_abcdefghijklmnopqrstuvwxyz
   ```

3. **Test:**
   ```bash
   curl -X POST http://localhost:3000/api/generate-video \
     -H "Content-Type: application/json" \
     -b "token=YOUR_JWT_TOKEN" \
     -d '{"action":"generate", "text":"A developer learning AI concepts"}'
   ```

**Pros:**
- ✅ Completely free
- ✅ No subscription needed
- ✅ Models: ZeroScope, ModelScope, Stable Video Diffusion
- ✅ Fast (10-30s per video)

**Cons:**
- Medium video quality
- Needs GPU (runs on HF servers)

---

### **Option 2: RunwayML (Free Monthly Credits) - FOR QUALITY**

1. **Get Free Credits** (5 minutes):
   - Go to https://runway.com
   - Sign up (mention: "AI for Bharat Hackathon")
   - Get ~$15/month free credits
   - Go to Settings → API Keys
   - Create new API key
   - Copy token

2. **Add to `.env.local`:**
   ```bash
   RUNWAY_API_KEY=your_runway_api_key_here
   ```

3. **Test:**
   ```bash
   curl -X POST http://localhost:3000/api/generate-video \
     -H "Content-Type: application/json" \
     -b "token=YOUR_JWT_TOKEN" \
     -d '{"action":"generate", "text":"A developer learning AI concepts"}'
   ```

**Pros:**
- ✅ High-quality videos (HD)
- ✅ Modern models (Gen-3 Turbo)
- ✅ Free monthly credits
- ✅ Faster than HF

**Cons:**
- Requires free signup
- Monthly credit limit

---

## 📊 Comparison Table

| Feature | HuggingFace | RunwayML | HeyGen (Paid) |
|---------|-------------|----------|---------------|
| **Cost** | FREE | FREE ($15/mo credits) | $24+/month (subscription) |
| **Setup Time** | 5 min | 10 min | N/A |
| **Video Quality** | Medium | High | Very High |
| **Speed** | 10-30s | 20-60s | 2-5 min |
| **Models** | 3+ | 5+ | Avatars |
| **Best For** | MVP/Demo | Production | Enterprise |

---

## 🔄 Smart Failover (Auto-detection)

The system automatically:
1. **Tries RunwayML first** (highest quality)
2. **Falls back to HuggingFace** (always available, free)
3. **Errors clearly** if neither is configured

```typescript
// Frontend code (already updated)
const result = await fetch('/api/generate-video', {
  method: 'POST',
  body: JSON.stringify({
    action: 'generate',
    text: 'A concept about Python decorators'
  })
});

// Returns: { video_id, status, video_url, provider }
// provider will be "runway" or "huggingface"
```

---

## 💾 What Changed?

### **Replaced:**
- ❌ `/lib/heygen.ts` (paid service, no subscription)

### **New Files:**
- ✅ `/lib/video-generation.ts` (free/open-source multi-provider module)
- ✅ Updated `/app/api/generate-video/route.ts` (simplified API)

### **Backward Compatibility:**
- Old HeyGen code still works if you have a subscription
- New code works with free providers
- Automatic fallback system

---

## 🚀 For Hackathon Submission

### **24-Hour Milestone Update:**
Add to your "24-Hour Goal":

> **✅ Replace HeyGen with free video generation (HuggingFace + RunwayML) for cost savings and sustainability.**

### **Cost Savings:**
- **Before:** HeyGen subscription = $24/month
- **After:** HuggingFace = FREE + RunwayML credits = already available
- **Savings:** 100% (zero video generation cost)

---

## 🔗 Useful Links

| Resource | Link |
|----------|------|
| HuggingFace API | https://huggingface.co/settings/tokens |
| RunwayML API | https://runway.com/api |
| ZeroScope Model | https://huggingface.co/cerspense/zeroscope_v2_576w |
| Docs | https://huggingface.co/docs/hub/api-inference |

---

## ❓ Troubleshooting

### **"Video generation not configured"**
```bash
# Make sure you have ONE of these in .env.local:
HUGGINGFACE_API_KEY=hf_...
RUNWAY_API_KEY=rwy_...
```

### **HuggingFace timeout?**
- Free tier has rate limits
- Use RunwayML backup (if configured)
- Wait 60s before next request

### **RunwayML out of credits?**
- You get fresh credits monthly
- Use HuggingFace as fallback
- Check usage at runway.com/account/billing

---

## ✨ Next Steps

1. **Pick one provider** (or both for redundancy)
2. **Add API key to `.env.local`**
3. **Restart dev server** (`npm run dev`)
4. **Test via dashboard** → Media Studio → Video Generation
5. **Record demo video** for hackathon (use generated videos!)

---

**Questions?** Check the error response from `/api/generate-video?action=status` endpoint.
