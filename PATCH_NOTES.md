I moved static arrays, replaced index-based keys with stable keys where possible, memoized components with React.memo, and switched bar rendering to transform-based scaleX/scaleY to reduce layout thrash.

Files changed:
- src/components/ProjectMockups.tsx

Notes:
- I focused the patch on ProjectMockups where the mappings, inline styles, and index keys were most apparent. If you'd like, I can apply similar changes to other components (e.g., IllowCaseStudy.tsx) in a follow-up commit/PR.
