'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import { PublicationLeftPanel } from './publication-left-panel';
import { PublicationDocumentPreview } from './publication-document-preview';
import { PublicationSourcesPanel } from './publication-sources-panel';
import { usePublicationEngine } from '@/components/research/hooks/use-publication-engine';

export function PublicationWorkspace() {
  const engine = usePublicationEngine();

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Controls Panel */}
        <ResizablePanel defaultSize={22} minSize={20} maxSize={30}>
          <div className="h-full p-4">
            <PublicationLeftPanel
              topic={engine.topic}
              setTopic={engine.setTopic}
              format={engine.format}
              setFormat={engine.setFormat}
              style={engine.style}
              setStyle={engine.setStyle}
              selectedSections={engine.selectedSections}
              setSelectedSections={engine.setSelectedSections}
              useHighQualityOnly={engine.useHighQualityOnly}
              setUseHighQualityOnly={engine.setUseHighQualityOnly}
              includeUploads={engine.includeUploads}
              setIncludeUploads={engine.setIncludeUploads}
              uploadedUrls={engine.uploadedUrls}
              setUploadedUrls={engine.setUploadedUrls}
              includeImages={engine.includeImages}
              setIncludeImages={engine.setIncludeImages}
              onGenerate={engine.generateDocument}
              generating={engine.generating}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-white/5 hover:bg-teal-500/50 transition-colors" />

        {/* Center Document Preview */}
        <ResizablePanel defaultSize={56} minSize={40}>
          <div className="h-full p-4">
            <PublicationDocumentPreview
              sections={engine.selectedSections}
              generatedContent={engine.generatedContent}
              format={engine.format}
              generating={engine.generating}
              onRefine={engine.refineSection}
              refiningSection={engine.refiningSection}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-white/5 hover:bg-teal-500/50 transition-colors" />

        {/* Right Sources Panel */}
        <ResizablePanel defaultSize={22} minSize={15} maxSize={30}>
          <PublicationSourcesPanel sources={engine.sources} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
