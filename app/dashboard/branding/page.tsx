import { BrandingGenerator } from "@/components/dashboard/branding-generator"
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Wand2 } from 'lucide-react';

export default function BrandingPage() {
    return (
        <PageShell>
            <PageHeader
                title="AI Branding Engine"
                description="Generate production-ready names and styles for your next big idea."
                icon={Wand2}
            />
            <BrandingGenerator />
        </PageShell>
    )
}
