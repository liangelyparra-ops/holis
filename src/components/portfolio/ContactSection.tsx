import React, { useState } from 'react';
import { Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const ContactSection: React.FC = () => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('UX Consultancy');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error("Please fill in all required fields.", { duration: 3000 });
      return;
    }
    setContactSubmitting(true);
    try {
      const submissionId = `submission-${Date.now()}`;
      
      // Save to Firestore for reliable persistence backup
      await setDoc(doc(db, 'contacts', submissionId), {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
        createdAt: new Date().toISOString()
      });

      // Submit to server endpoint to trigger email alert / log
      await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });

      setContactSubmitted(true);
      toast.success("Message logged successfully! ✉️", {
        description: "Choose an instant option below to complete your connection.",
        duration: 5000
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not send message. Please try again.");
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-12 py-10 sm:py-16 space-y-16 md:space-y-24 text-left select-none">
      <div className="space-y-6">
        <div className="space-y-3 animate-fade-in">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-700 bg-neutral-100 border border-neutral-200/40 shadow-3xs w-fit">
            Partner with Lia
          </span>
          <h2 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-light text-neutral-900 tracking-[-0.03em] leading-[1.05]">
            Consultancy &amp; <span className="font-cursive italic font-normal text-neutral-400 pr-1">Action</span>
          </h2>
        </div>
        <p className="font-sans text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
          Need to solve immediate conversions boundaries, improve retention rates, or build clean corporate design languages? Leave a message or connect directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {/* Information block */}
        <div className="custom-glass border border-neutral-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-neutral-300 hover:bg-white/60 space-y-8">
          <div className="space-y-6">
            <h3 className="font-headline text-2xl font-semibold text-neutral-900 tracking-tight">Lia Parra</h3>
            <p className="font-sans text-sm text-neutral-500 leading-relaxed">
              Sr. Product Designer UX / UI Lead and experience strategist driving conversion, interactive interfaces, and cross-platform UX structures.
            </p>
            <div className="space-y-4 pt-6 border-t border-neutral-150 text-sm font-sans">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#45474b]">mail</span>
                <a href="mailto:liangelyp@gmail.com" className="text-neutral-700 select-all font-medium hover:text-black hover:underline transition-all">liangelyp@gmail.com</a>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#45474b]">chat</span>
                <a href="https://wa.me/5491156424162?text=Hello%20Lia!%20I%20saw%20your%20portfolio%20and%20would%20love%20to%20connect%20with%20you." target="_blank" rel="noreferrer" className="text-neutral-700 font-medium hover:text-black hover:underline transition-all">+54 9 11 5642-4162 (WhatsApp)</a>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#45474b]">location_on</span>
                <span className="text-neutral-700 font-medium">Remote • Global / Digital Sync</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-6 border-t border-neutral-150">
            <a 
              href="https://linkedin.com/in/liangely-diseno-grafico"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-widest text-black hover:underline transition-colors"
              id="contact-linkedin-link"
            >
              <Linkedin className="w-3.5 h-3.5 shrink-0" />
              LinkedIn ↗
            </a>
          </div>
        </div>

        {/* Contact form block */}
        <div className="lg:col-span-2 custom-glass border border-neutral-200/50 bg-white/45 p-6 sm:p-8 rounded-2xl transition-all duration-300 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-neutral-300 hover:bg-white/60">
          {contactSubmitted ? (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100/80 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-2xl font-semibold text-neutral-900 tracking-tight">
                  Inquiry Received Successfully!
                </h3>
                <p className="font-sans text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Your details have been registered on our servers. To establish immediate contact and send this message instantly to my private channels, click one of the options below:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                <a
                  href={`https://wa.me/5491156424162?text=${encodeURIComponent(`Hello Lia! This is ${contactName} (${contactEmail}).\n\n*Collaboration Area*: ${contactSubject}\n\n*Project Context*:\n${contactMessage}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all scale-100 hover:scale-[1.02] active:scale-95 animate-fade-in"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  Send via WhatsApp
                </a>
                <a
                  href={`mailto:liangelyp@gmail.com?subject=${encodeURIComponent(`Portfolio Contact: ${contactSubject}`)}&body=${encodeURIComponent(`Hi Lia,\n\nMy name is ${contactName} (${contactEmail}).\n\nArea of Interaction: ${contactSubject}\n\nMessage Detail:\n${contactMessage}`)}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-neutral-950 hover:bg-black text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all scale-100 hover:scale-[1.02] active:scale-95 animate-fade-in"
                >
                  <span className="material-symbols-outlined text-lg">mail</span>
                  Send via Email Client
                </a>
              </div>

              <div className="pt-6 border-t border-neutral-150">
                <button
                  type="button"
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactName('');
                    setContactEmail('');
                    setContactMessage('');
                  }}
                  className="text-[10px] font-sans font-semibold uppercase tracking-wider text-black hover:underline transition-all cursor-pointer"
                >
                  ← Send another message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 font-mono">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    className="w-full bg-white/40 backdrop-blur-md border border-neutral-200/50 rounded-xl p-3 text-xs sm:text-sm font-sans focus:bg-white focus:border-black outline-none transition-all text-neutral-900 shadow-3xs focus:ring-1 focus:ring-black/10"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 font-mono">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. alex@company.com"
                    className="w-full bg-white/40 backdrop-blur-md border border-neutral-200/50 rounded-xl p-3 text-xs sm:text-sm font-sans focus:bg-white focus:border-black outline-none transition-all text-neutral-900 shadow-3xs focus:ring-1 focus:ring-black/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 font-mono">
                  Area of Collaboration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['UX Consultancy', 'Product Design', 'Game UX'].map((sub) => {
                    const isSelected = contactSubject === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        id={`subject-${sub.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => setContactSubject(sub)}
                        className={`py-2 px-2 sm:px-3 rounded-xl text-[9px] sm:text-[10px] font-mono font-bold uppercase border tracking-widest transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs scale-[1.01]'
                            : 'bg-white/40 border-neutral-200/50 text-neutral-500 hover:border-neutral-400 hover:text-black hover:bg-neutral-50 shadow-3xs'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 font-mono">
                  Tell me about your product challenge *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Describe your design objectives, timelines or parameters..."
                  className="w-full bg-white/40 backdrop-blur-md border border-neutral-200/50 rounded-xl p-3 text-xs sm:text-sm font-sans focus:bg-white focus:border-black outline-none transition-all text-neutral-900 shadow-3xs focus:ring-1 focus:ring-black/10"
                />
              </div>

              <button
                type="submit"
                id="contact-form-submit-btn"
                disabled={contactSubmitting}
                className="w-full py-3.5 bg-neutral-950 text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all rounded-xl shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {contactSubmitting ? 'Sending inquiry...' : 'Send Message'}
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
