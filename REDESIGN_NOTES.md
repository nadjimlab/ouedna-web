# Ouedna — World-Class Redesign

## What changed
- Added `app/world-class.css` as the final visual layer for the public platform.
- Reworked the visual hierarchy of the home page: immersive hero, editorial spacing, premium destination cards, virtual-tour section, itinerary CTA and heritage storytelling.
- Refined header, navigation, CTA buttons, page heroes, cards and footer.
- Added responsive layouts for tablet/mobile widths.
- Preserved the existing Next.js/React/Supabase architecture and routes.
- Preserved existing maps, archive, community, itinerary, favorites, download and admin functionality.

## Run
```bash
npm install
npm run dev
```

For production:
```bash
npm run build
npm start
```

## Notes
The redesign is implemented as a final CSS layer so existing business logic and page components remain intact. The original uploaded project did not include `node_modules`; dependency installation was therefore not packaged in the archive.
