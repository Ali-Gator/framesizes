# Reference length verification (task 2.1)

Checked on 2026-11-15. Every number in the delta spec matches its source; nothing in the spec changes.

| Thing            | Spec value       | Source says                                                                                   | Match |
| ---------------- | ---------------- | --------------------------------------------------------------------------------------------- | ----- |
| Letter sheet     | 8.5 × 11 in      | 8.5 × 11 in; ANSI/ASME Y14.1 calls it "ANSI A"                                                | yes   |
| A4 sheet         | 210 × 297 mm     | 210 × 297 mm, ISO 216 A series                                                                | yes   |
| Credit card      | 85.60 × 53.98 mm | ISO/IEC 7810 ID-1: "85.60 by 53.98 millimetres"                                               | yes   |
| EU interior door | 200 cm (default) | Order size 2000 mm (leaf 1985 mm); DIN 18101 nominal 2010 mm, rebated leaf 1985 mm            | yes   |
| US queen bed     | 60 in (default)  | Queen 60 × 79.5 in (North America table)                                                      | yes   |
| EU double bed    | 160 cm (default) | Most common pan-European double widths 160, 180 and 200 cm; 160 cm is "a double" in N. Europe | yes   |

Notes:

- The door: DIN 18101's smaller nominal height is 2010 mm with a 1985 mm rebated leaf, and Novoferm sells that door under the order size 2000 mm. 200 cm sits between leaf and nominal opening (within 1.5 cm of both), and the visitor can edit it. The 2130 mm nominal size is the taller option, not the common one.
- The bed: no single EU standard. 140 cm is a "small double" in northern Europe and Spain favours 135–150 cm, but 160 cm is the first of the three most common pan-European double widths. The default is editable.

Sources:

- Letter and A4: https://en.wikipedia.org/wiki/Paper_size
- ID-1 card: https://en.wikipedia.org/wiki/ISO/IEC_7810
- Door: https://www.baunetzwissen.de/drucken/tuerblattgroessen-nach-din-18101-155263 (DIN 18101 table), https://www.novoferm.com/fileadmin/novoferm_group/Images/PDF/Novoferm_Broschuere_Innentueren_Zargen_GB_KV2.pdf (order size 2000 mm, leaf 1985 mm)
- Beds: https://en.wikipedia.org/wiki/Bed_size
