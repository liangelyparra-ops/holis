import React from 'react';
import { Download, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { portfolioContent } from '../../data/portfolioContent';

export const ContactSection: React.FC = () => {
  return (
    <div className="max-w-6xl w-full mx-auto px-5 sm:px-12 py-10 sm:py-16 space-y-16 md:space-y-24 text-left">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start" aria-labelledby="about-heading">
        <div className="lg:col-span-5 space-y-5">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-mono text-neutral-700 bg-neutral-100 border border-neutral-200/40 shadow-3xs w-fit">
            About
          </span>
          <h1 id="about-heading" className="font-headline text-4xl sm:text-6xl font-light text-neutral-900 tracking-[-0.03em] leading-[1.05]">
            From startup product building to enterprise systems.
          </h1>
          <p className="font-mono text-xs sm:text-sm uppercase tracking-wider text-neutral-500">
            {portfolioContent.specialization}
          </p>
        </div>

        <div className="lg:col-span-7 space-y-5 font-sans text-base sm:text-lg text-neutral-600 leading-relaxed">
          <p>
            I’m a Senior Product Designer focused on complex B2B SaaS, AI-assisted workflows and enterprise systems. I work on products where people need to understand dense information, evaluate system suggestions and stay in control of consequential decisions.
          </p>
          <p>
            I joined illow through brand and marketing design, owning its visual identity, website and communication system. As the product grew, I moved into its core experience and became the company’s sole UX designer. That progression shaped how I work today: visual quality matters, but it has to support clear interaction, reusable patterns and a coherent product model.
          </p>
          <p>
            After illow’s acquisition, I continued working on the product at BigID. The context changed from a startup environment to enterprise privacy and governance, bringing denser data, broader organizational requirements and AI-related workflows. I partnered with product and engineering from problem definition through handoff and implementation, translating technical constraints into interfaces people could inspect and act on.
          </p>
          <p>
            My background is in Graphic Design, with additional UX/UI training. I’m based in Buenos Aires and work remotely across time zones in Spanish and English. Outside product work, I keep a visual practice through fine arts and painting.
          </p>
        </div>
      </section>

      <section id="contact" className="custom-glass border border-neutral-200/60 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs" aria-labelledby="contact-heading">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-7 space-y-4">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">Contact</span>
            <h2 id="contact-heading" className="font-headline text-3xl sm:text-5xl font-light text-neutral-900 tracking-tight">
              Let’s talk about your product.
            </h2>
            <p className="font-sans text-base text-neutral-600 leading-relaxed max-w-2xl">
              For product design opportunities and collaboration, contact me by email or LinkedIn.
            </p>
            <a href={`mailto:${portfolioContent.email}`} className="inline-block font-sans text-base sm:text-lg font-semibold text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors select-all">
              {portfolioContent.email}
            </a>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              href={`mailto:${portfolioContent.email}`}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-neutral-950 text-white font-sans text-sm font-semibold hover:bg-black transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Lia
            </a>
            <a
              href={portfolioContent.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border border-neutral-300 bg-white/70 text-neutral-900 font-sans text-sm font-semibold hover:bg-white hover:border-neutral-500 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200/70 flex flex-wrap gap-x-6 gap-y-3 text-sm font-sans text-neutral-600">
          <a href={portfolioContent.resumeUrl} download className="inline-flex items-center gap-2 hover:text-neutral-950 transition-colors">
            <Download className="w-4 h-4" />
            Download resume
          </a>
          <a href={portfolioContent.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-neutral-950 transition-colors">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <span>Buenos Aires · Remote</span>
        </div>
      </section>
    </div>
  );
};