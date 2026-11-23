# F6 designer prompt

Paste everything below the line into the AI designer.

---

Design one page for framesizes.app: F6 "Poster Frame Sizes" at /poster-frame-sizes. It is a chart page with a widget. A visitor picks a poster or art print size and sees which frame fits it, with or without a mat.

## Use these

- Design system: https://claude.ai/artifact/SFXVU5PvBaHDquyEefVDd5. Use its tokens, type, size chips, segmented control, result cards and table.
- Closest approved pages. Follow their layout:
  - F5 Frame and mat calculator: https://claude.ai/artifact/PjZ5GizsgyTKMvx6nAfdRp. Use its result cards ("pre-cut frame", border numbers) and its mat drawing.
  - Home page frame size chart: https://claude.ai/artifact/FA2okr9myNhQiZsaGdeuMD. Use its chart page layout, size table and phone picker.

## Head values (verbatim, do not reword)

- Title: Poster Frame Sizes Chart: With or Without a Mat
- h1: Poster Frame Sizes
- Description: Find the frame that fits your poster or painting: standard poster frame sizes from 11x17 to 27x40, with or without a mat, in inches and cm.
- Head keyword: poster frame sizes. Put it in the h1 and in the first paragraph.
- Secondary keywords. Each one gets one heading, table caption or question, in natural words:
  - standard poster frame sizes
  - painting frame sizes
  - poster frame sizes chart
  - standard print frame sizes
  - typical poster frame sizes

## Page sections (chart page outline)

1. Breadcrumb: Home › Poster frame sizes.
2. h1, then a one or two sentence answer with numbers. Example of the facts it must hold: a poster without a mat takes a frame of its own size (an 18x24 poster takes an 18x24 frame); with a mat it takes a bigger frame (an 11x17 poster takes a 16x20 or an 18x24 frame).
3. The widget.
4. h2 "Poster frame sizes chart": one table, one row per poster size (see the numbers below).
5. h2 sections per size group: small posters (11x17, 12x18, 16x20), large posters (18x24, 20x30, 24x36, 27x40), A-series posters (A3, A2, A1).
6. h2 about painting frame sizes (see Q7).
7. h2 "How to choose a poster frame": short steps (measure the poster, decide on a mat, pick the frame).
8. h2 Questions: three to six questions, two or three sentences each.
9. h2 Related tools: Frame size chart, Frames on your wall, How big is 8x10, Measure a picture frame, Frame and mat calculator, and Poster sizes (P1, shown only once that page is live).

Rules for the copy:

- The anchor text "poster sizes" always links to the Poster sizes page (/poster-sizes), never to this page.
- The table maps a poster to its frame. Do not turn it into a list of poster sizes: that is the Poster sizes page.
- Every size is written as 24x36 in headings and sentences, and as 24 × 36 in / 61 × 91.4 cm in tables. Both units are in the HTML; the in/cm switch shows one. A-series sizes lead with mm: A2 (420 × 594 mm).
- Plain copy: short sentences, no marketing tone. Keep every fact, size and keyword. The copy gets a humanizer pass later.

## The widget

Steps:

1. Pick a poster size from chips: 11x17, 12x18, 16x20, 18x24, 20x30, 24x36, 27x40, A3, A2, A1. Or type a custom size (Q2).
2. Pick "Without a mat" or "With a mat" (a segmented control).
3. Portrait or landscape (Q8).
4. Read the answer, with a drawing of the poster in its frame at the same scale.

The engine's rules:

- Without a mat, the frame is the poster's own size. If that is a standard US frame, name it. If it is within ⅜ in of a metric frame (A3), name that. Otherwise it is a custom size, with the nearest standard sizes below and above.
- With a mat, list the standard frames that hold the poster: every frame sold with a pre-cut mat for it, plus every standard frame whose mat border is 1 to 4 in on every side. Each frame shows its border at the sides and at the top and bottom. The mat overlaps the poster by ¼ in on each side, and the numbers below include it.

Real numbers from the engine. Borders are sides / top and bottom, in inches, then cm:

| Poster                            | Without a mat                                      | With a mat                                                                                                |
| --------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 11x17 (27.9 × 43.2 cm)            | 11x17 frame                                        | 12x18, pre-cut (¾ / ¾ in; 1.9 / 1.9 cm); 16x20 (2¾ / 1¾ in; 7 / 4.4 cm); 18x24 (3¾ / 3¾ in; 9.5 / 9.5 cm) |
| 12x18 (30.5 × 45.7 cm)            | 12x18 frame                                        | 16x20 (2¼ / 1¼ in; 5.7 / 3.2 cm); 18x24 (3¼ / 3¼ in; 8.3 / 8.3 cm)                                        |
| 16x20 (40.6 × 50.8 cm)            | 16x20 frame                                        | 18x24, pre-cut (1¼ / 2¼ in; 3.2 / 5.7 cm); 20x24, pre-cut (2¼ / 2¼ in; 5.7 / 5.7 cm)                      |
| 18x24 (45.7 × 61 cm)              | 18x24 frame                                        | 20x30 (1¼ / 3¼ in; 3.2 / 8.3 cm)                                                                          |
| 20x30 (50.8 × 76.2 cm)            | 20x30 frame                                        | 24x36, pre-cut (2¼ / 3¼ in; 5.7 / 8.3 cm)                                                                 |
| 24x36 (61 × 91.4 cm)              | 24x36 frame                                        | 27x40 (1¾ / 2¼ in; 4.4 / 5.7 cm)                                                                          |
| 27x40 (68.6 × 101.6 cm)           | 27x40 frame                                        | no standard frame (Q4: a 2 in mat needs a 30½ × 43½ in, 77.5 × 110.5 cm, custom frame)                    |
| A3 (297 × 420 mm, 11.7 × 16.5 in) | A3 frame                                           | 16x20 (2⅜ / 2 in; 6.1 / 5 cm); 18x24 (3⅜ / 4 in; 8.6 / 10.1 cm)                                           |
| A2 (420 × 594 mm, 16.5 × 23.4 in) | no US standard size; 16x20 below, 18x24 above (Q6) | 20x30 (2 / 3½ in; 5 / 9 cm)                                                                               |
| A1 (594 × 841 mm, 23.4 × 33.1 in) | no US standard size; 20x30 below, 24x36 above (Q6) | 27x40 (2 / 3¾ in; 5.2 / 9.4 cm)                                                                           |

A landscape poster gets the same frames turned: a 17x11 poster takes a 17x11 frame, or 18x12, 20x16 and 24x18 with a mat.

A custom size works the same way. 13x19 without a mat: no standard size, 12x18 below and 16x20 above. 13x19 with a mat: 18x24 (2¾ / 2¾ in; 7 / 7 cm), 20x24 (3¾ / 2¾ in; 9.5 / 7 cm).

Each poster chip or table row may carry a short use line, such as 27x40 "Movie posters" or 11x17 "Small posters and flyers". Draw them; the engine stores the lines the canvas settles.

## Every state to draw

- Each answer card: a standard frame (24x36 without a mat), a metric frame (A3 without a mat), a custom answer (A2 without a mat, typed 13x19), a list of frames with a mat (11x17: three cards, one pre-cut), a single frame with a mat (24x36 → 27x40), and no frame with a mat (27x40).
- Pre-cut and not pre-cut frames side by side, so the difference is clear.
- Landscape (17x11 with a mat).
- The custom size field: empty, filled, and bad input (0, a letter, a negative). Bad input says "Enter a width and a height above 0." and shows no answer.
- Back: from a custom size back to the chips, with the last chip selected.
- Inches and cm (the site's in/cm switch in the header changes every number on the page).
- The chart table, and the table on a phone.

## Boards

- Desktop 1280 and phone 390 for the whole page.
- Phone first: on a 390 screen the h1, the answer and the top of the widget show without scrolling.

## Open product questions

Show the recommended option (A) on the boards. Note the other option in a margin note.

- Q1. Poster sizes. A: the ten sizes above. B: the seven US sizes only.
- Q2. A typed size. A: a "Custom size" field (width × height, in or cm, fractions allowed), as on F5. B: chips only.
- Q3. Which frames count "with a mat". A: pre-cut frames plus any standard frame with a 1–4 in border on every side, shown with both borders, uneven ones as they are. B: also mark a mat as "uneven" when its borders differ by more than 1 in. C: pre-cut frames only.
- Q4. A poster with no standard frame for a mat (27x40). A: say so, give the exact frame for a 2 in mat (30½ × 43½ in, a custom frame), and link to the frame and mat calculator. B: say "no standard frame" only.
- Q5. 24x30 and 30x40 frames. They would give the 18x24 and 24x36 posters an even mat, but the site's frame list stops at 27x40. A: not now. B: add them (this changes the home page chart and three other pages).
- Q6. A2 and A1 without a mat. A: "Use an A2 frame (420 × 594 mm)", the frame sold under the paper's name, then the nearest US frame that takes it with a mat. B: "No US standard size", with the sizes below and above.
- Q7. Painting frame sizes. A: one copy section: a painting on canvas takes a frame of the canvas's own size, with no mat or glass; give common sizes as examples (11x14, 16x20, 18x24, 24x36). B: a canvas size picker in the widget.
- Q8. Orientation. A: portrait by default, with a portrait / landscape switch. B: portrait only.
- Q9. Default state. A: 24x36, without a mat. B: 18x24, without a mat.
- Q10. The chart table. A: one row per poster: poster size, frame without a mat, frames with a mat (with borders). B: two tables, one without and one with a mat.
