import { ImageStudio } from '@/components/media/image-generator'
import { VideoStudio } from '@/components/media/video-generator'
import IndicStudio from '@/components/media/indic-studio'
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Palette, Video, Languages } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StudioPage() {
    return (
        <PageShell>
            <PageHeader
                title="Media Studio"
                description="Generate high-quality image, video, and localized audio assets using Advanced AI models."
                icon={Palette}
            />

            <Tabs defaultValue="image" className="w-full">
                <div className="flex w-full justify-center mb-8">
                    <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-black/20 border border-white/10 p-1">
                        <TabsTrigger value="image" className="flex items-center gap-2 rounded-md data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 font-medium">
                            <Palette className="w-4 h-4" />
                            Image Studio
                        </TabsTrigger>
                        <TabsTrigger value="video" className="flex items-center gap-2 rounded-md data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 font-medium">
                            <Video className="w-4 h-4" />
                            Video Studio
                        </TabsTrigger>
                        <TabsTrigger value="indic" className="flex items-center gap-2 rounded-md data-[state=active]:bg-orange-600/20 data-[state=active]:text-orange-400 font-medium">
                            <Languages className="w-4 h-4" />
                            Indic Audio
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="image" className="mt-0">
                    <ImageStudio />
                </TabsContent>
                <TabsContent value="video" className="mt-0">
                    <VideoStudio />
                </TabsContent>
                <TabsContent value="indic" className="mt-0">
                    <IndicStudio />
                </TabsContent>
            </Tabs>
        </PageShell>
    )
}
