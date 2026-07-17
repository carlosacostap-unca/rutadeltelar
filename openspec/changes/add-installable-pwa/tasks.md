## 1. PWA metadata and identity

- [ ] 1.1 Add Next.js manifest and generated Android/Apple application icons using the Ruta del Telar visual identity.
- [ ] 1.2 Configure root metadata for installed web application appearance and verify manifest output.

## 2. Installation experience

- [ ] 2.1 Add a client-side installer controller that detects standalone mode, compatible browser prompts, Safari mobile, and Expo offline mode.
- [ ] 2.2 Build the accessible Android installation invitation and Safari iPhone/iPad instructions, including dismissal persistence.
- [ ] 2.3 Mount the installation experience in the web app shell without changing the offline packaging.

## 3. Resilient navigation

- [ ] 3.1 Add a versioned web-only service worker and offline fallback page that do not cache dynamic data.
- [ ] 3.2 Register the service worker only for normal web mode and safely handle updates.

## 4. Verification

- [ ] 4.1 Add unit tests for platform and installation-state helpers.
- [ ] 4.2 Add Playwright coverage for the installation guidance states.
- [ ] 4.3 Run focused tests, lint, build, and OpenSpec validation; correct any failures.
