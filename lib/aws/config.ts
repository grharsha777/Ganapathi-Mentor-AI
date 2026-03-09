/**
 * AWS Infrastructure Configuration
 * 
 * Centralized configuration for all AWS services used by Ganapathi Mentor AI.
 * Manages region selection, service endpoints, retry policies, and credential resolution.
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────────┐
 * │                  Ganapathi Mentor AI                 │
 * ├──────────┬──────────┬──────────┬────────────────────┤
 * │ Bedrock  │    S3    │  Lambda  │   CloudFront       │
 * │ (AI/ML)  │ (Assets) │ (Compute)│   (CDN)            │
 * ├──────────┴──────────┴──────────┴────────────────────┤
 * │              IAM Role: ganapathi-mentor-prod         │
 * │              Region: ap-south-1 (Mumbai)             │
 * │              Account: 891376XXXXXX                   │
 * └─────────────────────────────────────────────────────┘
 * 
 * @module lib/aws/config
 */

export const AWS_CONFIG = {
    region: process.env.AWS_REGION || 'ap-south-1',
    accountId: process.env.AWS_ACCOUNT_ID || '',

    // ─── Bedrock (AI Inference) ──────────────────────────────
    bedrock: {
        region: 'us-east-1', // Bedrock availability
        defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        fallbackModel: 'anthropic.claude-3-haiku-20240307-v1:0',
        maxTokens: 4096,
        temperature: 0.7,
        rateLimits: {
            requestsPerMinute: 60,
            tokensPerMinute: 100000,
        },
    },

    // ─── S3 (Object Storage) ─────────────────────────────────
    s3: {
        bucketName: process.env.AWS_S3_BUCKET || 'ganapathi-mentor-ai-assets',
        cdnDomain: process.env.AWS_CLOUDFRONT_DOMAIN || 'd2x7k9a8f3qr1p.cloudfront.net',
        maxUploadSizeMB: 50,
        allowedMimeTypes: [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
            'video/mp4', 'video/webm',
            'audio/mpeg', 'audio/wav', 'audio/ogg',
            'application/pdf',
            'text/plain', 'text/markdown',
            'application/json',
        ],
        lifecycle: {
            tempFilesExpireDays: 7,
            archiveAfterDays: 90,
        },
    },

    // ─── Lambda (Serverless Compute) ─────────────────────────
    lambda: {
        functionPrefix: process.env.AWS_LAMBDA_PREFIX || 'ganapathi-mentor',
        functions: {
            'code-executor': {
                memoryMB: 512,
                timeoutSeconds: 30,
                runtime: 'nodejs20.x',
                description: 'Sandboxed code execution for challenges and code review',
            },
            'media-processor': {
                memoryMB: 1024,
                timeoutSeconds: 120,
                runtime: 'nodejs20.x',
                description: 'Image/video processing, thumbnailing, and transcoding',
            },
            'analytics-aggregator': {
                memoryMB: 256,
                timeoutSeconds: 60,
                runtime: 'nodejs20.x',
                description: 'User analytics and metric aggregation pipeline',
            },
            'learning-path-optimizer': {
                memoryMB: 512,
                timeoutSeconds: 45,
                runtime: 'python3.12',
                description: 'ML-based learning path optimization and recommendations',
            },
            'notification-dispatcher': {
                memoryMB: 128,
                timeoutSeconds: 15,
                runtime: 'nodejs20.x',
                description: 'Multi-channel notification delivery (email, push, in-app)',
            },
            'export-generator': {
                memoryMB: 1024,
                timeoutSeconds: 120,
                runtime: 'nodejs20.x',
                description: 'PDF/CSV report generation for portfolios and analytics',
            },
        },
    },

    // ─── CloudFront (CDN) ────────────────────────────────────
    cloudfront: {
        distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID || '',
        domain: process.env.AWS_CLOUDFRONT_DOMAIN || 'd2x7k9a8f3qr1p.cloudfront.net',
        origins: {
            s3: 'ganapathi-mentor-ai-assets.s3.ap-south-1.amazonaws.com',
            api: 'ganapathi-mentor-ai.vercel.app',
        },
        cachePolicies: {
            static: {
                defaultTTL: 86400 * 30,   // 30 days
                maxTTL: 86400 * 365,      // 1 year
                compress: true,
            },
            dynamic: {
                defaultTTL: 0,
                maxTTL: 3600,
                compress: true,
            },
        },
    },

    // ─── DynamoDB (Session Cache) ────────────────────────────
    dynamodb: {
        tableName: process.env.AWS_DYNAMODB_TABLE || 'ganapathi-mentor-sessions',
        ttlAttribute: 'expiresAt',
        readCapacity: 25,
        writeCapacity: 10,
    },

    // ─── SQS (Message Queue) ────────────────────────────────
    sqs: {
        queues: {
            codeReview: process.env.AWS_SQS_CODE_REVIEW_QUEUE || 'ganapathi-code-review-queue',
            notifications: process.env.AWS_SQS_NOTIFICATIONS_QUEUE || 'ganapathi-notifications-queue',
            analytics: process.env.AWS_SQS_ANALYTICS_QUEUE || 'ganapathi-analytics-queue',
        },
        batchSize: 10,
        visibilityTimeout: 60,
    },

    // ─── CloudWatch (Monitoring) ─────────────────────────────
    cloudwatch: {
        namespace: 'GanapathiMentorAI',
        logGroups: {
            api: '/ganapathi-mentor/api',
            lambda: '/ganapathi-mentor/lambda',
            bedrock: '/ganapathi-mentor/bedrock',
        },
        alarms: {
            errorRateThreshold: 5,     // percent
            latencyThresholdMs: 3000,
            invocationThreshold: 1000, // per hour
        },
    },
} as const;

/**
 * Get the full ARN for a Lambda function.
 */
export function getLambdaArn(functionName: string): string {
    return `arn:aws:lambda:${AWS_CONFIG.region}:${AWS_CONFIG.accountId}:function:${AWS_CONFIG.lambda.functionPrefix}-${functionName}`;
}

/**
 * Get the full ARN for an S3 bucket path.
 */
export function getS3Arn(key?: string): string {
    return key
        ? `arn:aws:s3:::${AWS_CONFIG.s3.bucketName}/${key}`
        : `arn:aws:s3:::${AWS_CONFIG.s3.bucketName}`;
}

/**
 * Validate that all required AWS environment variables are set.
 */
export function validateAWSConfig(): { valid: boolean; missing: string[] } {
    const required = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_REGION',
    ];

    const missing = required.filter(key => !process.env[key]);

    return {
        valid: missing.length === 0,
        missing,
    };
}

export default AWS_CONFIG;
