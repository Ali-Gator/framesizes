## MODIFIED Requirements

### Requirement: Right-clicking an image offers "Try on my wall"

The extension SHALL add one context-menu item, "Try on my wall", shown for images and for links on `http` and `https` pages only, so a print drawn as a CSS background inside a link is offered too. Choosing it SHALL open the side panel in that window on the try for that image. Chosen on a link, the try SHALL take the picture inside the link: an image, or a CSS background image of the link or of an element inside it. A link with no picture SHALL still open the try, with no picture.

#### Scenario: The menu item on an image

- **WHEN** the extension is installed or updated
- **THEN** one menu item titled "Try on my wall" exists, for the `image` and `link` contexts, on `http://*/*` and `https://*/*` pages

#### Scenario: Choosing it opens the panel on the print

- **GIVEN** a shop page with a print image and the panel closed
- **WHEN** "Try on my wall" is chosen on the image
- **THEN** the side panel opens in that window and shows "What size is it?" with the print's picture, "From <the page's host>" and the page's title

#### Scenario: A print drawn as a link's background

- **GIVEN** a shop page whose print is a CSS background image on an element inside a link, and the panel closed
- **WHEN** "Try on my wall" is chosen on the link
- **THEN** the side panel opens on the try with that background image as the print's picture, "From <the page's host>" and the page's title

#### Scenario: A link with no picture

- **GIVEN** a page with a text link that holds no image and no background image
- **WHEN** "Try on my wall" is chosen on the link
- **THEN** the side panel opens on the try with no picture, and the sizes come from the page text

### Requirement: The try's new parts are accessible

The size chips SHALL be buttons with `aria-pressed` in a group labelled "Print size". A waiting "Hang it on my wall" or "Add to my layout" SHALL be described by the line that says why, SHALL be exposed as disabled to assistive technology, SHALL stay in the Tab order, and SHALL do nothing when pressed. The print's drawing SHALL be `role="img"` named by the print, its size and where it hangs. Every new control SHALL be at least 44 px tall.

#### Scenario: No detectable violations in the try

- **WHEN** axe runs on the size step with several sizes found and on the try view in the sample room
- **THEN** it reports no violations

#### Scenario: A waiting button keeps focus and says why

- **GIVEN** the size step with several sizes found and none picked
- **WHEN** the keyboard moves focus to "Hang it on my wall" and Enter is pressed
- **THEN** the button has focus, is reported disabled, is described by "Pick a size first: this page lists three.", and the size step is still shown

#### Scenario: A full layout's button does nothing

- **GIVEN** the try view on a layout that already holds 12 frames
- **WHEN** focus moves to "Add to my layout" and Enter is pressed
- **THEN** the button has focus, is reported disabled, is described by "That's 12 frames, the most the planner holds.", the try is still shown, and the layout still holds 12 frames

## ADDED Requirements

### Requirement: Two pages never share an added frame

Each frame added with "Add a frame" in the panel or the tab SHALL get a frame id that no other page of the extension can give, even one that has not yet reloaded the saved wall, so a kept selection or a hanger never lands on another page's frame. Walls saved with earlier ids SHALL keep loading.

#### Scenario: A stale page adds a frame

- **GIVEN** two extension pages on one wall with the same frames, and the second page in the upload step
- **WHEN** the first page adds a frame with "Add a frame", and the second page goes back to the sample room without saving and adds a frame with "Add a frame"
- **THEN** the two added frames have different frame ids

#### Scenario: An older saved frame

- **GIVEN** a wall saved with a frame added under the id `a1`
- **WHEN** the panel opens
- **THEN** the frame shows, and selecting it selects that frame
