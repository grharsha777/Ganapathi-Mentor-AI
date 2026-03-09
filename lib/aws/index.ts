/**
 * AWS Service Layer - Barrel Export
 * 
 * Unified entry point for all AWS integrations used by Ganapathi Mentor AI.
 * 
 * Usage:
 * ```typescript
 * import { bedrock, s3, lambda, config } from '@/lib/aws';
 * 
 * // AI inference via Bedrock
 * const result = await bedrock.invokeBedrockModel({ model: '...', prompt: '...' });
 * 
 * // Asset upload via S3
 * const upload = await s3.generatePresignedUpload({ userId, category: 'media', ... });
 * 
 * // Code execution via Lambda
 * const output = await lambda.executeCodeSandbox({ code, language: 'python' });
 * ```
 */

export * as bedrock from './bedrock';
export * as s3 from './s3';
export * as lambda from './lambda';
export { AWS_CONFIG, validateAWSConfig, getLambdaArn, getS3Arn } from './config';
