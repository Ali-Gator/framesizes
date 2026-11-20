# Spec Delta

## MODIFIED Requirements

### Requirement: The extension asks only for what it uses

The extension SHALL be a Manifest V3 extension for Chrome 116 or later. Its permissions SHALL be exactly `sidePanel`, `contextMenus`, `activeTab` and `scripting`. It SHALL declare no host permissions, no optional permissions and no content scripts. Only pages on `https://framesizes.app` SHALL be able to message it.

#### Scenario: The built manifest

- **WHEN** the built `manifest.json` is read
- **THEN** `manifest_version` is 3, `minimum_chrome_version` is "116", `permissions` is `["sidePanel", "contextMenus", "activeTab", "scripting"]`, there is no `host_permissions`, `optional_permissions` or `content_scripts` key, and `externally_connectable.matches` is `["https://framesizes.app/*"]`

### Requirement: The extension works offline and sends nothing

The panel and the full-size tab SHALL load their code, styles and fonts from the extension itself and SHALL make no network request. The only request the extension SHALL make is reading the right-clicked image once, on the "Try on my wall" click. The wall photo, the layout, the print pictures and the page text SHALL never leave the device, and the page text SHALL NOT be stored.

#### Scenario: No request leaves the extension

- **GIVEN** the panel page opened, a wall photo picked and scaled, and the full-size tab opened
- **WHEN** every request the two pages made is listed
- **THEN** each one is a `chrome-extension:` or `blob:` URL

#### Scenario: A try keeps only what the panel shows

- **GIVEN** a right-click on a print on a page whose text holds "24 x 36 in"
- **WHEN** the try is stored on the device
- **THEN** it holds the print's picture, the title, the host name and the sizes found, and no page text

### Requirement: The wall is saved on this device

The extension SHALL keep the planner's wall on the device: the template, the gap, the sizes, hand moves, added and removed frames, prints added from shops with their pictures, the group's move, the hangers, the view, and the wall photo with its scale, marks and floor line. Reopening the panel or the tab, or restarting Chrome, SHALL bring back the same wall. Open dialogs and pickers SHALL NOT be kept.

#### Scenario: A changed layout survives a reload

- **GIVEN** the panel with the gap set to 2 in and frame A moved 4 in left
- **WHEN** the panel page is reloaded
- **THEN** the gap reads 2 in and frame A sits 4 in left of where the template puts it

#### Scenario: A wall photo survives a reload

- **GIVEN** the panel on a wall photo scaled from a marked sofa
- **WHEN** the panel page is reloaded
- **THEN** the photo is shown with the same scale and layout, the "Wall" select reads "My wall photo", and the saved line reads "Your wall is saved on this device"

#### Scenario: An added print survives a reload

- **GIVEN** the default layout with a 24 × 36 in unframed print added as frame F
- **WHEN** the panel page is reloaded
- **THEN** frame F is there at 24 × 36 in, drawn with the print's picture

## ADDED Requirements

### Requirement: Right-clicking an image offers "Try on my wall"

The extension SHALL add one context-menu item, "Try on my wall", shown for images on `http` and `https` pages only. Choosing it SHALL open the side panel in that window on the try for that image.

#### Scenario: The menu item on an image

- **WHEN** the extension is installed or updated
- **THEN** one menu item titled "Try on my wall" exists, for the `image` context, on `http://*/*` and `https://*/*` pages

#### Scenario: Choosing it opens the panel on the print

- **GIVEN** a shop page with a print image and the panel closed
- **WHEN** "Try on my wall" is chosen on the image
- **THEN** the side panel opens in that window and shows "What size is it?" with the print's picture, "From <the page's host>" and the page's title

### Requirement: The page is read only on the click

The extension SHALL read a page only when "Try on my wall" is chosen on it, and only that page's frame. It SHALL take the image, the product title, the host name and the print sizes in the page text, and nothing else. When the page cannot be read, the try SHALL still open with no size found.

#### Scenario: A page that cannot be read

- **GIVEN** an image on a page where Chrome blocks extensions from reading it
- **WHEN** "Try on my wall" is chosen
- **THEN** the panel opens on the try with no size found and the width and height fields open

### Requirement: The sizes come from the page text

The try SHALL list each print size in the page text once, in page order, up to eight. It SHALL read W × H in inches, centimetres or millimetres, written with "x", "×" or "by", with or without unit marks; a size with no unit SHALL count as inches. Sides under 3 in or over 120 in, and sizes in pixels, SHALL be left out.

#### Scenario: The forms the canvas names

- **WHEN** the page text holds "24 x 36 in", "60 × 90 cm" and "24x36"
- **THEN** the chips read "24 × 36 in" and "60 × 90 cm", and "24x36" is the same size as the first

#### Scenario: Numbers that are not print sizes

- **WHEN** the page text holds "1920x1080", "1920 x 1080 px" and "2 x 2 in"
- **THEN** no size is found

### Requirement: The size step asks for the size the visitor would buy

"What size is it?" SHALL show the sizes found as chips, then "Other size", a Frame choice of Unframed or a 1 in frame (Unframed first), and "Hang it on my wall". One size found SHALL be picked. With several, none SHALL be picked and the button SHALL wait, saying why. With none, or with "Other size", width and height fields SHALL open.

#### Scenario: Several sizes found

- **GIVEN** a page listing 12 × 16 in, 18 × 24 in and 24 × 36 in
- **WHEN** the try opens
- **THEN** no chip is pressed, "Hang it on my wall" is disabled, and the line beside it reads "Pick a size first: this page lists three."
- **AND** pressing "24 × 36 in" enables the button

#### Scenario: One size found

- **GIVEN** a page listing only 24 × 36 in
- **WHEN** the try opens
- **THEN** "24 × 36 in" is pressed and "Hang it on my wall" is enabled

#### Scenario: No size found

- **GIVEN** a page with no size in its text
- **WHEN** the try opens
- **THEN** the width and height fields are open and "Hang it on my wall" waits until both hold a length

### Requirement: The print hangs at true size on the saved wall

"Hang it on my wall" SHALL show the print alone, at the picked size, on the saved wall photo, or in the sample room with no photo saved. The layout's frames SHALL be hidden. A landscape picture SHALL hang its longer side across. The print SHALL hang 8 in above a sofa or bed when one is marked, else centred at 57 in, centred between the known wall edges.

#### Scenario: Unframed in the sample room

- **GIVEN** no saved wall photo and a 24 × 36 in portrait print picked, Unframed
- **WHEN** "Hang it on my wall" is pressed
- **THEN** the print hangs 18 in from the ceiling, 8 in above the sofa, and 60 in from each side of the wall, and no layout frame is drawn

#### Scenario: With a 1 in frame

- **GIVEN** the same print hanging
- **WHEN** Frame is set to "1 in frame"
- **THEN** the size line reads "24 × 36 in · 26 × 38 framed" and the print hangs 16 in from the ceiling, 8 in above the sofa, and 59 in from each side

#### Scenario: A landscape picture

- **GIVEN** a picture wider than it is tall and "24 × 36 in" picked
- **WHEN** it hangs
- **THEN** it is 36 in wide and 24 in tall

### Requirement: The print's distances and tip follow F2

The print SHALL show and set its four distances as a frame does on F2, in the visitor's unit, and SHALL drag inside the wall. When a sofa or bed is on the wall, a tip SHALL name the art width that fills it: two-thirds of the furniture's width.

#### Scenario: The tip over the sample sofa

- **GIVEN** the print hanging in the sample room
- **WHEN** the try view is shown
- **THEN** a line reads "Art about two-thirds of the sofa's width fills this wall: 56 in over the 84 in sofa."

#### Scenario: Setting a distance

- **GIVEN** the 24 × 36 in print hanging unframed in the sample room
- **WHEN** "To the sofa" is set to 10 in
- **THEN** the print's bottom edge sits 10 in above the sofa and "To the ceiling" reads 16 in

### Requirement: The try ends by adding the print or going back

The try view SHALL offer "Add to my layout", which adds the print to the planner as the next lettered frame with its picture, size and frame, placed beside the layout; "Back to my layout", which leaves the print out; and "Change size", which returns to the size step. Both of the first two SHALL return to the planner as it was, with the print added or not.

#### Scenario: Adding the print

- **GIVEN** the default layout of five frames and a 24 × 36 in print hanging unframed
- **WHEN** "Add to my layout" is pressed
- **THEN** the planner shows six frames, frame F is the print at 24 × 36 in with its picture and is selected, and frames A to E are where they were

#### Scenario: Going back

- **GIVEN** the print hanging
- **WHEN** "Back to my layout" is pressed
- **THEN** the planner shows the layout as it was and the print is gone

#### Scenario: A full layout

- **GIVEN** a layout of 12 frames
- **WHEN** the try view is shown
- **THEN** "Add to my layout" is disabled and reads beside it "That's 12 frames, the most the planner holds."

### Requirement: The try uses the wall select and a new wall photo

The panel's "Wall" select and in | cm SHALL apply to the hanging print. With no wall photo saved, the try view SHALL offer "Use my wall photo", which runs G1's upload and scale steps and then shows the print on the new photo. Leaving the upload with no photo picked SHALL return to the print in the sample room.

#### Scenario: Trying on a new wall photo

- **GIVEN** no saved wall photo and the print hanging in the sample room
- **WHEN** "Use my wall photo" is pressed and a photo is picked and scaled from a marked sofa
- **THEN** the print hangs 8 in above the marked sofa on the photo, and the "Wall" select reads "My wall photo"

### Requirement: A try waits for the visitor

A try SHALL stay until the visitor adds the print or goes back. Closing and reopening the panel SHALL return to its size step. A new "Try on my wall" SHALL replace it. The full-size tab SHALL show the planner, not the try.

#### Scenario: The panel closed during a try

- **GIVEN** a try at its size step with "24 × 36 in" pressed
- **WHEN** the panel page is reloaded
- **THEN** it shows "What size is it?" for the same print

### Requirement: The wall select names the upload step

While the planner is in the upload or a scale step, the "Wall" select SHALL read a disabled "New wall photo", so that picking "My wall photo" or "Sample room" acts from there.

#### Scenario: Back to the saved photo from the upload step

- **GIVEN** a saved wall photo, and the planner in the upload step after "Change photo"
- **WHEN** the "Wall" select is set to "My wall photo"
- **THEN** the saved photo is back with its scale

### Requirement: The try's new parts are accessible

The size chips SHALL be buttons with `aria-pressed` in a group labelled "Print size". A waiting "Hang it on my wall" SHALL be described by the line that says why. The print's drawing SHALL be `role="img"` named by the print, its size and where it hangs. Every new control SHALL be at least 44 px tall.

#### Scenario: No detectable violations in the try

- **WHEN** axe runs on the size step with several sizes found and on the try view in the sample room
- **THEN** it reports no violations
