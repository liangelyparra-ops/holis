import React from 'react';

interface TimelineItem {
  period: string;
  role: string;
  description: string;
}

const defaultTimelineItems: TimelineItem[] = [
  {
    period: '2009 – 2013',
    role: 'Diseño Gráfico',
    description: 'Universidad Rafael Belloso Chacín.',
  },
  {
    period: '2021 – 2024',
    role: 'illow',
    description: 'Única diseñadora UX. Marca, marketing y producto.',
  },
  {
    period: '2023',
    role: 'Diseño UX/UI',
    description: 'UTN Buenos Aires.',
  },
  {
    period: '2023',
    role: '12+ premios G2',
    description: 'Best Usability, Easiest Setup y más.',
  },
  {
    period: '2024 – 2026',
    role: 'BigID',
    description: 'Diseñadora Senior de UX y Producto.',
  },
];

export const CareerTimeline: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <section className={`lp-timeline ${className}`} aria-labelledby="lp-timeline-title">
      <style>{`
        .lp-timeline {
          max-width: 960px;
          margin: 3rem auto;
          padding: 0 1.25rem;
          font: inherit;
          color: inherit;
        }
        .lp-timeline h2 {
          margin: 0 0 1.5rem;
          font-size: 1.15rem;
          font-weight: 700;
        }
        .lp-timeline ol {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          gap: 1.25rem;
          border-top: 1px solid currentColor;
        }
        .lp-timeline li {
          position: relative;
          flex: 1;
          padding-top: 1rem;
        }
        .lp-timeline li::before {
          content: "";
          position: absolute;
          top: -4.5px;
          left: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }
        .lp-timeline time {
          display: block;
          font-size: .75rem;
          opacity: .6;
        }
        .lp-timeline h3 {
          margin: .2rem 0 .15rem;
          font-size: .9rem;
          font-weight: 600;
          line-height: 1.3;
        }
        .lp-timeline p {
          margin: 0;
          font-size: .8rem;
          line-height: 1.45;
          opacity: .8;
        }
        @media (max-width: 700px) {
          .lp-timeline ol {
            flex-direction: column;
            gap: 1.25rem;
            border-top: 0;
            border-left: 1px solid currentColor;
            padding-left: 1.25rem;
          }
          .lp-timeline li {
            padding-top: 0;
          }
          .lp-timeline li::before {
            top: .3em;
            left: calc(-1.25rem - 4.5px);
          }
        }
      `}</style>

      <h2 id="lp-timeline-title">Trayectoria</h2>
      <ol>
        {defaultTimelineItems.map((item, idx) => (
          <li key={idx}>
            <time>{item.period}</time>
            <h3>{item.role}</h3>
            <p>{item.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};
