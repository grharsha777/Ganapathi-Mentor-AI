'use client';

interface FollowUpChipsProps {
  questions: string[];
  onClick: (question: string) => void;
}

export function FollowUpChips({ questions, onClick }: FollowUpChipsProps) {
  if (!questions.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/80 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Follow-up Questions</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onClick(question)}
            className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs text-zinc-200 hover:border-sky-400/40 hover:text-sky-200"
          >
            {question}
          </button>
        ))}
      </div>
    </section>
  );
}
