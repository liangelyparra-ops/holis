export interface DesignProject {
  id: string;
  title: string;
  category: 'Web' | 'Branding' | 'Motion' | 'Product';
  subtitle: string;
  hidden?: boolean;
  status?: 'In progress';
  description: string;
  contribution: string;
  media: { type: 'video' | 'image'; src: string; alt: string }[];
  link?: { href: string; label: string };
  references?: { note: string; links: { href: string; label: string }[] };
  caseStudy?: {
    context: string;
    structure?: { label: string; detail: string }[];
    sections: {
      heading: string;
      text: string;
      images?: { src: string; alt: string }[];
      mobile?: boolean;
    }[];
  };
}

// A separate English selection. Original gallery records and media are not edited.
export const designProjects: DesignProject[] = [
  {
    id: 'club-visual', title: 'The Club Visual', category: 'Web', status: 'In progress',
    subtitle: 'I’m designing the website and ways to start a project',
    description: 'The studio offers strategy, branding, production, content and digital experiences. I’m working on how to present that range, with clear next steps for visitors who know what they need and those who don’t.',
    contribution: 'My work covers web design, UX/UI and the brand experience, from the service structure to the Project Finder and the four-step project brief.',
    media: [{ type: 'image', src: '/design/club-visual/01-inicio.jpg', alt: 'The Club Visual homepage with bold typography, a director’s chair and two ways to start a project' }],
    link: { href: 'https://theclubvisual.com/', label: 'Visit The Club Visual' },
    caseStudy: {
      context: 'This project is still in progress. The screenshots show the current version on desktop and mobile.',
      sections: [
        {
          heading: 'Giving the services a clear place',
          text: 'I organized the offer into five areas, each with a recognizable name and a short explanation of what it covers. I wanted visitors to understand what the studio could help with before asking them to describe a project.',
          images: [{ src: '/design/club-visual/03-servicios.jpg', alt: 'The services page presenting five areas of work' }],
        },
        {
          heading: 'Two ways to get started',
          text: 'Someone with a clear idea can go straight to the project brief. Someone who needs help deciding can start with the Project Finder. I made both options visible from the homepage and kept them accessible through the navigation.',
          images: [{ src: '/design/club-visual/01-inicio.jpg', alt: 'Homepage with direct access to the project brief and the Project Finder' }],
        },
        {
          heading: 'A little guidance before the brief',
          text: 'I designed the Project Finder as a sequence of nine questions, starting with the stage of the business and its priorities. It shows one question at a time, with concrete options, a visible selection and a progress indicator.',
          images: [{ src: '/design/club-visual/05-quiz-pregunta.jpg', alt: 'Project Finder showing the first question, a selected answer and progress through nine questions' }],
        },
        {
          heading: 'Making the first conversation easier',
          text: 'I split the project brief into four steps. It starts with what the visitor needs and moves on to their goals, giving them a way to explain the project without having to write everything at once.',
          images: [{ src: '/design/club-visual/07-iniciar-proyecto.jpg', alt: 'The first step of the project brief with a list of project needs' }],
        },
        {
          heading: 'Keeping the studio’s personality',
          text: 'I used large Anton headlines, handwritten accents in Allura and Montserrat for the longer text. Dark backgrounds, cream and a muted blue-gray give the site its character, while the same visual choices carry through the services, quiz and brief.',
          mobile: true,
          images: [
            { src: '/design/club-visual/10-movil-inicio.jpg', alt: 'Mobile homepage with the studio’s typography and color palette' },
            { src: '/design/club-visual/11-menu-movil.jpg', alt: 'Mobile navigation with access to the studio’s pages and inquiry flows' },
          ],
        },
        {
          heading: 'Following the same path on mobile',
          text: 'I kept the brief’s step-by-step structure on smaller screens, with the current question and its options in focus. The visitor can follow the same path without losing the visual identity of the site.',
          mobile: true,
          images: [{ src: '/design/club-visual/12-brief-movil.jpg', alt: 'Mobile project brief with the current step and response options' }],
        },
      ],
    },
  },
  {
    id: 'bojana-online', title: 'Bojana Online', category: 'Product',
    subtitle: 'I designed and built a studio and client portal',
    description: 'Bojana’s team needs to track detailed project work, while clients need a clear view of progress and what needs their input. I designed separate spaces for each, connected through the same project.',
    contribution: 'I worked on UX/UI, information architecture and web development, including the shared visual system and mobile views.',
    media: [{ type: 'image', src: '/design/bojana-online/03-proyecto.jpg', alt: 'Bojana Online studio workspace with project phases, tasks and activity' }],
    caseStudy: {
      context: 'For Bojana Estudio, an architecture, engineering and construction studio. Screens shown with demo project data.',
      structure: [
        { label: 'Project', detail: 'Context and scope' },
        { label: 'Discipline', detail: 'Area of work' },
        { label: 'Phase', detail: 'Stage of the project' },
        { label: 'Task', detail: 'Actions and deliverables' },
      ],
      sections: [
        {
          heading: 'How I organized the information',
          text: 'I organized the portal around four levels: project, discipline, phase and task. This gives each update, file and response a place within the project, rather than leaving it as a separate message.',
        },
        {
          heading: 'A workspace for the studio',
          text: 'I organized the work into phases and tasks, with owners, statuses and related content. The team can prepare an update, decide when to publish it and follow the responses without leaving the project.',
          images: [{ src: '/design/bojana-online/03-proyecto.jpg', alt: 'Studio view showing project phases, task statuses and recent activity' }],
        },
        {
          heading: 'A clearer view for the client',
          text: 'I gave the client a summary of the current phase, progress and next milestone. From there, they can open the work that needs their attention without going through the team’s internal task list.',
          images: [{ src: '/design/bojana-online/06-cliente.jpg', alt: 'Client summary with project progress, current phase and a pending decision' }],
        },
        {
          heading: 'Keeping the decision with the work',
          text: 'I put approvals, choices and requests for changes in the same review flow. The client can select an option or leave a comment, and the response stays attached to the relevant work.',
          images: [{ src: '/design/bojana-online/07-revision.jpg', alt: 'Client review showing material alternatives, a comment field and response actions' }],
        },
        {
          heading: 'One visual system for both spaces',
          text: 'I used Newsreader and DM Sans with warm surfaces and a restrained palette. I kept buttons, status labels and form fields consistent so the studio and client spaces feel like parts of the same product.',
          images: [{ src: '/design/bojana-online/12-sistema.jpg', alt: 'Bojana Online visual system with typography, colors, buttons, status labels and form fields' }],
        },
        {
          heading: 'Making room for mobile',
          text: 'I also worked on mobile views for checking progress and reviewing a delivery. I kept the project context visible alongside the relevant choices and actions.',
          mobile: true,
          images: [
            { src: '/design/bojana-online/10-movil.jpg', alt: 'Mobile client view of the project summary' },
            { src: '/design/bojana-online/11-movil-revision.jpg', alt: 'Mobile view of a client review and response' },
          ],
        },
      ],
    },
  },
  {
    id: 'bojana-web', title: 'Bojana Estudio', category: 'Web',
    subtitle: 'I designed and built the website',
    description: 'For Bojana’s public website, I worked on how the studio presents itself online. I carried its visual identity into the pages, from the overall direction to the layout and imagery.',
    contribution: 'I handled the creative direction, page design and implementation. The walkthrough shows the website on desktop and mobile.',
    media: [{ type: 'video', src: '/videos/mockup-bojana.mp4', alt: 'Bojana Estudio website walkthrough' }],
    link: { href: 'https://www.bojana.com.ar/', label: 'Visit website' },
  },
  {
    id: 'bojana-brand', title: 'Bojana Estudio branding', category: 'Branding', hidden: true,
    subtitle: 'I worked on the visual identity',
    description: 'Alongside the website, I developed a visual identity for Bojana Estudio. These pieces show how I applied it in different formats.',
    contribution: 'I developed the visual identity and applied it across the pieces shown here, keeping the type, color and layout consistent.',
    media: [{ type: 'image', src: 'https://lh3.googleusercontent.com/d/1BVCiokw1sfMQl2DYuBuMLRrlm_gPBIif', alt: 'Bojana Estudio brand identity and applications' }],
  },
  {
    id: 'jewelry-web', title: 'Jewelry landing page', category: 'Web',
    subtitle: 'I designed the landing page',
    description: 'For this jewelry business, I focused on making the information easy to follow and the next step easy to find.',
    contribution: 'I worked on the layout, typography and imagery, giving the content and calls to action a clear order on the page.',
    media: [{ type: 'video', src: '/videos/MockStefanoSite.mp4', alt: 'Jewelry landing page walkthrough' }],
  },
  {
    id: 'agency-campaigns', title: 'Digital campaigns', category: 'Motion',
    subtitle: 'I created visuals and motion pieces',
    description: 'These three campaign pieces gave me room to work with movement and different visual treatments.',
    contribution: 'I used Midjourney and Runway to explore and generate visuals, then After Effects to put the motion pieces together.',
    media: [
      { type: 'video', src: '/videos/2bd9957c-54ad-484b-b108-02a980163122.mp4', alt: 'Digital campaign piece one' },
      { type: 'video', src: '/videos/374cf67d-2084-4eef-8240-6440cf0f43b6.mp4', alt: 'Digital campaign piece two' },
      { type: 'video', src: '/videos/97502817-cca1-402e-b9cc-11ce42915afa.mp4', alt: 'Digital campaign piece three' },
    ],
  },
  {
    id: 'illow', title: 'My work at illow and BigID', category: 'Product',
    subtitle: 'I worked across brand, web and product',
    description: 'I joined illow when it was a small team and stayed through its acquisition by BigID. My role changed along the way, from visual identity and digital marketing to UX and product design.',
    contribution: 'I led design across illow’s brand, website and core product experience. I also managed the WordPress site and worked directly with customers during the AppSumo launch.',
    references: {
      note: 'I’ve linked illow’s company page and the acquisition announcement so you can follow its story and see the team I was part of.',
      links: [
        { href: 'https://www.linkedin.com/company/illow/', label: 'illow on LinkedIn' },
        { href: 'https://www.linkedin.com/posts/rirarrazaval_thrilled-to-share-that-illow-has-been-activity-7341100368539377664-1ZLt', label: 'Read the acquisition announcement' },
      ],
    },
    media: [
      { type: 'image', src: 'https://lh3.googleusercontent.com/d/1RaXo5PfAY3AWsNuaJ9BVLhl1UVl-RN9p', alt: 'illow consent management platform design' },
      // Keep the original published video URL; the local video files stay untouched.
      { type: 'video', src: 'https://liadesign.site/videos/illowSite-Mock.mp4', alt: 'illow website walkthrough' },
    ],
  },
];
