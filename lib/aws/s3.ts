/**
 * AWS S3 Asset Storage Manager
 * 
 * Handles all file storage operations for Ganapathi Mentor AI including:
 * - User-generated media (images, videos, audio)
 * - Code review snapshots and diffs
 * - Learning path resource caching
 * - Portfolio asset hosting
 * 
 * Uses presigned URLs for secure, time-limited client-side uploads.
 * 
 * @module lib/aws/s3
 * @requires @aws-sdk/client-s3
 * @requires @aws-sdk/s3-request-presigner
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'ganapathi-mentor-ai-assets';
const CDN_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN || 'd2x7k9a8f3qr1p.cloudfront.net';

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export type AssetCategory = 'media' | 'code-snapshots' | 'learning-resources' | 'portfolios' | 'avatars' | 'exports';

interface UploadOptions {
    userId: string;
    category: AssetCategory;
    fileName: string;
    contentType: string;
    metadata?: Record<string, string>;
}

interface PresignedUploadResult {
    uploadUrl: string;
    key: string;
    cdnUrl: string;
    expiresIn: number;
}

/**
 * Generate a presigned URL for direct client-side upload to S3.
 * Avoids routing large files through the Next.js API.
 */
export async function generatePresignedUpload(options: UploadOptions): Promise<PresignedUploadResult> {
    const { userId, category, fileName, contentType, metadata = {} } = options;
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${category}/${userId}/${timestamp}-${sanitizedName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        Metadata: {
            ...metadata,
            userId,
            uploadedAt: new Date().toISOString(),
            platform: 'ganapathi-mentor-ai',
        },
    });

    const expiresIn = 3600; // 1 hour
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return {
        uploadUrl,
        key,
        cdnUrl: `https://${CDN_DOMAIN}/${key}`,
        expiresIn,
    };
}

/**
 * Generate a presigned URL for secure downloads.
 * Used for private assets like code snapshots and exports.
 */
export async function generatePresignedDownload(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Upload a buffer directly from the server (used by Lambda post-processing).
 */
export async function uploadBuffer(
    key: string,
    body: Buffer | Uint8Array,
    contentType: string,
    metadata?: Record<string, string>
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
        Metadata: metadata,
    });

    await s3Client.send(command);
    return `https://${CDN_DOMAIN}/${key}`;
}

/**
 * List all assets for a user within a category.
 */
export async function listUserAssets(userId: string, category: AssetCategory): Promise<{
    key: string;
    size: number;
    lastModified: Date;
    cdnUrl: string;
}[]> {
    const prefix = `${category}/${userId}/`;

    const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: 100,
    });

    const response = await s3Client.send(command);

    return (response.Contents || []).map(obj => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date(),
        cdnUrl: `https://${CDN_DOMAIN}/${obj.Key}`,
    }));
}

/**
 * Delete an asset from S3.
 */
export async function deleteAsset(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
}

/**
 * Check if an asset exists and get its metadata.
 */
export async function getAssetMetadata(key: string): Promise<{
    exists: boolean;
    contentType?: string;
    size?: number;
    metadata?: Record<string, string>;
}> {
    try {
        const command = new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);

        return {
            exists: true,
            contentType: response.ContentType,
            size: response.ContentLength,
            metadata: response.Metadata,
        };
    } catch {
        return { exists: false };
    }
}

/**
 * Generate a CDN URL for a public asset.
 */
export function getCdnUrl(key: string): string {
    return `https://${CDN_DOMAIN}/${key}`;
}

export default s3Client;
