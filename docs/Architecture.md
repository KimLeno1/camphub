# Center7 - System Architecture

This document outlines the high-level system architecture for Center7, a decentralized, scalable, and enterprise-grade student community platform.

## 1. Frontend Architecture
The frontend is designed for high performance, accessibility, and offline support, adhering to a mobile-first and responsive design philosophy.

- **Core Framework**: React & Next.js (App Router for SSR/SSG and optimized routing).
- **Language**: TypeScript (Strict typing).
- **Styling**: Tailwind CSS & Shadcn UI for clean, modular, and accessible components.
- **Animations**: Framer Motion for smooth, hardware-accelerated transitions.
- **State & Data Fetching**: TanStack Query (React Query) for server state caching, optimistic updates, and offline support. Context API for lightweight global client state.
- **Form Handling**: React Hook Form paired with Zod for robust client-side validation.
- **PWA Capabilities**: Service workers for aggressive local caching and offline browsing support.

## 2. Backend Architecture
The backend is a robust, modular, and scalable API layer adhering to SOLID principles and Clean Architecture.

- **Core Framework**: NestJS (Node.js).
- **Language**: TypeScript.
- **Architecture Pattern**: Clean Architecture (Controllers -> Use Cases -> Repositories). Dependency Injection is utilized heavily.
- **Security & Authentication**: JWT (Access/Refresh tokens), rate limiting, content sanitization, CSRF & XSS protection.
- **API Design**: Versioned REST APIs adhering to OpenAPI specifications, with consistent pagination, filtering, and sorting standards.
- **Containerization**: Docker for consistent development and production deployments.

## 3. Database Architecture
A normalized, enterprise-grade relational database designed for high transactional throughput and deep auditability.

- **Primary Database**: PostgreSQL.
- **ORM**: Prisma ORM for type-safe database access and schema migrations.
- **Schema Design**: Every table includes mandatory audit fields: `id`, `created_at`, `updated_at`, `deleted_at` (soft deletes), and `version` (optimistic locking).
- **Performance**: Strategic indexing on foreign keys and highly queried columns.
- **Caching**: Redis for caching frequently accessed data (user profiles, active governance cases, community metadata).

## 4. Storage Services
Scalable and secure file management for community resources and media.

- **Provider**: S3-compatible Object Storage (e.g., AWS S3, Cloudflare R2, Google Cloud Storage).
- **Supported Formats**: PDF, DOCX, ZIP, RAR, Images, Videos, PowerPoint, Excel, Research Papers, Source Code.
- **Security**: Pre-signed URLs for secure direct-to-cloud uploads, strict MIME-type validation, and integration with an asynchronous file scanning service (virus/malware detection).
- **Constraints**: Configurable maximum file sizes based on community or user trust levels.

## 5. Search Engine
A dedicated search infrastructure to handle deep, complex queries across the platform.

- **Provider**: Elasticsearch or Meilisearch.
- **Capabilities**: Full-text search across messages, forum threads, uploaded resource contents (where extractable), user profiles, and historical governance records.
- **Features**: Typo tolerance, faceted search, and role/permission-aware result filtering.

## 6. Notification System
A decoupled notification service handling multi-channel delivery.

- **Channels**: In-app notifications, Push Notifications (Web/Mobile), and Email rollups.
- **Queueing**: Redis Pub/Sub or RabbitMQ for processing notification fan-out asynchronously.
- **Preferences**: Granular user settings to control notification noise and frequency.

## 7. Realtime Engine
Low-latency bidirectional communication for messaging and live updates.

- **Gateway**: NestJS WebSocket Gateway.
- **Features**: Real-time messaging, typing indicators, read receipts, online presence, and live updates for governance voting tallies.
- **Scalability**: Redis Adapter for scaling WebSockets across multiple backend instances.

## 8. AI Services Architecture (Future-Ready)
The system is designed with isolated AI modules that can be integrated seamlessly as the platform evolves.

- **Integration Point**: Asynchronous worker queues triggered by specific platform events.
- **Planned Modules**:
  - *Resource Summarization*: Generating abstracts for large uploaded PDFs.
  - *Study Assistant*: Context-aware chatbot trained on community-approved materials.
  - *Spam & Toxicity Detection*: Automated initial flagging for the Random Jury system.
  - *Recommendation Engine*: Suggesting study groups, clubs, and resources based on a student's major and interaction history.
