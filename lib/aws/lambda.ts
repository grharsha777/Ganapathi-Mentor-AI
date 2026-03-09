/**
 * AWS Lambda Serverless Function Orchestrator
 * 
 * Manages invocation of Lambda functions for compute-intensive operations:
 * - Code execution sandboxing (secure code runner)
 * - AI model inference pipeline pre/post processing
 * - Batch analytics computation
 * - Media transcoding and optimization
 * - Scheduled learning path updates
 * 
 * @module lib/aws/lambda
 * @requires @aws-sdk/client-lambda
 */

import { LambdaClient, InvokeCommand, InvokeCommandInput } from '@aws-sdk/client-lambda';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const FUNCTION_PREFIX = process.env.AWS_LAMBDA_PREFIX || 'ganapathi-mentor';

const lambdaClient = new LambdaClient({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export type LambdaFunction =
    | 'code-executor'
    | 'media-processor'
    | 'analytics-aggregator'
    | 'learning-path-optimizer'
    | 'notification-dispatcher'
    | 'export-generator';

interface LambdaInvokeOptions<T = unknown> {
    functionName: LambdaFunction;
    payload: T;
    invocationType?: 'RequestResponse' | 'Event' | 'DryRun';
    timeoutOverride?: number;
}

interface LambdaResult<T = unknown> {
    statusCode: number;
    body: T;
    executedVersion: string;
    billedDurationMs: number;
    memoryUsedMB: number;
}

/**
 * Invoke a Lambda function synchronously or asynchronously.
 */
export async function invokeLambda<TPayload, TResponse>(
    options: LambdaInvokeOptions<TPayload>
): Promise<LambdaResult<TResponse>> {
    const { functionName, payload, invocationType = 'RequestResponse' } = options;

    const fullFunctionName = `${FUNCTION_PREFIX}-${functionName}`;

    const params: InvokeCommandInput = {
        FunctionName: fullFunctionName,
        InvocationType: invocationType,
        Payload: JSON.stringify(payload),
    };

    const command = new InvokeCommand(params);
    const response = await lambdaClient.send(command);

    const responsePayload = response.Payload
        ? JSON.parse(new TextDecoder().decode(response.Payload))
        : null;

    return {
        statusCode: response.StatusCode || 200,
        body: responsePayload as TResponse,
        executedVersion: response.ExecutedVersion || '$LATEST',
        billedDurationMs: 0,
        memoryUsedMB: 0,
    };
}

// ─── Specialized Lambda Invocations ──────────────────────────────

/**
 * Execute user-submitted code in a sandboxed Lambda environment.
 * Supports Node.js, Python, Java, C++, and Go.
 */
export async function executeCodeSandbox(params: {
    code: string;
    language: 'javascript' | 'python' | 'java' | 'cpp' | 'go';
    stdin?: string;
    timeoutMs?: number;
    memoryMB?: number;
}): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
    executionTimeMs: number;
    memoryUsedKB: number;
}> {
    const result = await invokeLambda<typeof params, {
        stdout: string;
        stderr: string;
        exitCode: number;
        executionTimeMs: number;
        memoryUsedKB: number;
    }>({
        functionName: 'code-executor',
        payload: {
            ...params,
            timeoutMs: params.timeoutMs || 10000,
            memoryMB: params.memoryMB || 256,
        },
    });

    return result.body;
}

/**
 * Process and optimize media files (images, videos, audio).
 * Triggered after S3 upload to generate thumbnails, transcode video, etc.
 */
export async function processMedia(params: {
    s3Key: string;
    operations: ('thumbnail' | 'compress' | 'transcode' | 'watermark')[];
    outputFormat?: string;
}): Promise<{
    processedKeys: string[];
    originalSize: number;
    processedSize: number;
}> {
    const result = await invokeLambda<typeof params, {
        processedKeys: string[];
        originalSize: number;
        processedSize: number;
    }>({
        functionName: 'media-processor',
        payload: params,
    });

    return result.body;
}

/**
 * Aggregate analytics data for user dashboards.
 * Runs on a schedule via EventBridge or on-demand.
 */
export async function aggregateAnalytics(params: {
    userId: string;
    dateRange: { start: string; end: string };
    metrics: ('coding_time' | 'challenges_solved' | 'review_count' | 'learning_progress')[];
}): Promise<{
    aggregatedMetrics: Record<string, number>;
    trends: Record<string, number[]>;
    insights: string[];
}> {
    const result = await invokeLambda<typeof params, {
        aggregatedMetrics: Record<string, number>;
        trends: Record<string, number[]>;
        insights: string[];
    }>({
        functionName: 'analytics-aggregator',
        payload: params,
    });

    return result.body;
}

/**
 * Optimize and update AI-generated learning paths.
 * Recalculates recommended sessions based on user progress.
 */
export async function optimizeLearningPath(params: {
    userId: string;
    pathId: string;
    completedSessions: string[];
    assessmentScores: Record<string, number>;
}): Promise<{
    updatedPath: unknown;
    recommendations: string[];
    estimatedCompletionDays: number;
}> {
    const result = await invokeLambda<typeof params, {
        updatedPath: unknown;
        recommendations: string[];
        estimatedCompletionDays: number;
    }>({
        functionName: 'learning-path-optimizer',
        payload: params,
    });

    return result.body;
}

/**
 * Generate exportable reports (PDF, CSV) for user data.
 */
export async function generateExport(params: {
    userId: string;
    exportType: 'portfolio-pdf' | 'analytics-csv' | 'learning-report' | 'code-review-summary';
    dateRange?: { start: string; end: string };
}): Promise<{
    s3Key: string;
    downloadUrl: string;
    fileSizeBytes: number;
}> {
    const result = await invokeLambda<typeof params, {
        s3Key: string;
        downloadUrl: string;
        fileSizeBytes: number;
    }>({
        functionName: 'export-generator',
        payload: params,
    });

    return result.body;
}

export default lambdaClient;
