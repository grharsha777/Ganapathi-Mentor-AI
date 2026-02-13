import { Suspense } from 'react';
import InterviewPrep from '@/components/specialized/interview-prep';
import CodeWalkthrough from '@/components/specialized/code-walkthrough';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { GraduationCap } from 'lucide-react';

export const metadata = {
    title: 'Specialized Training | Neural Code Symbiosis',
    description: 'Interview Prep and Interactive Code Walkthroughs.',
};

export default function SpecializedPage() {
    return (
        <PageShell>
            <PageHeader
                title="Advanced Training Modules"
                description="Prepare for interviews or interactively learn complex codebases."
                icon={GraduationCap}
            />

            <Tabs defaultValue="interview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6">
                    <TabsTrigger value="interview">Interview Prep</TabsTrigger>
                    <TabsTrigger value="walkthrough">Code-to-Learn</TabsTrigger>
                </TabsList>

                <TabsContent value="interview">
                    <Suspense fallback={<Skeleton className="h-[400px]" />}><InterviewPrep /></Suspense>
                </TabsContent>
                <TabsContent value="walkthrough">
                    <Suspense fallback={<Skeleton className="h-[600px]" />}><CodeWalkthrough /></Suspense>
                </TabsContent>
            </Tabs>
        </PageShell>
    );
}
