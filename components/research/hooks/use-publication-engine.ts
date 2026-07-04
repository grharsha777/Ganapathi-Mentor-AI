import { useState } from 'react';
import type { DocSection, DocFormat, DocStyle } from '@/components/research/publication/publication-left-panel';
import type { StructuredResearchResponse } from '@/lib/research/schemas';
import { useResearchEngine } from '@/components/research/hooks/use-research-engine';

export function usePublicationEngine() {
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState<DocFormat>('pdf');
  const [style, setStyle] = useState<DocStyle>('academic');
  const [selectedSections, setSelectedSections] = useState<DocSection[]>(['abstract', 'introduction', 'methodology', 'conclusion']);
  const [useHighQualityOnly, setUseHighQualityOnly] = useState(true);
  const [includeUploads, setIncludeUploads] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [includeImages, setIncludeImages] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<DocSection, string | null>>({
    abstract: null,
    introduction: null,
    related_work: null,
    methodology: null,
    results: null,
    discussion: null,
    conclusion: null,
    references: null,
  });
  const [sources, setSources] = useState<StructuredResearchResponse['sources']>([]);
  const [refiningSection, setRefiningSection] = useState<DocSection | null>(null);

  // We wrap the existing research engine to power our publication generation
  const { runSearch } = useResearchEngine();

  const generateDocument = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    
    // Reset content for selected sections
    const initialContent = { ...generatedContent };
    for (const sec of selectedSections) {
      initialContent[sec] = null;
    }
    setGeneratedContent(initialContent);

    try {
      // Phase 1: Deep research to gather sources and overall synthesis
      // We use the existing engine's 'deep' mode but we don't need its UI updates directly
      // In a real app, we would have a dedicated API route for section-by-section generation
      const prompt = `Generate a ${style} document about: ${topic}. Structure required: ${selectedSections.join(', ')}`;
      await runSearch(prompt);

      // Mocking the section generation delay for the UI experience
      const newContent = { ...initialContent };
      
      for (const sec of selectedSections) {
        // Delay to simulate sequential section generation
        await new Promise(r => setTimeout(r, 1500));
        
        let content = '';
        switch(sec) {
          case 'abstract':
            content = `This document investigates ${topic}...`;
            break;
          case 'introduction':
            content = `## Introduction\n\nThe exploration of ${topic} reveals significant advancements...\n\nAs noted by recent studies, the primary challenge is complex.`;
            break;
          case 'conclusion':
            content = `## Conclusion\n\nIn summary, ${topic} presents a paradigm shift...\n\n`;
            break;
          default:
            content = `## ${sec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\nThis section contains detailed analysis regarding ${topic}, drawing from primary sources.\n\nKey findings indicate strong evidence [1] supporting the core hypothesis.`;
        }
        
        newContent[sec] = content;
        setGeneratedContent({ ...newContent });
      }
    } catch (error) {
      console.error('Publication generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const refineSection = async (section: DocSection, instructions: string) => {
    setRefiningSection(section);
    try {
      // Simulate refinement delay
      await new Promise(r => setTimeout(r, 2000));
      const current = generatedContent[section] || '';
      setGeneratedContent({
        ...generatedContent,
        [section]: current + `\n\n### Refined Addition\n\nBased on your instruction: "${instructions}", we have expanded this section to cover additional nuance.`
      });
    } finally {
      setRefiningSection(null);
    }
  };

  return {
    topic, setTopic,
    format, setFormat,
    style, setStyle,
    selectedSections, setSelectedSections,
    useHighQualityOnly, setUseHighQualityOnly,
    includeUploads, setIncludeUploads,
    uploadedUrls, setUploadedUrls,
    includeImages, setIncludeImages,
    generating,
    generatedContent,
    sources,
    generateDocument,
    refiningSection,
    refineSection,
  };
}
