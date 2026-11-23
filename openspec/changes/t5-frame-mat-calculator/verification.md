# Data verification: diploma frames

The canvas answered "What size frame for a diploma?" with a 12x16 frame and marked it unverified. The catalog pairs an 8.5x11 print only with the 12x16 frame. This file holds the check behind the diploma data the size engine gains here.

## Proposal check (2026-11-23, web search, US results)

Two searches: "standard diploma size 8.5x11 what size frame with mat" and "diploma frame 11x14 mat opening 8.5x11 standard diploma frame size". Every relevant result was a retail listing of an 11x14 frame with a mat for an 8.5x11 diploma or certificate:

| Listing                                                                                                                                                                                           | What it says                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Target, Threshold "11"x14" Matted to 8.5"x11" Certificate Frame" (A-93838214) https://www.target.com/p/11-x14-matted-to-8-5-x11-certificate-frame-threshold/-/A-93838214                          | 11x14 frame, mat for 8.5x11; a reviewer measured a 7.75 × 10.25 in opening |
| Walmart, Americanflat "Diploma Frame - 11x14 with 8.5x11 Mat" https://www.walmart.com/ip/5144705130                                                                                               | mat display area 8 × 10½ in                                                |
| Walmart, Americanflat, the same frame in mahogany https://www.walmart.com/ip/5567825160                                                                                                           | opening 10½ × 8 in, "designed to frame an 8.5x11 inches diploma"           |
| Target, Americanflat ornate 11x14 diploma frame https://target.com/p/americanflat-ornate-11x14-diploma-frame-in-beaded-mahogany-certificate-frame-with-white-and-gold-mat-displays/-/A-1000058177 | 11x14 diploma frame with a mat                                             |
| Walmart, ArtToFrames 8.5x11 diploma frame https://www.walmart.com/ip/495807652                                                                                                                    | opening cut about ¼ in smaller than the listed 8.5x11                      |
| eBay, PosterPalooza https://www.ebay.com/itm/304127052575                                                                                                                                         | 11x14, mat opening 8 × 10½ in                                              |

Finding: diploma frames are sold as 11x14 with a mat for an 8.5 × 11 in diploma. The usual opening, 8 × 10½ in, is the diploma less ¼ in on each side, the engine's `MAT_OVERLAP`, so `matBorders(11x14, 8.5x11)` gives the border these frames have: 1½ in at the sides, 1¾ in at the top and bottom. Some listings cut the opening smaller (7½ × 10½ in on a double mat; one reviewer measured 7¾ × 10¼ in); the page gives the usual opening, not every brand's.

## Apply check (task 2.2)

Open the listings above in a browser and confirm the frame size, the diploma size and the opening on each. Record what each page shows here. If fewer than three confirm an 11x14 frame with a mat for 8.5x11, stop and take the diploma answer back to the owner.
