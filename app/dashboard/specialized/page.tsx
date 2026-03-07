'use client';

import { Suspense } from 'react';
import InterviewSimulator from '@/components/specialized/interview-simulator';
import CodeWalkthrough from '@/components/specialized/code-walkthrough';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { Bot, Code2 } from 'lucide-react';

export default function SpecializedPage() {
    return (
        <PageShell>
            <Tabs defaultValue="interview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6">
                    <TabsTrigger value="interview" className="gap-2">
                        <Bot className="w-4 h-4" />
                        Interview Sim
                    </TabsTrigger>
                    <TabsTrigger value="walkthrough" className="gap-2">
                        <Code2 className="w-4 h-4" />
                        Code-to-Learn
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="interview">
                    <Suspense fallback={<Skeleton className="h-[600px] rounded-2xl" />}>
                        <InterviewSimulator />
                    </Suspense>
                </TabsContent>
                <TabsContent value="walkthrough">
                    <Suspense fallback={<Skeleton className="h-[600px] rounded-2xl" />}>
                        <CodeWalkthrough />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </PageShell>
    );
}
