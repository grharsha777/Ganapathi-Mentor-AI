import { ImageStudio } from '@/components/media/image-generator'
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Palette } from 'lucide-react';

export default function StudioPage() {
    return (
        <PageShell>
            <PageHeader
                title="Media Studio"
                description="Generate high-quality assets using AI."
                icon={Palette}
            />
            <ImageStudio />
        </PageShell>
    )
}
