import { HfInference } from "@huggingface/inference";
import { SignJWT } from "jose";

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;
const KLING_ACCESS_KEY = process.env.KLING_ACCESS_KEY;
const KLING_SECRET_KEY = process.env.KLING_SECRET_KEY;

export interface VideoGenerationOptions {
  text: string;
  style?: "shortform" | "tutorial" | "presentation" | "cinematic" | "anime";
  width?: number;
  height?: number;
  durationSeconds?: number;
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  provider?: "huggingface" | "runway" | "kling";
}

export interface VideoGenerationResult {
  videoUrl?: string;
  videoId: string;
  provider: "huggingface" | "runway" | "kling" | "aws";
  status: "completed" | "processing" | "failed";
  duration?: number;
}

// ============================================================
// Kling AI: Advanced Text-to-Video (using provided keys)
// ============================================================
async function createKlingJWT() {
  if (!KLING_ACCESS_KEY || !KLING_SECRET_KEY) return null;

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 1800; // 30 mins

  const secret = new TextEncoder().encode(KLING_SECRET_KEY);

  const nbf = iat - 5; // 5-second buffer for clock skew

  const token = await new SignJWT({
    iss: KLING_ACCESS_KEY,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(iat)
    .setNotBefore(nbf)
    .setExpirationTime(exp)
    .sign(secret);

  return token;
}

export async function generateVideoKling(
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  const token = await createKlingJWT();
  if (!token) throw new Error("Kling keys not configured");

  try {
    const response = await fetch("https://api.klingai.com/v1/videos/text2video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_name: "kling-v1",
        prompt: options.text,
        cfg_scale: 0.5,
        mode: "std",
        aspect_ratio: options.aspect_ratio || "16:9",
        duration: String(options.durationSeconds || 5),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Kling API Error: ${err}`);
    }

    const data = await response.json();
    return {
      videoId: data.data?.task_id || data.id,
      provider: "kling",
      status: "processing",
    };
  } catch (error: any) {
    console.error("Kling generation failed:", error);
    throw error;
  }
}

// ============================================================
// RunwayML: Gen-4 Turbo (latest available model)
// ============================================================
export async function generateVideoRunway(
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  if (!RUNWAY_API_KEY) throw new Error("Runway key not configured");

  try {
    const response = await fetch("https://api.dev.runwayml.com/v1/text_to_video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen4_turbo",
        promptText: options.text,
        ratio: options.aspect_ratio === "9:16" ? "720:1280" : options.aspect_ratio === "1:1" ? "720:720" : "1280:720",
        duration: options.durationSeconds || 5,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Runway API Error: ${err}`);
    }

    const data = await response.json();
    return {
      videoId: data.id,
      provider: "runway",
      status: "processing",
    };
  } catch (error: any) {
    console.error("Runway generation failed:", error);
    throw error;
  }
}

// ============================================================
// HuggingFace Wan-AI 2.1 (Open-Source)
// ============================================================
export async function generateVideoHuggingFace(
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  if (!HF_API_KEY) throw new Error("HF key not configured");

  const hf = new HfInference(HF_API_KEY);

  try {
    const videoBlob = (await hf.textToVideo({
      model: "Wan-AI/Wan2.1-T2V-14B",
      inputs: options.text,
    })) as Blob;

    const videoUrl = await uploadVideoToS3(
      videoBlob,
      `generated-videos/${Date.now()}.mp4`
    );

    return {
      videoUrl,
      videoId: `hf-${Date.now()}`,
      provider: "huggingface",
      status: "completed",
    };
  } catch (error: any) {
    console.error("HuggingFace failed:", error);
    throw error;
  }
}

// ============================================================
// Smart Router & Status Polling
// ============================================================
export async function generateVideo(
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  if (options.provider === "kling") return await generateVideoKling(options);
  if (options.provider === "runway") return await generateVideoRunway(options);
  if (options.provider === "huggingface") return await generateVideoHuggingFace(options);

  // Default dynamic routing
  if (KLING_ACCESS_KEY) return await generateVideoKling(options);
  if (RUNWAY_API_KEY) return await generateVideoRunway(options);
  if (HF_API_KEY) return await generateVideoHuggingFace(options);

  throw new Error("No video provider configured");
}

export async function checkVideoStatus(
  videoId: string,
  provider: string
): Promise<VideoGenerationResult> {
  if (provider === "kling") {
    const token = await createKlingJWT();
    const res = await fetch(`https://api.klingai.com/v1/videos/task/${videoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const task = data.data;
    return {
      videoId,
      provider: "kling",
      status: task?.task_status === "SUCCEEDED" ? "completed" : task?.task_status === "FAILED" ? "failed" : "processing",
      videoUrl: task?.video_url,
    };
  }

  if (provider === "runway") {
    const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${videoId}`, {
      headers: {
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-11-06"
      },
    });
    const data = await res.json();
    return {
      videoId,
      provider: "runway",
      status: data.status === "SUCCEEDED" ? "completed" : data.status === "FAILED" ? "failed" : "processing",
      videoUrl: data.output?.[0],
    };
  }

  return { videoId, provider: provider as any, status: "completed" };
}

async function uploadVideoToS3(blob: Blob, key: string): Promise<string> {
  console.log(`Uploading: ${key}`);
  return `https://ganapathi-videos.s3.amazonaws.com/${key}`;
}

export function isVideoGenerationConfigured(): boolean {
  return !!(HF_API_KEY || RUNWAY_API_KEY || KLING_ACCESS_KEY);
}

export function getVideoProvider(): string {
  if (KLING_ACCESS_KEY) return "kling";
  if (RUNWAY_API_KEY) return "runway";
  if (HF_API_KEY) return "huggingface";
  return "none";
}
