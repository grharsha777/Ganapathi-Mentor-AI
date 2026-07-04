'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const FAQS = [
  {
    question: 'How is my proprietary code handled?',
    answer: 'Ganapathi Mentor AI is designed for enterprise engineering teams. All code, prompts, and context injected into the platform are processed exclusively within secure AWS VPC environments. We do not use your proprietary codebase to train our foundational models.',
  },
  {
    question: 'Which Large Language Models (LLMs) do you support?',
    answer: 'We provide multi-model capabilities including Claude 3.5 Sonnet, Mistral Large, GPT-4o, and Llama 3. Queries are routed through AWS Bedrock or directly to the respective API providers via secure TLS 1.3 encrypted channels.',
  },
  {
    question: 'Can we deploy Ganapathi on our own infrastructure?',
    answer: 'Yes. Enterprise customers have the option to deploy Ganapathi Mentor AI on their own AWS, GCP, or Azure environments. We provide Terraform scripts and a dedicated Technical Account Manager to assist with the deployment.',
  },
  {
    question: 'How does the context engine work?',
    answer: 'Our context engine ingests your entire repository structure, parses Abstract Syntax Trees (ASTs), and chunks the data into a vectorized MongoDB Atlas database. When you ask a question, we use semantic search to inject only the most relevant code snippets into the LLM prompt.',
  },
  {
    question: 'What is the pricing model?',
    answer: 'Pricing is based on active developer seats and compute usage. Enterprise tiers include unlimited standard queries and a high monthly quota for deep-reasoning models. Contact our sales team for a custom volume quote.',
  },
];

function FAQItem({ item, isOpen, onClick }: { item: typeof FAQS[0], isOpen: boolean, onClick: () => void }) {
  return (
    <div className="border-b border-[#1F1F1F]">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group
                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B00]"
        aria-expanded={isOpen}
      >
        <span className="text-[16px] md:text-[18px] font-bold text-[#FFFFFF] group-hover:text-[#FF6B00] transition-colors pr-8">
          {item.question}
        </span>
        <div 
          className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-transform duration-300 ${
            isOpen ? 'bg-[#FF6B00] border-transparent rotate-180' : 'bg-transparent border border-[#374151] rotate-0'
          }`}
        >
          {isOpen ? (
            <X className="w-4 h-4 text-[#000000]" />
          ) : (
            <Plus className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#FFFFFF]" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="pb-6 pr-12 font-mono text-[13px] text-[#9CA3AF] leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative z-10 py-24 sm:py-32 bg-[#050505]">
      <div className="w-full max-w-4xl mx-auto px-6 md:px-10 lg:px-16">
        
        {/* ─── Section Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1,  y: 0  }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span className="font-mono block text-[10px] font-bold uppercase tracking-[0.3em] text-[#9CA3AF] mb-4">
            Knowledge Base
          </span>
          <h2
            className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase tracking-[-0.04em]
                       text-[#FFFFFF] leading-[1.0]"
          >
            Frequently Asked<br />
            <span className="text-[#FF6B00]">Questions.</span>
          </h2>
        </motion.div>

        {/* ─── FAQ Accordion ────────────────────────────────────────────── */}
        <div className="flex flex-col border-t border-[#1F1F1F]">
          {FAQS.map((faq, index) => (
            <FAQItem
              key={index}
              item={faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
