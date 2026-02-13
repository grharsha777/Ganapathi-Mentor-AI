# Student API Guide: Free & Recurring Tiers

Here is the breakdown of the APIs we are integrating, prioritized by "Student Friendliness" (Free or Monthly Refresh).

## 🟢 Forever Free / Unlimited (Best for Students)
These APIs either have no cost or such high free limits that you won't hit them.

| API | Function | Pricing Model | Student Strategy |
| :--- | :--- | :--- | :--- |
| **arXiv** | Research Papers | **100% Free** | No key required. Use freely. |
| **Semantic Scholar** | Research/Citations | **Free Tier** | Key optional. Low rate limits without key, but sufficient for one user. |
| **Stack Exchange** | Code Solutions | **Free Tier** | Key optional. 300 reqs/day without key, 10k with key. **Refreshes Daily**. |
| **WikiData / Wikipedia**| Knowledge | **100% Free** | No key required. |
| **Hugging Face** | AI Models | **Free Tier** | Access to hosted inference API (limited rate) is free. |

## 🟡 Monthly Refresh (Recurring Free Tier)
These services give you a fresh batch of credits every month. Great for hackathons or demos.

| API | Function | Free Allowance | Refreshes? |
| :--- | :--- | :--- | :--- |
| **ElevenLabs** | Voice/TTS | **10,000 characters/mo** (~10 mins of audio) | ✅ **Yes, Monthly** |
| **Tavily** | AI Search | **1,000 searches/mo** | ✅ **Yes, Monthly** |
| **Vercel** | Hosting | **Hobby Tier** (Generous bandwidth/builds) | ✅ **Monthly Limits** |
| **MongoDB Atlas** | Database | **512MB Storage** | ❌ Fixed Size (doesn't "refresh" but is free forever) |
| **Google Gemini** | AI Chat | **Free via AI Studio** (up to 60 req/min) | ✅ **High Daily Limits** |

## 🔴 One-Time Free Credits (Use Wisely)
These give you `$5` or `$10` when you sign up, but once it's gone, you have to pay.

| API | Function | Free Credits | Strategy |
| :--- | :--- | :--- | :--- |
| **Together AI** | Fast LLMs | **$5.00** (lasts a long time for text) | Use for "Code Review" feature. |
| **Stability AI** | Image Gen | **~25 Credits** | Use only for "Final Polish" of project assets. |
| **OpenAI** | GPT Models | **$5.00** (expires after 3 months) | Often better to use Gemini/Together for free alternative. |

## ⚡ Recommended Setup for You
To make this app **powerful yet free**, we will use:
1.  **Research**: arXiv + Semantic Scholar (Free)
2.  **Coding**: Stack Overflow (Free) + Gemini Pro (Free API)
3.  **Voice**: ElevenLabs (Free 10k/mo)
4.  **Search**: Tavily (Free 1k/mo)

I am starting with the **Green Tier (Research & Dev)** integrations now as they require no credit card.
