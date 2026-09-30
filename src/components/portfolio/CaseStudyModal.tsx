import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDirectDriveUrl, getEmbedUrl } from '../../utils/media';
import { CarouselBlock } from './CaseStudyCard';
import {
  IllowDiagramBlock,
  BigIDDiagramBlock,
  CookieLivePrototypeBlock,
  BrandDiagramBlock,
  BrandGalleryBlock
} from './CustomCaseBlocks';

interface CaseStudyModalProps {
  project: any | null;
  onClose: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ project, onClose }) => {
  return (
    <AnimatePresence>
      {project && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/50 backdrop-blur-md overflow-hidden select-none"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 25 }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-2xl border border-neutral-200/80 rounded-3xl w-full max-h-[88vh] sm:max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-neutral-900 max-w-4xl"
          >
            {/* Modal Top Bar */}
            <div className="flex justify-between items-center px-6 sm:px-8 py-4 border-b border-neutral-100 bg-neutral-50/70">
              <div className="flex items-center gap-3">
                {project.tags?.map((tag: string) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase font-mono border bg-neutral-150/50 border-neutral-200/50 text-neutral-600 shadow-3xs"
                  >
                    {tag}
                  </span>
                ))}
                <span className="material-symbols-outlined text-black text-lg leading-none shrink-0" aria-hidden="true">
                  {project.icon}
                </span>
              </div>
              
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 hover:text-black hover:border-neutral-300 flex items-center justify-center text-neutral-500 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-3xs"
              >
                <span className="material-symbols-outlined text-base font-bold leading-none">close</span>
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto style-scrollbar text-left p-6 sm:p-8 md:p-10 space-y-8 bg-white">
              <div className="space-y-4">
                <h2 className="font-headline text-2xl sm:text-4xl font-bold text-neutral-900 tracking-tight leading-tight">
                  {project.title}
                </h2>

                {/* Empirical Key Metrics inside Modal for clean data presentation */}
                {project.metrics && project.metrics.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-t border-b border-neutral-100">
                    {project.metrics.map((metric: any, mIdx: number) => (
                      <div key={mIdx} className="space-y-1">
                        <div className="font-headline text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                          {metric.value}
                        </div>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-5 bg-neutral-50/80 rounded-2xl border border-neutral-200/50 select-text">
                  <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
                    <strong className="text-neutral-800 font-semibold uppercase font-mono text-[9px] tracking-widest block mb-1">The Challenge</strong>
                    {project.challenge}
                  </p>
                </div>
              </div>

              {/* Dynamic Block-Based Narrative Case Study Flow */}
              {project.blocks && project.blocks.length > 0 ? (
                <div className="space-y-6 sm:space-y-8 select-text">
                  {project.blocks.map((block: any, idx: number) => {
                    switch (block.type) {
                      case 'text':
                        return (
                          <div key={idx} className="space-y-4 select-text">
                            {block.title && (
                              <h4 className="font-headline text-base sm:text-lg font-bold text-neutral-900 uppercase tracking-wider font-mono border-b border-neutral-100 pb-1.5 pt-2">
                                {block.title}
                              </h4>
                            )}
                            
                            {block.paragraphs && block.paragraphs.length > 0 && (
                              <div className="space-y-3.5">
                                {block.paragraphs.map((para: string, pIdx: number) => (
                                  <p key={pIdx} className="text-neutral-600 font-sans text-xs sm:text-sm leading-relaxed">
                                    {para}
                                  </p>
                                ))}
                              </div>
                            )}

                            {block.bulletPoints && block.bulletPoints.length > 0 && (
                              <div className="space-y-4 bg-neutral-50 p-5 sm:p-6 rounded-2xl border border-neutral-200/50 mt-4 text-left">
                                {block.title && (
                                  <h5 className="font-headline text-xs font-bold text-black uppercase tracking-wider font-mono mb-2">
                                    {block.title} Key Action Points
                                  </h5>
                                )}
                                <ul className="space-y-3 font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                                  {block.bulletPoints.map((bullet: string, bIdx: number) => (
                                    <li key={bIdx} className="flex items-start gap-2.5">
                                      <span className="text-black font-black text-sm select-none leading-none mt-0.5">•</span>
                                      <span>{bullet}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );

                      case 'image':
                        return (
                          <div key={idx} className="space-y-2 select-none">
                            <div className="overflow-hidden rounded-xl border border-neutral-250 group/img relative bg-neutral-900 aspect-video sm:aspect-[21/9] shadow-3xs">
                              <img 
                                src={getDirectDriveUrl(block.imageUrl || block.carouselImages?.[0])} 
                                alt={block.imageCaption || "Case study graphics block"} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover/img:scale-101 transition-transform duration-700 ease-out brightness-[0.98] group-hover/img:brightness-100"
                              />
                            </div>
                            {block.imageCaption && (
                              <p className="font-sans text-xs text-neutral-500 italic mt-2 select-text pl-0.5">
                                {block.imageCaption}
                              </p>
                            )}
                          </div>
                        );

                      case 'carousel':
                        return (
                          <CarouselBlock key={idx} block={block} getDirectDriveUrl={getDirectDriveUrl} />
                        );

                      case 'video':
                        const isEmbed = block.videoUrl?.includes('youtube.com') || 
                                        block.videoUrl?.includes('youtu.be') || 
                                        block.videoUrl?.includes('vimeo.com') ||
                                        block.videoUrl?.includes('drive.google.com') ||
                                        block.videoUrl?.includes('embed');
                        return (
                          <div key={idx} className="space-y-2 select-none">
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-neutral-250 bg-neutral-950 shadow-3xs">
                              {isEmbed ? (
                                <iframe 
                                  src={getEmbedUrl(block.videoUrl)} 
                                  title="Video presentation player"
                                  className="absolute inset-0 w-full h-full border-0"
                                  style={{ border: 0 }}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video 
                                  src={block.videoUrl} 
                                  controls 
                                  playsInline
                                  preload="metadata"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              )}
                            </div>

                            {block.videoCaption && (
                              <p className="font-sans text-xs text-neutral-500 italic mt-2 select-text pl-0.5">
                                {block.videoCaption}
                              </p>
                            )}
                          </div>
                        );

                      case 'pdf':
                        return (
                          <div key={idx} className="space-y-2 select-none">
                            <div className="relative bg-neutral-150 rounded-xl overflow-hidden border border-neutral-250 aspect-video sm:aspect-[21/9] flex flex-col shadow-3xs group">
                              <iframe 
                                src={getEmbedUrl(block.pdfUrl)}
                                className="w-full h-full border-0 rounded-xl bg-neutral-100"
                                title="Case study PDF document"
                              />
                              <div className="absolute top-3 right-3 opacity-90 hover:opacity-100 transition-opacity">
                                <a 
                                  href={block.pdfUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="font-mono text-[9px] text-black bg-white hover:bg-black hover:text-white border border-neutral-200 hover:border-black px-2.5 py-1 rounded-full font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                >
                                  Open PDF
                                  <span className="material-symbols-outlined text-[10px] font-bold">open_in_new</span>
                                </a>
                              </div>
                            </div>

                            {block.pdfCaption && (
                              <p className="font-sans text-xs text-neutral-500 italic mt-2 select-text pl-0.5">
                                {block.pdfCaption}
                              </p>
                            )}
                          </div>
                        );

                      case 'custom':
                        if (block.customType === 'cookie_live_prototype') {
                          return <CookieLivePrototypeBlock key={idx} />;
                        }
                        if (block.customType === 'cookie_trust_callout') {
                          return (
                            <div key={idx} className="bg-stone-50 border-l-2 border-stone-900 p-5 sm:p-6 rounded-r-2xl border border-stone-200/80 my-6 text-left">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-900 mb-2 font-mono flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-stone-900">verified_user</span>
                                {block.title || "The Trust Mechanic — Core Design Decision"}
                              </div>
                              <p className="text-stone-700 font-sans text-xs sm:text-sm leading-relaxed">
                                {block.content}
                              </p>
                            </div>
                          );
                        }
                        if (block.customType === 'illow_diagram') {
                          return <IllowDiagramBlock key={idx} />;
                        }
                        if (block.customType === 'bigid_diagram') {
                          return <BigIDDiagramBlock key={idx} />;
                        }
                        if (block.customType === 'brand_diagram') {
                          return <BrandDiagramBlock key={idx} />;
                        }
                        if (block.customType === 'brand_gallery') {
                          return <BrandGalleryBlock key={idx} />;
                        }
                        if (block.customType === 'illow_callout') {
                          return (
                            <div key={idx} className="bg-stone-50 border-l-2 border-stone-900 p-5 sm:p-6 rounded-r-2xl border border-stone-200/80 my-6 text-left">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-900 mb-2 font-mono">
                                {block.title || "Edge Case — The Core of the Redesign"}
                              </div>
                              <p className="text-stone-700 font-sans text-xs sm:text-sm leading-relaxed">
                                {block.content}
                              </p>
                            </div>
                          );
                        }
                        if (block.customType === 'bigid_callout') {
                          return (
                            <div key={idx} className="bg-stone-50 border-l-2 border-stone-900 p-5 sm:p-6 rounded-r-2xl border border-stone-200/80 my-6 text-left">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-900 mb-2 font-mono">
                                {block.title || "Key Decision"}
                              </div>
                              <p className="text-stone-700 font-sans text-xs sm:text-sm leading-relaxed">
                                {block.content}
                              </p>
                            </div>
                          );
                        }
                        if (block.customType === 'brand_callout') {
                          return (
                            <div key={idx} className="bg-stone-50 border-l-2 border-stone-900 p-5 sm:p-6 rounded-r-2xl border border-stone-200/80 my-6 text-left">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-900 mb-2 font-mono">
                                {block.title || "Alternative Considered & Rejected"}
                              </div>
                              <p className="text-stone-700 font-sans text-xs sm:text-sm leading-relaxed">
                                {block.content}
                              </p>
                            </div>
                          );
                        }
                        if (block.customType === 'brand_channels') {
                          return (
                            <div key={idx} className="space-y-4 my-6">
                              <h4 className="font-headline text-base sm:text-lg font-bold text-neutral-900 uppercase tracking-wider font-mono border-b border-neutral-100 pb-1.5 pt-2">
                                03. Scope I owned
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
                                {[
                                  { t: "Identity", d: "Logo system, color, type, voice guidelines", icon: "palette" },
                                  { t: "Website", d: "Brand site + funnel-stage landing pages", icon: "language" },
                                  { t: "Paid ads", d: "Display & social ad creative, funnel-stage variants", icon: "ads_click" },
                                  { t: "Social", d: "Ongoing organic content system across platforms", icon: "share" }
                                ].map((item, cidx) => (
                                  <div key={cidx} className="bg-white text-stone-900 border border-stone-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-xs hover:border-stone-400 transition-all duration-300">
                                    <span className="material-symbols-outlined text-stone-900 text-xl w-fit">
                                      {item.icon}
                                    </span>
                                    <div className="space-y-1.5 text-left">
                                      <h5 className="font-headline text-sm font-bold tracking-tight text-stone-900">{item.t}</h5>
                                      <p className="font-sans text-xs text-stone-600 leading-relaxed">{item.d}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;

                      default:
                        return null;
                    }
                  })}

                  {/* Styled Footer Badge */}
                  {project.footerBadge && (
                    <div className="pt-4 border-t border-neutral-150 select-none">
                      <div className="bg-neutral-50/90 text-neutral-600 border border-neutral-200/80 p-3.5 rounded-2xl font-mono font-bold text-[10px] tracking-widest text-center uppercase shadow-3xs">
                        {project.footerBadge}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-neutral-400 text-xs text-center py-8">
                  No modules or narrative blocks found.
                </div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-3xs"
              >
                Close Case Study
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
