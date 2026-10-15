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
    <section className={`lp-timeline w-full ${className}`} aria-labelledby="lp-timeline-title">
      <style>{`
        .lp-timeline {
          width: 100%;
          max-width: 100%;
          margin: 2.5rem 0;
          padding: 0;
          font: inherit;
          color: inherit;
        }
        .lp-timeline .lp-timeline-heading {
          margin: 0 0 1.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgb(120 113 108); /* stone-500 */
        }
        .lp-timeline ol {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          gap: 2rem;
          border-top: 1px solid rgba(120, 113, 108, 0.35);
        }
        .lp-timeline li {
          position: relative;
          flex: 1;
          padding-top: 1.25rem;
        }
        .lp-timeline li::before {
          content: "";
          position: absolute;
          top: -4px;
          left: 0;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.8;
        }
        .lp-timeline .lp-timeline-header {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 0.4rem 0.5rem;
          margin-bottom: 0.35rem;
        }
        .lp-timeline h3 {
          margin: 0;
          font-size: 0.925rem;
          font-weight: 600;
          line-height: 1.25;
          color: inherit;
        }
        .lp-timeline time {
          display: inline-block;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.7rem;
          opacity: 0.6;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .lp-timeline p {
          margin: 0;
          font-size: 0.725rem;
          line-height: 1.45;
          opacity: 0.65;
          max-width: 220px;
        }
        @media (max-width: 820px) {
          .lp-timeline ol {
            flex-direction: column;
            gap: 1.5rem;
            border-top: 0;
            border-left: 1px solid rgba(120, 113, 108, 0.35);
            padding-left: 1.25rem;
          }
          .lp-timeline li {
            padding-top: 0;
          }
          .lp-timeline li::before {
            top: 0.25em;
            left: calc(-1.25rem - 4px);
          }
          .lp-timeline p {
            max-width: 100%;
          }
        }
      `}</style>

      <h2 id="lp-timeline-title" className="lp-timeline-heading">Trayectoria</h2>
      <ol>
        {defaultTimelineItems.map((item, idx) => (
          <li key={idx}>
            <div className="lp-timeline-header">
              <h3>{item.role}</h3>
              <time>{item.period}</time>
            </div>
            <p>{item.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};
