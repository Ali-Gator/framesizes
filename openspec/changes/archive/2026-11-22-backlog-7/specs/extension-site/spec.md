## MODIFIED Requirements

### Requirement: Pin mode switches itself once the button is pinned

While the page is in pin mode because of `?pinned=0`, has no hash, and knows the extension's store id, it SHALL ask the extension for its status every 2 seconds while the tab is visible. When the reply says pinned, it SHALL switch to usage mode, stop asking, and drop `pinned` from the address without adding a history entry, keeping every other parameter and any hash, so a reload opens in usage mode. A mode picked by a hash SHALL never switch by itself.

#### Scenario: The visitor pins the button

- **GIVEN** the page is open at `?pinned=0` and the extension replies not pinned
- **WHEN** the extension's next reply says pinned
- **THEN** within 2 seconds the page is in usage mode and it sends no further status message

#### Scenario: The visitor asked for the pin steps

- **GIVEN** the page is open at `#pin` and the extension replies pinned
- **WHEN** 4 seconds pass
- **THEN** the page is still in pin mode

#### Scenario: The address after the self-switch

- **GIVEN** the page is open at `?pinned=0&utm_source=store` and the extension replies not pinned
- **WHEN** the extension's next reply says pinned
- **THEN** the address's query is `?utm_source=store`, the history length is unchanged, and the page is in usage mode
