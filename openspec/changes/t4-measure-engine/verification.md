# Allowance verification (task 2.1)

Checked on 2026-11-22. Every number in the delta spec matches its source; nothing in the spec or the tolerance changes.

| Allowance                     | Spec value                            | Source says                                                                                                       | Match |
| ----------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----- |
| Frame lip                     | ¼ in on each side                     | Frame It Easy: a frame's lip overlaps the art by ¼ in on all four sides (article "The 1/4" Overlap")              | yes   |
| Recess (rabbet) allowance     | up to ⅛ in over the nominal size      | Framing 4 Yourself: an 11x14 frame's recess measures 11⅛ × 14⅛ in, because the cutter "included an allowance"     | yes   |
| Pre-cut mat opening           | ½ in under the print (8x10 → 7½ × 9½) | Blick and Crescent sell 11 × 14 in pre-cut mats for an 8 × 10 print with a 7½ × 9½ in opening (product titles)    | yes   |
| Metric ready-made frame sizes | 30 × 40, 40 × 50, 50 × 70 cm          | IKEA UK's frame size guide lists 30 × 40, 40 × 50 and 50 × 70 cm, and names 30x40 and 50x70 among its most chosen | yes   |

Notes:

- A UK retailer (eframe) says its frames' lip covers 2 to 3 mm of the print. The front path with that lip comes out at most 0.3 in small, inside the ⅜ in tolerance, and `lip` is a parameter if the page ever needs it. The ¼ in default stays.
- Framers vary the recess allowance (¹⁄₁₆ to ³⁄₁₆ in on canvas, per woodworking forums). ⅜ in absorbs the largest with room for a tape read to the nearest ⅛ in.
- Some sellers label a mat by the print it takes and cut a full-size opening (Michaels sells an 11 × 14 mat with an 8 × 10 opening). The engine follows the common pre-cut convention, ¼ in overlap per side; `overlap` is a parameter.
- The metric sizes are a retail convention, not a standards-body size, and a separate grid from the A series.

Sources (each read on 2026-11-22 unless marked):

- Lip: https://frameiteasy.com/learn/?p=651 (article title "Custom Picture Framing: The 1/4” Overlap"); eframe (2 to 3 mm): https://www.eframe.co.uk/support/measuring-guide (search summary only)
- Recess allowance: https://framing4yourself.com/?p=32366
- Mat opening: https://www.dickblick.com/items/blick-black-core-pre-cut-mat-11-x-14-w-7-12-x-9-12-opening-, https://www.dickblick.com/items/crescent-pre-cut-mat-arctic-white-11-x-14-7-12-x-9-12-opening/ (product titles), https://www.michaels.com/product/11-x-14-picture-frame-mat-by-studio-decor-8-x-10-opening-10083808
- Metric frames: https://www.ikea.com/gb/en/rooms/living-room/how-to/finding-the-right-picture-frame-pubb930a400
