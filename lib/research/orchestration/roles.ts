export const AGENT_ROLES = [
  'query_understanding',
  'planning',
  'web_research',
  'news_research',
  'academic_papers',
  'code_analysis',
  'evidence_ranking',
  'fact_checking',
  'synthesis',
  'citation',
  'publication',
  'pdf_export',
  'memory_history',
  'ui_presentation',
] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];

export const ROLE_LABELS: Record<AgentRole, string> = {
  query_understanding: 'Query Understanding',
  planning: 'Planning',
  web_research: 'Web Research',
  news_research: 'News',
  academic_papers: 'Academic Papers',
  code_analysis: 'Code Analysis',
  evidence_ranking: 'Evidence Ranking',
  fact_checking: 'Fact Checking',
  synthesis: 'Synthesis',
  citation: 'Citation',
  publication: 'Publication',
  pdf_export: 'PDF Export',
  memory_history: 'Memory/History',
  ui_presentation: 'UI Presentation',
};
