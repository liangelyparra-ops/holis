import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Play, X } from 'lucide-react';
import { designProjects, type DesignProject } from '../../data/designProjects';

const filters = ['All work', 'Web', 'Branding', 'Motion', 'Product'] as const;

export function ProjectDialog({ project, onClose }: { project: DesignProject | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!project) return;
    const element = dialog.current;
    element?.showModal();
    if (element) element.scrollTop = 0;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previousOverflow; };
  }, [project?.id]);
  if (!project) return null;
  return (
    <dialog ref={dialog} className="design-dialog" aria-labelledby="design-project-title" onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="design-dialog-head"><div className="design-card-labels"><span className="design-eyebrow">{project.category} · My work</span>{project.status && <span className="design-project-status">{project.status}</span>}</div><button autoFocus onClick={onClose} aria-label="Close project"><X size={22} /></button></div>
      <div className="design-dialog-content">
        <h2 id="design-project-title">{project.title}</h2>
        <p>{project.description}</p>
        {project.caseStudy ? <div className="design-case-study">
          <div className="design-case-intro"><span className="design-eyebrow">My role</span><p>{project.contribution}</p><p className="design-case-context">{project.caseStudy.context}</p></div>
          {project.caseStudy.sections.map((section, index) => <section className="design-case-section" key={section.heading} aria-labelledby={`design-case-section-${index}`}>
            <span className="design-eyebrow">{String(index + 1).padStart(2, '0')}</span>
            <h3 id={`design-case-section-${index}`}>{section.heading}</h3><p>{section.text}</p>
            {index === 0 && project.caseStudy.structure?.length ? <ol className="design-case-structure">{project.caseStudy.structure.map(step => <li key={step.label}><strong>{step.label}</strong><span>{step.detail}</span></li>)}</ol> : null}
            {section.images && <div className={`design-case-images${section.mobile ? ' design-case-mobile' : ''}`}>{section.images.map(picture => <figure key={picture.src}><a href={picture.src} target="_blank" rel="noopener noreferrer" aria-label={`View full size: ${picture.alt}`}><img src={picture.src} alt={picture.alt} loading="lazy" /></a><figcaption>{picture.alt} <a className="design-case-enlarge" href={picture.src} target="_blank" rel="noopener noreferrer">View full size ↗</a></figcaption></figure>)}</div>}
          </section>)}
        </div> : <><div className="design-project-media">{project.media.map(media => media.type === 'video'
          ? <figure key={media.src}><video controls playsInline preload="metadata" src={media.src} aria-label={media.alt} /><figcaption>{media.alt}</figcaption></figure>
          : <figure key={media.src}><img src={media.src} alt={media.alt} loading="lazy" /></figure>)}</div>
        <div className="design-contribution"><span className="design-eyebrow">What I worked on</span><p>{project.contribution}</p></div></>}
        {project.link && <a className="design-text-link" href={project.link.href} target="_blank" rel="noopener noreferrer">{project.link.label} <ArrowUpRight size={17} /></a>}
        {project.references && <div className="design-references"><p>{project.references.note}</p><div>{project.references.links.map(link => <a key={link.href} className="design-text-link" href={link.href} target="_blank" rel="noopener noreferrer">{link.label} <ArrowUpRight size={17} /></a>)}</div></div>}
      </div>
    </dialog>
  );
}

export function DesignPage() {
  const [filter, setFilter] = useState<string>('All work');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = designProjects.find(project => project.id === selectedId && !project.hidden) ?? null;
  const projectTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!selectedId) projectTrigger.current?.focus({ preventScroll: true });
  }, [selectedId]);
  useEffect(() => {
    const scrollToSection = () => {
      requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView());
    };
    scrollToSection();
    window.addEventListener('hashchange', scrollToSection);
    return () => window.removeEventListener('hashchange', scrollToSection);
  }, []);
  useEffect(() => {
    const oldTitle = document.title;
    const oldLanguage = document.documentElement.lang;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = 'Lia Parra | Brand, Product & Web Design';
    document.documentElement.lang = 'en';
    if (description) description.content = 'I’m Lia, a graphic designer based in Buenos Aires. Here’s a selection of my work in branding, websites, motion and product design.';
    return () => {
      document.title = oldTitle; document.documentElement.lang = oldLanguage;
      if (description && previousDescription !== undefined) description.content = previousDescription;
    };
  }, []);
  const visible = designProjects.filter(project => !project.hidden && (filter === 'All work' || project.category === filter));
  return (
    <div className="design-page">
      <a className="design-skip" href="#design-main">Skip to content</a>
      <header className="design-header design-wrap">
        <a className="design-wordmark" href="/design" aria-label="Lia Parra Design home">Lia Parra<span>DESIGN</span></a>
        <nav aria-label="Design navigation"><a href="#design-work">Work</a><a href="#design-about">About</a><a className="design-contact-nav" href="mailto:liangelyp@gmail.com">Let’s talk <ArrowUpRight size={16} /></a></nav>
      </header>
      <main id="design-main">
        <section className="design-hero design-wrap">
          <div className="design-hero-copy">
            <p className="design-eyebrow"><span className="design-dot" /> Graphic design · Web · Brand</p>
            <h1>I’m Lia.<br />I design brands,<br />products<br /><em>and websites.</em></h1>
            <p className="design-intro">I’m a graphic designer with experience in web, digital marketing and UX. I care about how things look, how they work and whether the message comes across clearly.</p>
            <a className="design-button" href="#design-work">See my work <ArrowDown size={17} /></a>
            <p className="design-location">Based in Buenos Aires</p>
          </div>
          <a className="design-hero-visual" href="#design-work" aria-label="Explore Bojana Estudio and other selected work">
            <div className="design-preview-bar"><span /><span /><span /><p>bojana.com.ar</p></div>
            <video muted playsInline loop autoPlay={!window.matchMedia('(prefers-reduced-motion: reduce)').matches} preload="metadata" src="/videos/mockup-bojana.mp4" aria-label="Bojana Estudio website preview" />
            <div className="design-visual-caption"><span>MY WORK FOR BOJANA ESTUDIO</span><ArrowUpRight size={20} /></div>
          </a>
        </section>
        <div className="design-discipline-strip"><div className="design-wrap"><span>Visual identity</span><span>Web design</span><span>Motion & campaigns</span><span>UX & product</span></div></div>
        <section id="design-work" className="design-work design-wrap" aria-labelledby="design-work-title">
          <div className="design-section-top"><div><p className="design-eyebrow">My work</p><h2 id="design-work-title">A few projects<br /><em>I’ve worked on.</em></h2></div><p>Open a project to see the work<br />and read about my part in it.</p></div>
          <div className="design-filters" role="group" aria-label="Filter selected work">{filters.filter(value => value === 'All work' || designProjects.some(project => !project.hidden && project.category === value)).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
          <p className="design-sr-only" role="status">{visible.length} projects shown</p>
          <div className="design-grid">{visible.map(project => <article key={project.id} className={`design-card design-card-${project.id}`}>
            <button className="design-card-button" onClick={event => { projectTrigger.current = event.currentTarget; setSelectedId(project.id); }} aria-label={`View ${project.title}`}>
              <div className="design-card-image">{project.media[0].type === 'video'
                ? <video muted playsInline preload="metadata" src={`${project.media[0].src}#t=0.1`} aria-hidden="true" />
                : <img src={project.media[0].src} alt={project.media[0].alt} loading="lazy" />}
                <span className="design-card-action">{project.media[0].type === 'video' ? <Play size={16} /> : <ArrowUpRight size={18} />}<span>View project</span></span>
              </div>
              <div className="design-card-meta"><div className="design-card-labels"><span className="design-eyebrow">{project.category}</span>{project.status && <span className="design-project-status">{project.status}</span>}</div><ArrowUpRight size={21} /></div>
              <h3>{project.title}</h3><p>{project.subtitle}</p>
            </button>
          </article>)}</div>
        </section>
        <section id="design-about" className="design-about" aria-labelledby="design-about-title"><div className="design-wrap design-about-grid">
          <div><p className="design-eyebrow">A little about me</p><h2 id="design-about-title">I started in graphic design.<br /><em>Then I got into UX.</em></h2></div>
          <div className="design-about-copy"><p>My background is in graphic design and digital marketing. At illow, I started with brand identity, marketing materials and the website. Over time, I moved into UX and became the company’s sole UX designer. After the acquisition, I continued at BigID as a Senior UX and Product Designer.</p><p>I’m open to different roles across design where I can put my visual judgment and eye for detail to work. I enjoy spotting what needs attention and figuring out how to make it clearer, more consistent or easier to use.</p></div>
        </div></section>
        <section className="design-process design-wrap" aria-labelledby="design-process-title"><h2 id="design-process-title">How I work.</h2><div className="design-process-grid">
          <div><span>01 · First, I ask</span><h3>I get clear on the brief.</h3><p>Before I start designing, I want to understand who it’s for, what we need to communicate and what the client needs. If something is unclear, I ask.</p></div>
          <div><span>02 · Then, I design</span><h3>I try things out.</h3><p>I work through layout, type and imagery until they make sense together. I also use AI tools to explore ideas and speed up parts of the work, and I review what they produce.</p></div>
          <div><span>03 · Before I deliver</span><h3>I check the details.</h3><p>I review the design in context, make sure the content is clear and adjust anything that feels out of place. Feedback helps me see what I may have missed.</p></div>
        </div></section>
        <section className="design-timeline design-wrap" aria-labelledby="design-timeline-title">
          <h2 id="design-timeline-title">My background</h2>
          <ol>
            {[
              { title: 'Graphic Design', period: '2009 – 2013', description: 'Universidad Rafael Belloso Chacín.' },
              { title: 'illow', period: '2021 – 2024', description: 'My work grew from brand and digital marketing into UX.' },
              { title: 'UX/UI Design', period: '2023', description: 'UTN Buenos Aires.' },
              { title: '12+ G2 badges', period: '2023', description: 'The illow product earned recognition including Best Usability and Easiest Setup.' },
              { title: 'BigID', period: '2024 – 2026', description: 'I continued in UX and product design after illow’s acquisition.' },
            ].map(item => <li key={item.title}>
              <div className="design-timeline-heading"><h3>{item.title}</h3><span>{item.period}</span></div>
              <p>{item.description}</p>
            </li>)}
          </ol>
        </section>
        <section className="design-play design-wrap" aria-labelledby="design-play-title">
          <p className="design-eyebrow">Personal explorations</p>
          <h2 id="design-play-title">Things I’m<br /><em>exploring.</em></h2>
          <div className="design-experiments-grid">
          <article className="design-play-card design-play-card-contemplativa">
            <video src="/design/previews/contemplativa.webm?v=195b11ed43" poster="/design/previews/contemplativa-poster.png?v=195b11ed43" aria-label="Moving strokes created in Clave, part of Contemplativa" autoPlay={!window.matchMedia('(prefers-reduced-motion: reduce)').matches} muted loop playsInline controls preload="metadata" />
            <div>
              <span className="design-eyebrow">Exploration in progress</span>
              <h3>Contemplativa</h3>
              <p>I’m giving myself room to explore without deciding yet what this needs to become. For now, I’m trying things through form, color, movement and interaction.</p>

              <a className="design-play-link" href="/contemplativa" target="_blank" rel="noopener noreferrer">Explore Contemplativa <ArrowUpRight size={18} /></a>
            </div>
          </article>
          <article className="design-play-card">
            <video src="/design/previews/papelito.webm?v=c524d2cc34" poster="/design/previews/papelito-poster.png" aria-label="Papelito game stages with sample players" autoPlay={!window.matchMedia('(prefers-reduced-motion: reduce)').matches} muted loop playsInline controls preload="metadata" />
            <div>
              <span className="design-eyebrow">Game experiment</span>
              <h3>Papelito</h3>
              <p>I built a multiplayer party game with shared rounds, sound cues and optional AI-generated cards. It’s a place for me to experiment with interaction and turn ideas into something people can play.</p>
              <p className="design-experiment-caption">Game screens with sample players.</p>
              <a className="design-play-link" href="/game.html" target="_blank" rel="noopener noreferrer">Try the game <ArrowUpRight size={18} /></a>
            </div>
          </article>
          </div>
        </section>
        <section className="design-contact design-wrap"><p className="design-eyebrow">Have a project or a role in mind?</p><h2>I’d love to<br /><em>hear about it.</em></h2><a className="design-button" href="mailto:liangelyp@gmail.com">Email me <ArrowUpRight size={18} /></a><a className="design-email" href="mailto:liangelyp@gmail.com">liangelyp@gmail.com</a></section>
      </main>
      <footer className="design-footer design-wrap"><span>Lia Parra © {new Date().getFullYear()}</span><nav aria-label="Social links"><a href="https://linkedin.com/in/liangely-diseno-grafico/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></nav></footer>
      <ProjectDialog project={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
