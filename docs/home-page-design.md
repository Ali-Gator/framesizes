# Home page (F1, `/`) — design handoff

The design was approved on 2026-11-10. This file lists what the design leaves open, unverified or
filled with placeholder data. Every item is closed, or dropped on purpose, before the page is
published. Delete an item in the PR that ships its fix; delete the file when it is empty.

- **Canvas (approved):** https://claude.ai/artifact/FA2okr9myNhQiZsaGdeuMD (boards: desktop 1280, phone 390)
- **Design system:** https://claude.ai/artifact/SFXVU5PvBaHDquyEefVDd5 (version `1794338676-9717`)
- **On-page SEO guide:** https://claude.ai/artifact/KbaLF8WnJ2jRWc55r5yfcx (row F1, pre-publish checklist)
- **Owner:** Tracker row T2 (size engine and frame size chart); T1 shipped the shell and SEO base.
  Take the items into the tasks of the change that owns them.

## Decided by the design

Do not reopen these without the user.

- Page order: h1, answer paragraph, widget, six common sizes, frame size by image size, large /
  square / horizontal, how to choose, questions, related tools, footer.
- h1 "Standard Frame Sizes"; the widget title "Frame size chart" is an `h2`.
- Widget: preview on the left (sticky), filters and table on the right. The table is the size
  chooser. Two views: "On a wall" (`ScalePreview`) and "All sizes" (`SizeCompare`).
- Filters in one row: Orientation, Preview, Next to (sofa, person, door). Sticky on desktop only.
- The in/cm toggle in the header drives the table's first column, the mat column, the drawing
  labels and the reference sentence.
- The preview shows the next size up as a dashed outline.
- Header: hub row on desktop, hub row under the logo from 600 to 900px, menu button under 600px.
- Not on this page: the visitor's own photo in a frame (belongs to F7), several frames above a sofa
  (belongs to G1).

## Open: size data (T2)

All numbers on the canvas are typed by hand. The size engine must own them.

- [ ] **Size list.** 12 rectangular and 5 square sizes are a draft. Confirm them against real US
      retail ranges. The meta description in the guide says "from 4x6 to 24x36" but the table ends
      at 27x40: make the two agree.
- [ ] **"Image with a mat" pairings.** Draft values. Define the rule in the engine spec, and what
      "No mat" means (no common pairing) so the cell text is true.
- [ ] **"Common use" text.** Draft copy for every row.
- [ ] **Six most common sizes.** The six frames are fixed-size boxes at 3.2 px per inch. Draw them
      from engine data at one scale.
- [ ] **Frame anatomy example.** Outside size 13 × 16 in assumes a 1 in moulding; mat opening
      7.5 × 9.5 in assumes a ¼ in overlap. Confirm both.
- [ ] **Scene constants.** Wall 8 ft, sofa 84 in wide with a 34 in back, frame hung 8 in above it,
      person 5 ft 9 in, door 80 × 30 in, centre line 57 in, moulding 1 in. Confirm and move them to
      the spec. The cm sentences (20, 213, 145, 175, 203 cm) are hard-coded strings in the design
      system bundle; compute them.
- [ ] **Facts in the prose.** Large and square size lists, the metric sizes in the cm question
      (A4, A3, 30 × 40, 50 × 70, 70 × 100 cm), "two-thirds as wide as the furniture", "a custom
      frame costs more", "the lip covers the print's edge". Check each and name the source
      (the guide asks for one source line).
- [ ] **"Last checked November 2026".** Replace with the real date of the size data.

## Open: widget behaviour (T2)

- [ ] **Sticky preview and filters.** Never seen working: the canvas does not scroll. Test in the
      real page. On a phone the sticky preview takes about 40% of the screen; check it on a device
      and shrink or unstick it if the table gets too little room.
- [ ] **Widget state in the URL.** The design keeps size, orientation, view and reference in
      memory. The guide wants them as query parameters on one URL with a clean canonical. (The unit
      is a site-wide preference from T1, never in the URL: `apps/web/src/lib/unit.ts`.)
- [ ] **Orientation switch.** Going to or from Square resets the selection (12x12 / 16x20).
      Decide the real rule.
- [ ] **Table rows as controls.** Rows are focusable `tr` elements with `aria-selected`. Review the
      pattern for screen readers before building it (a radio group or a button per row).
- [ ] **Server-rendered default state.** The table, the default preview (16x20, sofa) and the
      questions must be in the server HTML, and the widget must reserve its height (CLS).
- [ ] **Links to pages that do not exist yet.** The related block, the in-text links and "See it
      on my wall" point at 18 pages that ship later. Use `PageLink` and `livePages()` from T1 so a
      link shows only when its page is live (header and footer already do).
- [ ] **Text rules.** `8x10` with a letter x in headings and sentences, `8 × 10 in` in tables and
      drawings; Title Case for the `h1` only.
- [ ] **Social image.** T1's card shows the `h1` and the mark. Add the size diagram and rewrite
      the alt by the guide's size-chart formula (`apps/web/src/app/opengraph-image.tsx`).

## Open: SEO (T2 page)

The design covers only what a visitor sees. From the guide's F1 row and checklist (T1 shipped the
head tags, JSON-LD, `robots.txt`, `sitemap.xml` and the 404):

- [ ] Every number in the meta description appears on the page (checklist 6): "4x6" and "24x36"
      are not on the placeholder page yet.
- [ ] Each question is an `h3` (the design system's FAQ renders a bare `summary`).
- [ ] Alts for the six-sizes drawing and the frame anatomy drawing, by the guide's formulas, no
      two alike. The widget's alts already follow the guide.
- [ ] On a real phone the h1, the answer and the top of the widget show without scrolling.
- [ ] All 16 checks of the guide's pre-publish checklist pass on the built HTML.

## Not verified in the design

- The canvas render itself. The design system components were rendered locally at 1400, 768, 390,
  360 and 320px, in inches and cm; the page on the canvas was not.
- Artboard heights (4900 and 9400) are estimates.
- "Related tools" is 18 stacked cards on a phone, about 2,400px tall. Not reviewed.
