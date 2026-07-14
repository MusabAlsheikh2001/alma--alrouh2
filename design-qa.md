# Design QA

- Source visual truth: `/Users/musab/Alma--Alrouh2/output/reference/unicef-home-chrome.png`
- Primary implementation screenshot: `/Users/musab/Alma--Alrouh2/output/qa/alma-final-english-desktop.png`
- Arabic implementation screenshot: `/Users/musab/Alma--Alrouh2/output/qa/alma-revised-arabic-desktop.png`
- Mobile implementation screenshot: `/Users/musab/Alma--Alrouh2/output/qa/alma-revised-mobile.png`
- Viewports: desktop 1463 × 721; mobile 390 × 843
- States: English/light, Arabic/RTL/light, English/dark token verification, donation dialog, selected donation amount, mobile layout

## Full-view comparison evidence

The UNICEF source and Alma Alrouh desktop implementation were opened together and compared at the same desktop state. The implementation intentionally adapts rather than clones the source: it preserves the source's documentary human image, confident blue, high-contrast editorial hierarchy, direct action language, and restrained navigation while using Alma Alrouh's own identity, content, and support actions.

## Focused comparison evidence

- Hero: `alma-final-english-desktop.png` confirms the image crop, blue copy panel, readable CTA hierarchy, moderate title scale, and visible trust indicators.
- Impact: `alma-revised-impact.png` confirms a single clear heading/body row and four equal stat cards.
- Care: `alma-revised-care.png` confirms four equal, ordered steps with a single support CTA.
- Programs: `alma-revised-programs.png` confirms six equal-size cards and consistent icon/title rhythm.
- Volunteer: `alma-revised-volunteer.png` confirms the section no longer dominates the page and exposes the real Google Form CTA.
- Donate: `alma-revised-donate.png` confirms a distinct donation section with a clear action and rationale.
- Contact: `alma-revised-contact.png` confirms three consistent contact cards and a separated safety notice.
- Mobile: `alma-revised-mobile.png` confirms image-first stacking, compact typography, reachable primary actions, and usable header controls.

## Required fidelity surfaces

- Fonts and typography: system sans stack is crisp and resilient; heading scale and line-height are consistent across English and Arabic; no clipping or truncation found.
- Spacing and layout rhythm: 1320px content frame, repeated card gaps, radii, and section spacing are consistent; desktop and mobile stacks remain readable.
- Colors and tokens: UNICEF-inspired blue is used as the primary brand/action color; light and dark tokens settle to the intended backgrounds and header colors with sufficient contrast.
- Image quality and asset fidelity: the 1717 × 916 documentary-style support image is sharp, correctly cropped, and used as a real image asset; the supplied logo remains crisp at display size.
- Copy and content: support, volunteer, donation, partnership, and crisis-safety copy is standalone and action-oriented in English and Arabic.
- Icons and controls: one consistent icon family is used; header, theme, language, navigation, donation, and amount-selection controls are implemented and labelled.
- Accessibility: semantic headings and landmarks, skip link, focus rings, translated labels, alt text, reduced-motion handling, RTL direction, and practical tap targets are present.

## Findings

No actionable P0, P1, or P2 findings remain. Differences from the UNICEF source are intentional brand/content adaptations rather than fidelity defects.

## Patches made during QA

- Rebuilt the hero around a full-bleed human image and compact blue information panel.
- Reduced the site-wide display scale and mobile heading sizes.
- Reorganized impact, care, programs, volunteer, donate, and contact into consistent grids.
- Fixed the dark-theme header selector and verified settled light/dark tokens.
- Made hero actions immediately visible on mobile.
- Added the live volunteer form URL and verified both volunteer links.
- Verified English/Arabic switching, RTL, donation dialog, and donation amount state.

## Follow-up polish

No blocking polish items remain.

final result: passed
