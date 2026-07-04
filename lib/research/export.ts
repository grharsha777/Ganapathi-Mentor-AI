import React from 'react';
import type { StructuredResearchResponse } from '@/lib/research/schemas';

let jsPdfModulePromise: Promise<typeof import('jspdf')> | null = null;

async function loadJsPdf() {
  jsPdfModulePromise ??= import('jspdf');
  return jsPdfModulePromise;
}

function wrapText(text: string, width = 90): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    if ((line + word).length > width) {
      lines.push(line.trim());
      line = `${word} `;
    } else {
      line += `${word} `;
    }
  }

  if (line.trim()) {
    lines.push(line.trim());
  }

  return lines;
}

/**
 * Strips leftover raw HTML/escape artifacts that can appear in AI-generated content
 * and ensures the text is clean plain-markdown safe.
 */
function cleanMarkdownText(text: string): string {
  return text
    // Remove HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function buildMarkdownReport(query: string, answer: StructuredResearchResponse): string {
  const hr = '\n---\n';

  const sections = answer.answer_sections
    .map((section, idx) => {
      const points = section.key_points.map((point) => `- ${cleanMarkdownText(point)}`).join('\n');
      const citations =
        section.citations.length
          ? `> **Sources:** ${section.citations.map((id) => `[${id}]`).join(' ')}`
          : '';

      const evidenceBadge = section.evidence_strength === 'strong' ? '🟢' : section.evidence_strength === 'moderate' ? '🟡' : '🔴';

      return [
        `## ${idx + 1}. ${section.heading}`,
        '',
        `> ${evidenceBadge} *Evidence Strength: **${section.evidence_strength}***`,
        '',
        cleanMarkdownText(section.content),
        '',
        ...(points ? ['**Key Points:**', '', points, ''] : []),
        ...(citations ? [citations, ''] : []),
      ].join('\n');
    })
    .join('\n' + hr + '\n');

  const claims = answer.key_claims
    .map((claim) => {
      const verdict = claim.verdict === 'supported' ? '✅ Supported' : claim.verdict === 'mixed' ? '⚠️ Mixed' : '❌ Insufficient';
      const cites = claim.citations.length ? ` (${claim.citations.map((id) => `[${id}]`).join(' ')})` : '';
      return [`- **${verdict}** — ${cleanMarkdownText(claim.claim)}${cites}`, `  > *${cleanMarkdownText(claim.rationale)}*`].join('\n');
    })
    .join('\n');

  const dataPoints = answer.data_points
    .map((dp) => `| ${dp.label} | **${dp.value}** | ${dp.context} |`)
    .join('\n');

  const sources = answer.sources
    .map((source) => `${source.id}. [${source.title}](${source.url}) *(${source.domain})*`)
    .join('\n');

  const bibliography = answer.bibliography
    .map((entry) => `[${entry.source_id}] ${cleanMarkdownText(entry.citation)}`)
    .join('\n');

  const gaps = answer.research_gaps.map((gap) => `- ${cleanMarkdownText(gap)}`).join('\n');

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return [
    `# ${answer.publication.title || `Research Report: ${query}`}`,
    '',
    `*Generated on ${date} by Ganapathi Mentor AI*`,
    '',
    hr,
    '',
    '## Abstract / Executive TL;DR',
    '',
    `> ${cleanMarkdownText(answer.tldr)}`,
    '',
    hr,
    '',
    '## Introduction & Methodology',
    '',
    cleanMarkdownText(answer.methodology_summary),
    '',
    ...(dataPoints
      ? [
          '',
          '| Metric | Value | Context |',
          '| --- | --- | --- |',
          dataPoints,
          '',
        ]
      : []),
    hr,
    '',
    '## Fact-Checked Claims',
    '',
    claims || '- No claims verified.',
    '',
    hr,
    '',
    '## Key Findings & Evidence Synthesis',
    '',
    sections,
    '',
    hr,
    '',
    '## Research Gaps & Future Directions',
    '',
    gaps || '- None identified.',
    '',
    hr,
    '',
    '## References',
    '',
    sources,
    '',
    '## Bibliography',
    '',
    bibliography || '- None.',
  ].join('\n');
}

export function buildRichTextReport(query: string, answer: StructuredResearchResponse): string {
  const sectionHtml = answer.answer_sections
    .map(
      (section, idx) => {
        const evidenceColor = section.evidence_strength === 'strong' ? '#059669' : section.evidence_strength === 'moderate' ? '#d97706' : '#dc2626';
        const pointsHtml = section.key_points.map((point) => `<li style="margin-bottom:6px;">${point}</li>`).join('');
        const citationsHtml = section.citations.length
          ? `<p style="font-size:12px;color:#6b7280;margin-top:8px;"><strong>Sources:</strong> ${section.citations.map((id) => `[${id}]`).join(' ')}</p>`
          : '';
        return `
          <section style="margin-bottom:32px;">
            <h2 style="font-size:18px;font-weight:700;color:#1e293b;margin:0 0 8px;">${idx + 1}. ${section.heading}</h2>
            <span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${evidenceColor}22;color:${evidenceColor};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">${section.evidence_strength} evidence</span>
            <p style="font-size:14px;line-height:1.8;color:#374151;text-align:justify;margin:0 0 12px;">${section.content}</p>
            ${pointsHtml ? `<ul style="padding-left:20px;margin:0 0 12px;">${pointsHtml}</ul>` : ''}
            ${citationsHtml}
            <hr style="border:none;border-top:1px solid #f1f5f9;margin-top:16px;" />
          </section>
        `;
      }
    )
    .join('');

  const claimHtml = answer.key_claims
    .map((claim) => {
      const verdictColor = claim.verdict === 'supported' ? '#059669' : claim.verdict === 'mixed' ? '#d97706' : '#dc2626';
      const cites = claim.citations.length ? ` <span style="color:#6b7280;">(${claim.citations.map((id) => `[${id}]`).join(' ')})</span>` : '';
      return `
        <li style="margin-bottom:12px;">
          <strong style="color:${verdictColor};text-transform:uppercase;font-size:11px;">${claim.verdict}</strong>
          &nbsp;&mdash;&nbsp;
          <span style="color:#1e293b;">${claim.claim}</span>${cites}
          <p style="color:#6b7280;font-size:13px;margin:4px 0 0 0;font-style:italic;">${claim.rationale}</p>
        </li>
      `;
    })
    .join('');

  const sourceHtml = answer.sources
    .map((source) => `<li style="margin-bottom:6px;"><a href="${source.url}" style="color:#2563eb;">[${source.id}] ${source.title}</a></li>`)
    .join('');

  const gapsHtml = answer.research_gaps
    .map((gap) => `<li style="margin-bottom:6px;color:#92400e;">${gap}</li>`)
    .join('');

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px 20px;background:#fff;color:#1e293b;">
  <header style="border-bottom:3px solid #0f172a;padding-bottom:24px;margin-bottom:32px;">
    <h1 style="font-size:26px;font-weight:700;margin:0 0 8px;line-height:1.3;">${answer.publication.title || query}</h1>
    <p style="font-size:12px;color:#64748b;margin:0;">Generated on ${date} &middot; Ganapathi Mentor AI</p>
  </header>

  <section style="background:#f0fdf4;border-left:4px solid #059669;padding:16px 20px;border-radius:4px;margin-bottom:32px;">
    <h2 style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#059669;margin:0 0 8px;">Abstract / Executive TL;DR</h2>
    <p style="font-size:15px;line-height:1.8;margin:0;text-align:justify;">${answer.tldr}</p>
  </section>

  <section style="margin-bottom:32px;">
    <h2 style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#475569;margin:0 0 12px;">Introduction &amp; Methodology</h2>
    <p style="font-size:14px;line-height:1.8;margin:0;text-align:justify;">${answer.methodology_summary}</p>
  </section>

  <section style="margin-bottom:32px;">
    <h2 style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#475569;margin:0 0 12px;">Fact-Checked Claims</h2>
    <ul style="padding-left:20px;">${claimHtml || '<li>No claims verified.</li>'}</ul>
  </section>

  <section style="margin-bottom:32px;">
    <h2 style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#475569;margin:0 0 24px;">Key Findings &amp; Evidence Synthesis</h2>
    ${sectionHtml}
  </section>

  <section style="background:#fffbeb;border-left:4px solid #d97706;padding:16px 20px;border-radius:4px;margin-bottom:32px;">
    <h2 style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#d97706;margin:0 0 12px;">Research Gaps &amp; Future Directions</h2>
    <ul style="padding-left:20px;">${gapsHtml || '<li>None identified.</li>'}</ul>
  </section>

  <section>
    <h2 style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#475569;margin:0 0 12px;">References</h2>
    <ol style="padding-left:20px;">${sourceHtml}</ol>
  </section>
</body>
</html>`;
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

// Dynamic imports moved inside function

export async function exportResearchPdf(
  query: string,
  answer: StructuredResearchResponse,
): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer');
  const { PublicationDocument } = await import('@/components/research/pdf/publication-document');

  const date = new Date().toLocaleDateString();
  const doc = React.createElement(PublicationDocument, { query, answer, date });
  const blob = await pdf(doc as any).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  
  const safeName = query.slice(0, 50).replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  anchor.download = `${safeName || 'research-report'}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportCollectionPdf(
  name: string,
  items: any[],
): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer');
  const { CollectionDocument } = await import('@/components/research/pdf/collection-document');

  const doc = React.createElement(CollectionDocument, { name, items });
  const blob = await pdf(doc as any).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  
  const safeName = name.slice(0, 50).replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  anchor.download = `${safeName || 'collection'}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildAnswerPlainText(answer: StructuredResearchResponse): string {
  const parts = [answer.tldr, ...answer.answer_sections.map((section) => section.content)];
  return wrapText(parts.join(' '), 100).join(' ');
}
