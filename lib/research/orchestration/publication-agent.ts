import type { StructuredResearchResponse } from '@/lib/research/schemas';

import type { PublicationViewModel } from '@/lib/research/orchestration/types';

export function buildPublicationViewModel(
  query: string,
  answer: StructuredResearchResponse,
): PublicationViewModel {
  const fallbackTakeaways = answer.answer_sections
    .flatMap((section) => section.key_points)
    .slice(0, 5);

  const publication = answer.publication;
  return {
    title: publication.title || `Research Brief: ${query}`,
    abstract: publication.abstract || answer.tldr,
    executive_brief: publication.executive_brief || answer.tldr,
    methodology: publication.methodology.length
      ? publication.methodology
      : [answer.methodology_summary],
    key_takeaways: publication.key_takeaways.length
      ? publication.key_takeaways
      : fallbackTakeaways,
    next_actions: publication.next_actions.length
      ? publication.next_actions
      : answer.follow_up_questions,
  };
}
