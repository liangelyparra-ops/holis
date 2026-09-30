import React, { useReducer, useState } from 'react';
import type { CaseVisualType } from '../../data/useCases';
import { canApproveCookie, cookieDemoReducer, cookieFields, createCookieDemoState, getConflictRules } from '../../data/caseStudyDemos';
import type { ConflictResolution } from '../../data/caseStudyDemos';

const labelClass = 'font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500';
const buttonClass = 'rounded-lg bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed';

export const visualCaptions: Record<CaseVisualType, string> = {
  cookie: 'Illustrative demo · sample data · no live AI or saved changes',
  enterprise: 'Illustrative model · example rules, not production configuration',
  conflict: 'Illustrative reconstruction · local demo, not a historical screen',
  brand: 'Illustrative system map · not original brand specifications',
};

export function CaseVisual({ type, compact = false }: { key?: string | number | null; type: CaseVisualType; compact?: boolean }) {
  return (
    <figure className="space-y-3 min-w-0">
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-6 text-left">
        {type === 'cookie' && (compact ? <CookieSummary /> : <CookieReviewDemo />)}
        {type === 'enterprise' && <EnterpriseModel compact={compact} />}
        {type === 'conflict' && (compact ? <ConflictSummary /> : <ConflictResolutionDemo />)}
        {type === 'brand' && <BrandSystemMap compact={compact} />}
      </div>
      <figcaption className="font-sans text-[11px] leading-relaxed text-neutral-500">{visualCaptions[type]}</figcaption>
    </figure>
  );
}

function CookieSummary() {
  return (
    <div className="space-y-4">
      <p className={labelClass}>Suggestion → review → decision</p>
      <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs">sample_cookie</span>
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] text-amber-900">Pending review</span>
        </div>
        <dl className="space-y-2 text-xs">
          {['Category', 'Description', 'Vendor'].map(field => (
            <div key={field} className="flex justify-between gap-2 border-t border-stone-100 pt-2">
              <dt className="text-stone-600">{field}</dt><dd className="text-violet-700">AI-suggested</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="text-xs text-stone-600">Editing changes the origin label for that field only.</p>
    </div>
  );
}

function CookieReviewDemo() {
  const [state, dispatch] = useReducer(cookieDemoReducer, undefined, createCookieDemoState);
  const { stage, values, edited } = state;
  const prefix = React.useId();
  const reset = () => dispatch({ type: 'reset' });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-2">
        <p className={labelClass}>Local review demonstration</p>
        <button type="button" onClick={reset} className="text-xs underline underline-offset-4">Reset demo</button>
      </div>
      <ol className="grid grid-cols-3 gap-2 text-[11px] text-stone-600">
        {['Uncategorized', 'Review suggestion', 'Approved'].map((name, index) => (
          <li key={name} className={`border-t-2 pt-2 ${index === ['uncategorized', 'review', 'approved'].indexOf(stage) ? 'border-neutral-900 text-neutral-900 font-semibold' : 'border-stone-200'}`}>{index + 1}. {name}</li>
        ))}
      </ol>
      <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <span className="font-mono text-xs">sample_cookie</span>
          <span role="status" className="rounded-full bg-stone-100 px-3 py-1 text-xs">
            {stage === 'uncategorized' ? 'Uncategorized' : stage === 'review' ? 'Pending review' : 'Approved in demo'}
          </span>
        </div>
        {stage === 'uncategorized' ? (
          <>
            <p className="text-sm leading-relaxed text-stone-600">No category has been assigned. Load a preset example to explore the review step; no AI service is called.</p>
            <button type="button" onClick={() => dispatch({ type: 'load' })} className={buttonClass}>Load example suggestion</button>
          </>
        ) : (
          <>
            {cookieFields.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <label htmlFor={`${prefix}-${key}`} className="text-xs font-semibold">{label}</label>
                  <span className={`text-[11px] ${edited[key] ? 'text-stone-600' : 'text-violet-700'}`}>{edited[key] ? 'Manual entry' : 'AI-suggested example'}</span>
                </div>
                <input id={`${prefix}-${key}`} value={values[key]} disabled={stage === 'approved'}
                  onChange={event => dispatch({ type: 'edit', field: key, value: event.target.value })}
                  className="w-full min-w-0 rounded-lg border border-stone-300 bg-white p-3 text-sm text-stone-800 disabled:bg-stone-50 focus-visible:outline-2 focus-visible:outline-neutral-900" />
              </div>
            ))}
            {stage === 'review' && <button type="button" disabled={!canApproveCookie(state)} onClick={() => dispatch({ type: 'approve' })} className={buttonClass}>Approve classification in demo</button>}
            {stage === 'approved' && <p className="text-sm text-stone-700">Classification approved locally as <strong>{values.category}</strong>. No account or backend was updated.</p>}
          </>
        )}
      </div>
    </div>
  );
}

function EnterpriseModel({ compact }: { compact: boolean }) {
  const levels = [
    { level: 'Organization', value: 'Analytics: review required', source: 'Base rule · defined here' },
    { level: 'Business unit', value: 'Analytics: review required', source: 'Inherited from organization' },
    { level: 'Region', value: 'Analytics: disabled', source: 'Explicit regional exception' },
  ];
  return (
    <div className="space-y-4">
      <p className={labelClass}>One rule vocabulary across layers</p>
      <ol className="space-y-3">
        {levels.map((item, index) => (
          <li key={item.level} className={`relative rounded-xl border bg-white p-3 sm:p-4 ${index === 2 ? 'border-amber-200' : 'border-stone-200'}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-xs font-semibold">{index + 1}. {item.level}</h4>
              <span className="text-[10px] text-stone-500">{index === 2 ? 'Exception' : index === 1 ? 'Inherited' : 'Source'}</span>
            </div>
            <p className="mt-2 text-xs text-stone-700">{item.value}</p>
            {!compact && <p className="mt-1 text-[11px] text-stone-500">{item.source}</p>}
          </li>
        ))}
      </ol>
      <p className="text-xs leading-relaxed text-stone-600">The exception stays visible alongside its inherited context.</p>
    </div>
  );
}

function ConflictSummary() {
  return (
    <div className="space-y-4">
      <p className={labelClass}>Explain → choose → continue</p>
      <div className="rounded-xl border border-amber-200 bg-white p-4 space-y-2">
        <h4 className="text-xs font-semibold">Two rules disagree</h4>
        <p className="text-xs text-stone-600">Organization: analytics enabled.<br />Example region: analytics disabled.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
        <span className="rounded-lg border border-stone-200 bg-white p-3">Keep regional exception</span>
        <span className="rounded-lg border border-stone-200 bg-white p-3">Revise organization rule</span>
      </div>
      <p className="text-xs text-stone-600">Unrelated settings remain in view.</p>
    </div>
  );
}

function ConflictResolutionDemo() {
  const [resolution, setResolution] = useState<ConflictResolution>(null);
  const rules = getConflictRules(resolution);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-2">
        <p className={labelClass}>Local conflict demonstration</p>
        <button type="button" onClick={() => setResolution(null)} className="text-xs underline underline-offset-4">Reset demo</button>
      </div>
      <dl className="rounded-xl border border-stone-200 bg-white p-4 space-y-3 text-xs">
        <div className="flex flex-wrap justify-between gap-2"><dt>Organization · Analytics</dt><dd className="font-semibold">{rules.organization}</dd></div>
        <div className="flex flex-wrap justify-between gap-2"><dt>Example region · Analytics</dt><dd className="font-semibold">{rules.region}</dd></div>
        <div className="flex flex-wrap justify-between gap-2 border-t border-stone-100 pt-3 text-stone-500"><dt>Unrelated setting · Functional</dt><dd>{rules.functional}</dd></div>
      </dl>
      {!resolution ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-4">
          <div className="space-y-2"><h4 className="text-sm font-semibold">The region and organization rules disagree.</h4><p className="text-xs leading-relaxed text-stone-700">Keep the region’s disabled value as an exception, or disable analytics at organization level so the region inherits it.</p></div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setResolution('exception')} className={buttonClass}>Keep regional exception</button>
            <button type="button" onClick={() => setResolution('global')} className={buttonClass}>Revise organization rule</button>
          </div>
        </div>
      ) : <p role="status" className="rounded-xl border border-stone-200 bg-white p-4 text-sm leading-relaxed">{resolution === 'exception' ? 'Regional exception selected. The organization rule stays enabled.' : 'Organization rule changed to disabled. The region now inherits it.'} Unrelated configuration remains unchanged in this local demo.</p>}
      <p className="text-xs text-stone-500">No production rules are evaluated or saved.</p>
    </div>
  );
}

function BrandSystemMap({ compact }: { compact: boolean }) {
  return (
    <div className="space-y-4">
      <p className={labelClass}>Shared foundation, adapted composition</p>
      <div className="rounded-xl border border-neutral-900 bg-white p-4">
        <h4 className="text-sm font-semibold">Common visual rules</h4>
        <p className="mt-2 text-xs text-stone-600">Color relationships · type hierarchy · spacing · layout</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { title: 'Identity', detail: 'Recognition and consistency' },
          { title: 'Website', detail: 'Explanation and next action' },
          { title: 'Paid campaigns', detail: 'One message and a clear CTA' },
          { title: 'Social', detail: 'Repeatable content formats' },
        ].map(item => (
          <div key={item.title} className="rounded-xl border border-stone-200 bg-white p-3 space-y-2">
            <h5 className="text-xs font-semibold">{item.title}</h5>
            {!compact && <div aria-hidden="true" className="space-y-1.5 py-2"><div className="h-2 w-3/4 rounded bg-stone-700" /><div className="h-1.5 w-full rounded bg-stone-200" /><div className="h-1.5 w-1/2 rounded bg-stone-200" /></div>}
            <p className="text-[11px] leading-relaxed text-stone-500">{item.detail}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-stone-600">Later product work carries the same goal of visual clarity, not identical layouts.</p>
    </div>
  );
}

export function CookieLivePrototypeBlock({ url }: { key?: string | number | null; url: string }) {
  const [showEmbed, setShowEmbed] = useState(false);
  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 p-4 sm:p-6" aria-label="External design prototype">
      <h3 className="text-sm font-semibold">Explore the existing design prototype</h3>
      <p className="text-xs leading-relaxed text-stone-600">Optional external demonstration, not a production release. If it is unavailable or cannot be embedded, the local review demo above still explains the pattern. Loading the embed connects to an external site.</p>
      <div className="flex flex-wrap gap-4 items-center">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold underline underline-offset-4">Open prototype in a new tab ↗</a>
        <button type="button" onClick={() => setShowEmbed(prev => !prev)} className={buttonClass}>{showEmbed ? 'Hide embedded prototype' : 'Load embedded prototype'}</button>
      </div>
      {showEmbed && <div className="aspect-[4/5] sm:aspect-video overflow-hidden rounded-xl border border-stone-200"><iframe src={url} title="Cookie Classification — external design prototype" className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer" /></div>}
    </section>
  );
}