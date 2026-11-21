# Spec Delta

## MODIFIED Requirements

### Requirement: The footer lists the live pages by hub

The footer SHALL list every live page as a link, grouped under its hub's name, and SHALL leave out pages that are not live and hubs with no live page. It SHALL carry the note that sizes are nominal and that the visitor should measure the frame's opening before ordering a print. Below the groups, a company row SHALL show "©", the current year and the operator's legal name, its postal address, and a `nav` named "Company" linking each live page that has no hub, in site map order.

#### Scenario: One page is live

- **WHEN** the footer is rendered while only the home page is live
- **THEN** it shows the group "Frames" with one link, "Frame size chart", pointing to `/`, no other group, and the nominal-size note

#### Scenario: The company row

- **WHEN** the footer is rendered while the five company pages are live
- **THEN** the hub groups hold none of them, and the company row shows "Soft Divisions Limited", the postal address "B, G/F, 322 Shanghai Street, Yau Ma Tei, Kowloon, Hong Kong" and a `nav` named "Company" with the links About, Contact, Privacy policy, Terms of use and Refund policy, pointing to `/about`, `/contact`, `/privacy-policy`, `/terms-of-use` and `/refund-policy`
