# F7 designer prompt

Paste everything below the line into the AI designer.

---

Design one page for framesizes.app: F7 "Poster and Frame Mockup Generator" at /frame-mockup. It is a tool page. A visitor uploads a design or a print file, sees it framed on a wall at true scale, picks a frame size, a frame style, a mat and a wall, and downloads the picture as a PNG. Designers and print sellers use it to show a print framed. Anyone with a print uses it to see how it will look. Everything runs in the browser; nothing is uploaded to a server.

## Use these

- Design system: https://claude.ai/artifact/SFXVU5PvBaHDquyEefVDd5. Use its tokens, type, size chips, segmented control, buttons, file drop area and result cards.
- Closest approved pages. Follow their layout:
  - F2 Frames on your wall: https://claude.ai/artifact/AzNYiLnMFAN8rg8eeMaXZX. Use its tool page layout, its sample room, its frame drawing (1 in moulding at true scale) and its photo upload area.
  - The sample room v2 (boards "Sample room v2") on https://claude.ai/artifact/WUq26q5aNBxfiKUTYcaCwv: lamp light, baseboard, wood floor, cushioned sofa, plant, on the same 144 × 96 in wall. Draw F7's wall from it.
  - F6 Poster frame sizes: https://claude.ai/artifact/43JSmmnTJHtj55WBpR84qT. Use its size chips (US then A-series), its mat switch and its in/cm handling.

## Head values (verbatim, do not reword)

- Title: Poster & Frame Mockup Generator | Frame Sizes
- h1: Poster and Frame Mockup Generator
- Description: Upload your artwork, pick a frame style and a wall, and download a framed poster mockup as a PNG. It runs in your browser, with no account.
- Head keyword: poster mockup. Put it in the h1 and in the first sentence.
- Secondary keywords. Each one gets one heading, step or question, in natural words:
  - frame mockup
  - picture frame mockup
  - wall art mockup
- The description is a promise. The widget must offer more than one frame style and more than one wall, must download a PNG, and must need no account.

## Page sections (tool page outline)

1. Breadcrumb: Home › Poster and frame mockup.
2. h1, then one sentence: what it does and for whom. Example of the facts it must hold: upload a JPEG or PNG, see it in a frame on a wall at true size, download a PNG; your file stays on your device.
3. The widget.
4. h2 "How to use the mockup generator": numbered steps (upload, pick a size, pick a style and a mat, pick a wall, download).
5. h2 with the reference answer (see Q10): which frame sizes have which shape, so a designer knows what pixel shape to export.
6. h2 sections for the common cases, one per secondary keyword: a frame mockup (close-up), a picture frame mockup for a photo, a wall art mockup in a room.
7. h2 Questions: three to six questions, two or three sentences each. Examples: Is my artwork uploaded? (No, it stays in the browser.) Why is part of my artwork cut off? What size is the PNG? Can I use the mockup in my shop listing?
8. h2 Related tools: Poster frame sizes, Frames on your wall, Gallery wall planner, Frame and mat calculator, Frame size chart, and Poster sizes (shown only once that page is live).

Rules for the copy:

- Link to the Gallery wall planner (/gallery-wall-planner) and, once live, Poster sizes (/poster-sizes). The anchor "poster sizes" always means /poster-sizes.
- Do not list "sizes that fit your artwork without cropping" as a feature, and do not rate print sharpness or DPI. Those are the Art print sizes and DPI checker pages; link to them in copy if the canvas mentions them.
- Every size is written as 24x36 in headings and sentences, and as 24 × 36 in / 61 × 91.4 cm in the widget. Both units are in the HTML; the in/cm switch shows one. A-series sizes lead with mm: A2 (420 × 594 mm).
- The visitor's upload is labelled "Your artwork" and is never indexed.
- Plain copy: short sentences, no marketing tone. Keep every fact, size and keyword. The copy gets a humanizer pass later.

## The widget

Steps:

1. Upload artwork: a drop area and a button ("Choose a JPEG or PNG"). Before any upload, a sample artwork is in the frame (Q2).
2. Pick a frame size from chips. Each chip shows how much of the artwork that size cuts off (Q1, Q3).
3. Pick a frame style (Q4) and "No mat" or "Mat" (Q9).
4. Pick a wall (Q5) and a view: the whole wall or a close-up (Q7).
5. Drag the artwork inside the frame to choose what is cut (Q3).
6. Download PNG (Q8).

The engine's rules:

- Sizes offered: the 19 standard US frame sizes and A3, A2 and A1, turned to the artwork's shape. Portrait artwork gets 17 portrait sizes (4x6 … 27x40, A3, A2, A1); landscape artwork the same 17 turned (6x4 … 40x27); square artwork (sides within 5% of each other) the five square sizes (8x8, 10x10, 12x12, 16x16, 20x20).
- The artwork fills the opening edge to edge and is never stretched. A size of another shape cuts part of it; the chip shows that share as a whole percent.
- On upload, the mockup opens on the size that cuts least. When several cut within 1 point of the least, the largest wins.
- With a mat: a frame sold with a pre-cut mat uses it (the mat overlaps the artwork ¼ in on each side); a frame with no pre-cut mat gets a 2 in mat. A 4x6 has no room for a mat: with the mat on, its chip is disabled; with 4x6 picked, the Mat option is disabled with the line "A 4x6 has no room for a mat." Switching the mat keeps the size picked; only the cut changes.
- The frame hangs at true scale on a 144 × 96 in (12 × 8 ft) wall, centred across it: above the sofa with its bottom 8 in over the 34 in sofa back, or on a plain wall (the same room with no sofa) with its centre 57 in above the floor. Every frame has a 1 in moulding.
- Close-up view: the frame plus a quarter of its longer outside side all round.
- PNG: the view's longer side is 2,400 px.

Real numbers from the engine:

| Artwork                       | Opens on                         | Cut by size, no mat                                                                             |
| ----------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| Sample / 2:3, 2000 × 3000 px  | 24x36 (24 × 36 in, 61 × 91.4 cm) | 4x6, 12x18, 20x30, 24x36: 0% · 27x40: 1% · 11x17: 3% · A3, A2, A1: 6% · 16x20: 17% · 20x24: 20% |
| 3:4, 3000 × 4000 px           | 18x24                            | 12x16, 18x24: 0% · 8.5x11: 3% · 11x14: 5% · 16x20: 6% · 24x36: 11%                              |
| Landscape 3:2, 3000 × 2000 px | 36x24                            | the 2:3 row, turned                                                                             |
| Square, 2000 × 2000 px        | 20x20                            | every square size 0%                                                                            |
| A-series file, 2480 × 3508 px | A1 (594 × 841 mm)                | A3, A2, A1: 0% · 5x7: 1% · 27x40: 5% · 24x36: 6%                                                |

With a mat, for the sample 2:3 artwork:

- 24x36 uses its pre-cut mat for a 20x30 print. The opening is 19½ × 29½ in (49.5 × 74.9 cm). The mat border is 2¼ in at the sides and 3¼ in at the top and bottom. The cut is 1%.
- 16x20 uses its pre-cut mat for an 11x14 print: opening 10½ × 13½ in, cut 14%.
- 20x30 has no pre-cut mat, so it gets a 2 in mat: opening 16 × 26 in, cut 8%.

On the wall, for 24x36:

- Above the sofa, the frame's outside is 26 × 38 in (66 × 96.5 cm), bottom edge 42 in, top edge 80 in above the floor.
- On a plain wall, it runs from 38 in to 76 in.
- The close-up is 45 × 57 in of wall.
- PNG sizes: the whole wall 2,400 × 1,600 px; the 24x36 close-up 1,895 × 2,400 px.

## Every state to draw

- First screen before any upload: the sample artwork in a 24x36, no mat, the first style, above the sofa, whole wall (Q2).
- After an upload: a portrait (2:3 on 24x36), a landscape (3:2 on 36x24) and a square (20x20) artwork. Also a size that cuts a lot (2:3 in 16x20, 17%), with the cut part shown while dragging.
- Mat off and on (24x36 with its pre-cut mat; 20x30 with a 2 in mat), the 4x6 chip disabled with the mat on, and the Mat option disabled with 4x6 picked.
- Each frame style (Q4), each wall (Q5), the whole wall and the close-up (Q7).
- Upload states: dragging a file over the drop area; reading a large file ("Opening your artwork…"); a file that fails ("Your browser cannot open this file. Try a JPEG or a PNG."); a file that is not an image. A failed upload keeps the last artwork in the frame.
- Replace artwork: the visitor uploads a second file; the frame size jumps to the new file's least-cut size.
- Back: "Use the sample again" removes the visitor's artwork and returns the sample on 24x36; the style, mat, wall and view stay as picked.
- Download: the button, the moment while the PNG is made, and done (the file "frame-mockup-24x36.png" saved).
- Inches and cm (the site's in/cm switch in the header changes every size on the page).
- Keyboard: the artwork can be moved with arrow keys as well as by dragging.

## Boards

- Desktop 1280 and phone 390 for the whole page.
- Phone first: on a 390 screen the h1, the sentence and the mockup show without scrolling, with the upload button in reach.

## Open product questions

Show the recommended option (A) on the boards. Note the other options in a margin note. Q8 is a money question for the site owner; draw A and mark it.

- Q1. Sizes. A: the 19 US frame sizes plus A3, A2 and A1, turned to the artwork, each chip with its cut. B: the ten F6 poster sizes only (11x17 to 27x40, A3, A2, A1).
- Q2. First screen. A: a sample artwork already framed (2:3, on 24x36, no mat, above the sofa), so a mockup shows at once; uploads replace it. The sample is an original design the site owns (not a known artwork or a look-alike), drawn as a light vector at 2:3 so it loads fast above the fold and stays sharp in the export. B: an empty frame that says "Upload your artwork".
- Q3. Artwork of another shape. A: fill the opening and cut the rest, show the cut on the chip, and let the visitor drag the artwork to choose what is cut. B: show the whole artwork with mat-coloured bands where it does not fill.
- Q4. Frame styles. A: four styles, all with the same 1 in moulding: black, white, light oak, walnut. B: six, adding gold and thin silver metal (½ in moulding).
- Q5. Walls. A: two sample walls in the v2 room: above the sofa, and a plain wall (the same room with the sofa removed) at the 57 in centre line; a line links to Frames on your wall for the visitor's own wall photo. B: also upload your own wall photo here (F2's photo and scale steps).
- Q6. Wall colour. A: the v2 room's wall colour only. B: three wall colours to pick from (light, warm, dark).
- Q7. Views. A: the whole wall and a close-up; the download saves the view on screen. B: the close-up only.
- Q8. Export (money). A: a free PNG at 2,400 px on its longer side, no watermark; a larger "HD" export is kept for a later Pro tier. B: a free PNG at 1,200 px with a small "framesizes.app" mark in a corner, 2,400 px later in Pro.
- Q9. Mat. A: a No mat / Mat switch: the pre-cut mat where one is sold, else a 2 in mat, white. B: a mat width picker (1½, 2, 2½, 3 in), as on the frame and mat calculator.
- Q10. The reference section. A: a short table of frame shapes: 2:3 (4x6, 12x18, 20x30, 24x36), 3:4 (12x16, 18x24), 4:5 (8x10, 16x20), A-series 1:1.41 (A3, A2, A1), square (8x8 to 20x20), with one line that links to Art print sizes for the full answer. B: no table; the steps and the questions only.
