import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import type { StructuredResearchResponse } from '@/lib/research/schemas';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ],
});

Font.register({
  family: 'Lora',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/lora/v32/0QI6MX1D_JOuGQbT0gvTJPa787weuxJBkqg.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/lora/v32/0QI6MX1D_JOuGQbT0gvTJPa787z5vBJBkqg.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/lora/v32/0QI6MX1D_JOuGQbT0gvTJPa787z5vBJBkqg.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 72, // 1 inch
    fontFamily: 'Lora',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 40,
    borderBottom: '1pt solid #e2e8f0',
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  h2: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 600,
    color: '#0f172a',
    marginTop: 20,
    marginBottom: 12,
  },
  h3: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
  },
  abstractBox: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 4,
    marginBottom: 30,
    borderLeft: '4pt solid #0ea5e9',
  },
  abstractTitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
  },
  bullet: {
    width: 15,
    fontSize: 12,
  },
  listItemContent: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 72,
    right: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1pt solid #e2e8f0',
    paddingTop: 10,
  },
  watermark: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#94a3b8',
  },
  pageNumber: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#94a3b8',
  },
  citation: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 6,
    lineHeight: 1.4,
  },
  link: {
    color: '#0284c7',
    textDecoration: 'none',
  },
  claimBox: {
    border: '1pt solid #e2e8f0',
    padding: 12,
    marginBottom: 12,
    borderRadius: 4,
  },
  claimVerdict: {
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
});

interface PublicationDocumentProps {
  query: string;
  answer: StructuredResearchResponse;
  date: string;
}

// Simple pre-processor for LaTeX math formulas like $x^2$ or $$x^2$$
const formatMathText = (text: string) => {
  return text
    .replace(/\$\$(.*?)\$\$/g, '$1') // Strip block math tags
    .replace(/\$(.*?)\$/g, '$1') // Strip inline math tags
    .replace(/\\_/g, '_')
    .replace(/\\%/g, '%')
    .replace(/\\mu/g, 'μ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\theta/g, 'θ');
};

export const sanitizeHtml = (text: string) => {
  return formatMathText(
    text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]*>?/gm, '') // Strip HTML tags
      .replace(/Toggle table of contents/gi, '')
      .replace(/View history/gi, '')
  );
};

export function PublicationDocument({ query, answer, date }: PublicationDocumentProps) {
  return (
    <Document title={query} author="Ganapathi Mentor AI">
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{query}</Text>
          <Text style={styles.subtitle}>Research Brief • {date} • Confidence: {Math.round(answer.confidence)}%</Text>
        </View>

        {/* Abstract */}
        <View style={styles.abstractBox}>
          <Text style={styles.abstractTitle}>Abstract / TL;DR</Text>
          <Text style={styles.paragraph}>{sanitizeHtml(answer.tldr)}</Text>
          
          <Text style={[styles.abstractTitle, { marginTop: 12 }]}>Methodology Summary</Text>
          <Text style={styles.paragraph}>{sanitizeHtml(answer.methodology_summary)}</Text>
        </View>

        {/* Key Findings */}
        <View style={styles.section}>
          <Text style={styles.h2}>Key Fact-Checked Claims</Text>
          {answer.key_claims.map((claim, idx) => (
            <View key={idx} style={styles.claimBox}>
              <Text style={[styles.claimVerdict, { color: claim.verdict === 'supported' ? '#059669' : claim.verdict === 'mixed' ? '#d97706' : '#dc2626' }]}>
                {claim.verdict}
              </Text>
              <Text style={styles.paragraph}>{sanitizeHtml(claim.claim)}</Text>
              {claim.rationale && <Text style={{ fontSize: 10, color: '#64748b' }}>Rationale: {sanitizeHtml(claim.rationale)}</Text>}
              <Text style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>
                Sources: {claim.citations.map(c => `[${c}]`).join(', ')}
              </Text>
            </View>
          ))}
        </View>

        {/* Main Sections */}
        {answer.answer_sections.map((section, idx) => (
          <View key={idx} style={styles.section} break={idx > 0 && idx % 2 === 0}>
            <Text style={styles.h2}>{section.heading}</Text>
            <Text style={styles.paragraph}>{sanitizeHtml(section.content)}</Text>
            
            <Text style={styles.h3}>Key Points</Text>
            {section.key_points.map((point, pIdx) => (
              <View key={pIdx} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listItemContent}>{sanitizeHtml(point)}</Text>
              </View>
            ))}
            
            <Text style={{ fontSize: 9, color: '#94a3b8', marginTop: 8, fontStyle: 'italic' }}>
              Evidence Strength: {section.evidence_strength} | Citations: {section.citations.map(c => `[${c}]`).join(', ')}
            </Text>
          </View>
        ))}

        {/* Bibliography */}
        <View style={styles.section} break>
          <Text style={styles.h2}>Bibliography & References</Text>
          {answer.sources.map((source, idx) => {
            let domain = source.domain;
            if (!domain && source.url) {
              try {
                domain = new URL(source.url).hostname.replace('www.', '');
              } catch (e) {
                domain = 'Unknown';
              }
            }
            return (
              <View key={idx} style={{ marginBottom: 12 }}>
                <Text style={styles.citation}>
                  [{source.id}] <Link src={source.url} style={styles.link}>"{sanitizeHtml(source.title)}"</Link>. {domain}. {source.published_date !== 'Unknown' ? source.published_date : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Research Gaps */}
        {answer.research_gaps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.h2}>Identified Research Gaps</Text>
            {answer.research_gaps.map((gap, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listItemContent}>{sanitizeHtml(gap)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Dynamic Footer for Watermark and Pagination */}
        <View style={styles.footer} fixed>
          <Text style={styles.watermark}>Generated by Ganapathi Mentor AI</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} />
        </View>

      </Page>
    </Document>
  );
}
