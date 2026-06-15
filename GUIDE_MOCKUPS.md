# Modification and Case Addition Guide (Mockups) 📝🚀

This guide explains in detail the architecture implemented in the repository so that you can edit, duplicate, and add new study cases ("cards" or experiences) and customize their respective interactive mockup areas directly in code.

---

## 1. Portfolio Experiences Architecture

The project showcase features a decoupled architecture based on three key elements in the `/src` directory:

1. **`src/data/useCases.ts`** (The data source):
   * Contains a JSON array of objects with the complete text content of each case study (Title, Role, Challenge, Results, Tags, Icon, etc.).
   * Each item includes a key property: `"mockupType"`. The value of this field (e.g. `'analytics'`, `'wireframe'`, `'design-tokens'`) defines which interactive visual simulation will render inside the card when expanded by the user.

2. **`src/components/ProjectMockups.tsx`** (Visual templates):
   * Contains ready-to-use, fully styled interactive mockup interfaces (metrics panel, skeletal layouts/wireframes, design token dictionaries).

3. **`src/App.tsx`** (Dynamic rendering engine):
   * Coordinates UI states, filter badges, scroll animations, and reads the `mockupType` property dynamically to render its respective visual design template.

---

## 2. How to Add a New Experience Study Case

You do not need to edit any complex component logic or CSS in `src/App.tsx` to add a new card safely. Everything is designed to auto-discover and map from the static values in your data list.

### Step-by-Step:

1. Open **`src/data/useCases.ts`**.
2. Identify a complete representation object within the array enclosed by braces `{ ... }`, for example:
   ```typescript
   {
     id: "new-experience-id",
     title: "Educational Platform Restructure",
     role: "Lead Product Designer",
     challenge: "Address high dropout rates by redesigning curriculums and structural UX modules...",
     result: "A 38% increase in module completions, plus standard-setting accessibility levels...",
     tags: ["UX Research", "B2B", "SaaS", "Optimization"],
     icon: "school", // Use any valid Google Material Icons identifier
     client: "EdTech Corporation",
     date: "Q1 2026",
     impact: [
       { label: "Completions Rate", value: "+38%" },
       { label: "Student Rated Value", value: "4.9/5" }
     ],
     deepDive: "We designed modular navigation paths, standardized interface variables, and engineered highly testable UI prototypes...",
     mockupType: "analytics" // Choose 'analytics', 'wireframe', or 'design-tokens'
   },
   ```
3. Paste the block at the end of the array (ensure separate items are divided correctly with a comma `,`).
4. Save the file. **Your new card will render automatically** in the portfolio section with full micro-animations, tags filtering, and reactive expandable states!

---

## 3. How to Customise or Create New Interactive Mockups

If you want to edit current dashboards or build a new custom simulation screen, modify **`src/components/ProjectMockups.tsx`**.

By default, you have three built-in modes:
* **AnalyticsMockup (`mockupType: 'analytics'`)**: Ideal for SaaS, data platforms, or analytics-centered projects (charts, performance statistics, and responsive grid layouts).
* **WireframeMockup (`mockupType: 'wireframe'`)**: Perfect for wireflows, flowcharts, logic architecture, and wireframe prototypes.
* **DesignTokensMockup (`mockupType: 'design-tokens'`)**: Perfect for Design Systems, displaying typography stacks, color palettes, and component states.

### To add a new custom Mockup type:

1. Open **`src/components/ProjectMockups.tsx`**.
2. Define your functional component at the bottom using Tailwind utility classes:
   ```tsx
   export function MobileUiMockup() {
     return (
       <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 space-y-4">
         <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
           <span className="text-xs font-black tracking-widest text-[#be123c]">MOBILE INTERFACE</span>
           <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
         </div>
         <p className="text-xs text-neutral-400">Insert custom mockups representation components here...</p>
       </div>
     );
   }
   ```
3. Export your component.
4. Open **`src/App.tsx`**, import the new component:
   ```typescript
   import { AnalyticsMockup, WireframeMockup, DesignTokensMockup, MobileUiMockup } from './components/ProjectMockups';
   ```
5. Update your mockup renderer mapper (look for `renderMockup` helper):
   ```tsx
   const renderMockup = (type?: string) => {
     switch (type) {
       case 'analytics':
         return <AnalyticsMockup />;
       case 'wireframe':
         return <WireframeMockup />;
       case 'design-tokens':
         return <DesignTokensMockup />;
       case 'mobile-ui': // Your custom key
         return <MobileUiMockup />;
       default:
         return <AnalyticsMockup />;
     }
   };
   ```
6. Perfect! Switch your study case on `src/data/useCases.ts` to use `"mockupType": "mobile-ui"`.

---

## 4. Git and GitHub Best Practices

To safeguard your main branch, follow this streamlined cycle when updating content:

1. **Create an isolated branch**:
   ```bash
   git checkout -b feature/update-portfolio
   ```
2. **Implement your changes**:
   * Add text blocks in `src/data/useCases.ts`.
   * Customize layout files in `src/components/ProjectMockups.tsx`.
3. **Validate locally**:
   * Test structures, formatting, and build compliance by running: `npm run build`
4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add work examples and update mockup layouts"
   git push origin feature/update-portfolio
   ```
5. **Create a Pull Request**: Connect other branches to `main` with clear context logs.

---

## 5. Modifying the Hero Section Showcase Mockup (Branding + Product + Business) 🎨✨

The newly added Hero space acts as an interactive showcase illustrating your complete end-to-end strategy.

By default, this renders a **dynamic interactive layout template** with three automated steps highlighting step-by-step pivots.

If you want to swap this interactive card for an **image file, a custom visual GIF, or a demo video background MP4/MPG**, you can modify this easily.

### Location:
Open **`src/components/DifferentialMockup.tsx`**. At the top, locate:

```typescript
export const DIFFERENTIAL_CONFIG = {
  // Mockup Text Elements
  title: "End-to-End Synergy",
  subtitle: "Branding + Product + Business",
  description: "My design methodology connects three essential pillars to guarantee that sensory beauty directly drives functional utility and enterprise growth.",
  
  // Custom Media Configuration (Self-Hosted Video, Image or high-rez GIF):
  media: {
    useMedia: false, // ⚠️ SWITCH THIS TO TRUE TO REPLACE THE INTERACTIVE LAYOUT WITH YOUR MEDIA
    type: "image",   // Use "image" for photography, PNG files, vector paths, or GIFs. Use "video" if you have a local or remote video.
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop", // Remote or relative assets root path
    alt: "Extreme Differential Strategy • Lia Parra",
    dimensions: {
      width: "w-full",      // Dynamic width setup
      height: "h-[300px]",  // 📐 HEIGHT MEASUREMENTS. Edit parameters to match your custom asset aspects.
    }
  }
};
```

### Ideal Asset Proportions:
- **Aspect Ratio**: **16:9** or **4:3** (Horizontal orientation).
- **Recommended Resolution**: **1200 x 800 px** or higher.
- **Custom GIFs**: Videos are highly optimized. If utilizing MP4 files, the player handles standard tags like autoplay, infinite looping, and muted plays natively.
