# Build Notes

## What was added

- Mounted the existing AI, social, CMS, advanced analytics, enhanced post/comment, and enhanced chatbot routers.
- Added `GET /health` for smoke tests, Docker health checks, and CI.
- Fixed chatbot model exports and chat session/message field mapping.
- Fixed bearer auth middleware so users are not rejected just because the model does not define `isActive`.
- Added the missing messaging and achievement API routes, controllers, Sequelize models, associations, and page scripts.
- Completed and mounted the public home routes for the post list and public post detail pages.
- Added a shared `errors/404` template used by missing post flows.
- Fixed notification/theme model exports and aliases used by search and analytics queries.
- Added missing analytics and search results templates.
- Expanded smoke tests to cover public Phase 2/3 UI route rendering.
- Added `npm run syntax`, `npm test`, and `npm run verify`.
- Added Docker hardening with `npm ci`, non-root runtime, `.dockerignore`, and health checks.
- Added GitHub Actions CI with verify, production audit, Docker build, and CodeQL.
- Added Dependabot for npm and GitHub Actions.

## Known follow-ups

- Some enhanced controllers expect richer post/comment/media/template models than the current Sequelize models expose. Those endpoints are mounted, but deeper feature testing should be done before treating them as production-ready.
- `npm audit` still reports vulnerable dependencies. Most can be addressed with `npm audit fix`; `cloudinary` may require a breaking upgrade to v2.
