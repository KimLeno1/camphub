# Center7 - Product Requirements Document (PRD)

## 1. Vision
Center7 is a decentralized, student-driven community platform designed to replace traditional top-down administrative moderation with democratic governance. It combines the best aspects of modern communication and collaboration tools (Discord, Reddit, Stack Overflow, GitHub, Notion) into a single, cohesive, premium experience. There are no permanent administrators; every moderation action, policy change, and governance decision is determined through community voting, reputation-based trust, and random jury selection. Center7 aims to be the premier global student platform, capable of scaling to millions of users while maintaining a clean, highly usable, and offline-capable interface.

## 2. Features
- **Decentralized Governance**: No central admin. Moderation actions (bans, suspensions, content removal) are handled via a Random Jury system with weighted voting based on user reputation.
- **Reputation & Trust System**: Users earn reputation and trust levels through helpful contributions, resource sharing, and active governance participation.
- **Communities & Sub-Communities**: Unlimited hierarchical communities, channels, clubs, and study groups.
- **Real-Time Communication**: Multi-threaded chat, voice channels, voice notes, message reactions, pinned messages, and disappearing messages.
- **Resource Management**: A marketplace and resource hub for sharing study materials (PDF, DOCX, Images, Videos, Code) with configurable size limits.
- **AI-Ready Architecture**: Future-proofed for AI integration, including resource summarization, study assistants, spam detection, and content classification.
- **Advanced Search**: Deep, robust search across messages, resources, events, and community history.
- **Events & Study Groups**: Integrated scheduling, study group formation, and event management.
- **Profiles & Achievements**: Rich user profiles showcasing reputation, voting history, major, badges, and analytics.

## 3. User Stories
### Governance & Moderation
- *As a student, I want to report a malicious post so that a community jury can review and vote on its removal.*
- *As a high-reputation user, I want to be selected for a random jury so that I can participate in platform moderation.*
- *As a penalized user, I want to submit an appeal to a higher-tier jury so that unfair actions can be reversed.*
- *As a community member, I want to propose a new community guideline so that users can vote on platform policies.*

### Communication & Collaboration
- *As a study group leader, I want to create a dedicated voice channel so that my group can collaborate in real-time.*
- *As a student, I want to reply in threads and mention peers so that complex discussions remain organized.*
- *As a contributor, I want to upload a 50MB PDF research paper so that others can access it in the resources tab.*

### Progression & Trust
- *As an active helper, I want to earn reputation points when my answers are upvoted so that my governance voting weight increases.*
- *As a new user, I want a clear onboarding path to increase my trust level so that I can unlock community creation privileges.*

## 4. Functional Requirements
- **Authentication & Security**: Secure JWT-based authentication with refresh tokens, rate limiting, spam detection, CSRF/XSS protection, and input sanitization.
- **Governance Engine**: Automated workflows for case generation upon report, random juror selection algorithm, vote weighting, and automatic execution of verdicts (e.g., hiding a post if 70% of the jury votes to remove).
- **Messaging System**: WebSocket-based real-time delivery, typing indicators, read receipts, and offline message queueing.
- **File Storage**: Object storage integration for uploads with strict MIME-type validation, size constraints, and automated virus scanning.
- **Reputation Logic**: Algorithmic calculation of user trust scores based on a weighted matrix of actions (uploads, upvotes received, jury participation).
- **APIs**: Versioned RESTful APIs with OpenAPI documentation, strict pagination, filtering, and sorting capabilities.

## 5. Non-Functional Requirements
- **Scalability**: Architecture designed to support millions of concurrent users utilizing microservices, PostgreSQL, Prisma, and Redis caching.
- **Performance**: Sub-200ms API response times. Fast client-side rendering with TanStack Query for optimistic UI updates.
- **Usability**: Clean, mobile-first, and responsive design with minimal clicks required for core actions. Full keyboard shortcut support.
- **Accessibility**: Strict adherence to WCAG AA standards, high contrast ratios, and screen reader compatibility.
- **Theming**: Native support for seamless Light and Dark modes.
- **Data Integrity**: Normalized enterprise database design (id, created_at, updated_at, deleted_at, versioning) with comprehensive audit trails and foreign key constraints.
- **Offline Support**: PWA capabilities with aggressive local caching (IndexedDB) to allow offline browsing of previously loaded resources and communities.
