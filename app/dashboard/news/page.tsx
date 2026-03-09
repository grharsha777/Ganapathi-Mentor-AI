import { Suspense } from 'react';
import { Newspaper } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { NewsHub } from '@/components/news/news-hub';

export const metadata = {
    title: 'AI News Hub | Ganapathi Mentor AI',
    description: 'Stay updated with the latest real-time AI, Technology, and World news.',
};

export default function NewsPage() {
    return (
        <PageShell className="max-w-[1920px] mx-auto w-full px-2 sm:px-4 md:px-6">
            <PageHeader
                title="AI News Hub"
                description="Real-time global insights, tailored for developers and visionaries."
                icon={Newspaper}
            />

            <main className="w-full flex-1 flex flex-col pt-2 sm:pt-4">
                {/* We don't add too much padding here because the PageShell already handles outer padding,
            and the NewsHub component handles its own internal layout */}
                <NewsHub />
            </main>
        </PageShell>
    );
}
