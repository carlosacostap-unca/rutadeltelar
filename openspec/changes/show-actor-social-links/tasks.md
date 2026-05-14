## 1. Data Model

- [x] 1.1 Add optional `facebook_url`, `instagram_url`, and `pagina_web_url` fields to the public actor type.
- [x] 1.2 Normalize the three actor URL fields from PocketBase, trimming empty values and preserving old records without links.

## 2. Public Rendering

- [x] 2.1 Extend the actor contact UI to accept and render optional Facebook, Instagram, and Página web links.
- [x] 2.2 Wire actor detail pages to pass normalized social/web URLs and avoid empty buttons when fields are absent.
- [x] 2.3 Ensure rendered social/web links use `target="_blank"` and `rel="noopener noreferrer"`.

## 3. Tests And Verification

- [x] 3.1 Add or update tests covering contact rendering with social/web links.
- [x] 3.2 Add or update tests covering the no-links case.
- [x] 3.3 Run OpenSpec validation and the project verification commands.
