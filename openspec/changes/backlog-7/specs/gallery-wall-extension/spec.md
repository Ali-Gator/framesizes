## MODIFIED Requirements

### Requirement: The extension carries its name and icons

The extension SHALL be named "Gallery Wall Layout Generator" in English and by its translated name in every language it ships, in the manifest and on the toolbar button's tooltip. It SHALL ship the canvas's icon as PNG files at 16, 32, 48 and 128 px, for the toolbar and the store.

#### Scenario: Name and icons in the build

- **WHEN** the build is read
- **THEN** the manifest's `name` and `action.default_title` are both `__MSG_appName__`, the English `appName` message is "Gallery Wall Layout Generator", and `icons` and `action.default_icon` name PNG files at 16, 32, 48 and 128 px that exist with those pixel sizes

#### Scenario: Every language names the extension

- **WHEN** the build's `_locales` folders are read
- **THEN** every one defines a non-empty `appName` message
