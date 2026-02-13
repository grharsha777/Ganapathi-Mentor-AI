import { VoiceStudio } from '@/components/last-minute/voice-studio'
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Mic } from 'lucide-react';

export default function VoiceStudioPage() {
    return (
        <PageShell>
            <PageHeader
                title="Voice Studio"
                description="Practice your pitch and communication skills."
                icon={Mic}
            />
            <VoiceStudio />
        </PageShell>
    )
}
