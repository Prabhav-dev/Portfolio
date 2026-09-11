# Portfolio (v1.3)

## What's New in v1.3

Version 1.3 introduces a more complete systems engineering portfolio experience, combining project documentation with interactive technical storytelling.

* Added an interactive **Tree Graph** page for exploring engineering pillars, technical specializations, and academic milestones.
* Expanded the portfolio with detailed architecture highlights for storage engines, Rust algorithms, applied cryptography, AI memory systems, spatial pipelines, and telemetry workflows.
* Added interactive Three.js visualizations, including the hero engine core and telemetry globe.
* Added expandable project summaries with architecture details, benchmarks, test results, and demonstration videos.
* Improved responsive behavior, accessibility, dark/light theme persistence, custom scrolling, and mobile canvas layouts.
* Added a serverless contact workflow with honeypot spam protection and in-page submission feedback.

This release presents the portfolio as a public, post-ready showcase of low-level backend systems, storage engine research, applied security, and high-performance infrastructure work.


# Systems Engineering Portfolio & Research Showcase

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Java: 17+](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://openjdk.org/)
[![Rust: 2021](https://img.shields.io/badge/Rust-2021-red.svg)](https://www.rust-lang.org/)
[![Spring Boot: 3.4](https://img.shields.io/badge/Spring%20Boot-3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)

> **Personal Engineering Portfolio of Prabhav Dwiwedi**  
> Computer Science Undergraduate specializing in **Low-Level Backend Systems**, **Custom Storage Engines**, **Write-Ahead Logging (WAL)**, **Applied Cryptography (Ascon-128 AEAD / Argon2)**, and **High-Performance Rust & Java Infrastructures**.

---

## 🌐 Live Portfolio & Navigation

* **Portfolio Website:** [`index.html`](index.html)
* **Interactive Architectural Graph & Milestones:** [`about.html`](about.html)
* **GitHub Profile:** [github.com/Prabhav-dev](https://github.com/Prabhav-dev)
* **LinkedIn:** [linkedin.com/in/prabhav-dwiwedi-283839348](https://www.linkedin.com/in/prabhav-dwiwedi-283839348/)

---

## 🚀 Key Architectural Projects

### 1. Yggdrasil — Zero-Dependency Blind Storage Engine
An embedded, disk-resident B+Tree storage engine and non-blocking Java NIO middleware designed for low-level data durability, authenticated page encryption, and index persistence without third-party runtime frameworks.

* **Core Features:**
  * **Authenticated Page Security:** 4 KiB pages are encrypted with NIST-standardized Ascon-128 AEAD and cryptographically bound to page-specific associated data to prevent frame-swap and replay attacks.
  * **Encrypted Metadata Layer:** Page 0 stores encrypted metadata and root pointers, ensuring crash recovery state remains private on cold restarts.
  * **B+Tree Indexing:** High-efficiency point lookups, range queries, node splits, and branch merges over persisted records.
  * **Write-Ahead Logging (WAL):** Records physical page after-images and tuple updates; discards torn trailing records during recovery sweeps.
  * **Zero-Dependency Raw NIO:** Custom binary wire protocol with manual `ByteBuffer` frame accumulation and non-blocking request dispatching.
  * **Supervisor Console:** Live Swing inspector for B+Tree node visualization, raw hexadecimal page inspection, and cryptographic telemetry.
  * **8 TiB Address Span:** Logical page address space spanning $2^{43}$ bytes ($2^{31}-1$ 4 KiB pages).
* **Repository:** [Yggdrasil-Blind_Storage](https://github.com/Prabhav-dev/Yggdrasil-Blind_Storage.git)
* **Video Demonstration:** [YouTube Engine Walkthrough](https://youtu.be/WNGhLx-hPEU)

---

### 2. java-diff-utils-rs — High-Performance Rust Myers Diff Port
A pure Rust port of upstream `java-diff-utils` implementing the standard and linear-space Myers diff algorithms, delta patch verification/application, unified diff parsing/writing, and side-by-side presentation-layer row generators.

* **Benchmark & Algorithmic Context (Issue #124 Dataset):**
  * Upstream `java-diff-utils` defaults to their Histogram algorithm on massive datasets (~0.5ms on specific workloads).
  * For the **Myers diff algorithm**, the pure Rust release port provides a **4.05x speedup**:
    * **Rust Release Port:** ~`11.6s` (`cargo test --release`)
    * **Java Reference Release:** ~`47.0s`
* **Test Suite Compliance:** **169 / 169 tests passed (100% pass rate)** covering algorithm units, fuzzy patch exceptions, empty-delta patches, and Unicode grapheme cluster wrapping.
* **Roadmap:** Optimization demonstration video in production; future roadmap includes implementing the Histogram diff algorithm in Rust for sub-millisecond parity.

---

### 3. Yggdrasil Memory Layer — Embedded AI Agent Memory
A token-efficient, fidelity-tiered long-term memory layer built on top of Yggdrasil's B+Tree core and `java-diff-utils-rs` to eliminate reliance on external hosted vector DB SaaS (Pinecone, Weaviate).

* **Dual Fidelity Paths:**
  * **Lossy Path (Natural Language):** Approximate semantic clustering and recency aging for dialogue turns.
  * **Near-Lossless Path (Code & Structured Data):** Code changes are diffed using Myers diff deltas and stored as deltas, preventing catastrophic LLM syntax hallucinations.
* **3-Tier Compression Lifecycle:** Tier 1 (Raw recent full-fidelity) $\rightarrow$ Tier 2 (Delta summary) $\rightarrow$ Tier 3 (Cluster-level gist summaries).

---

### 4. IDEA_VOLTEX — Privacy-Preserving Digital Transactions
Zero-trust security architecture for digital transactions built with Java 21 and Spring Boot 3.4.3.
* Implements NIST Ascon-128 AEAD lightweight encryption.
* Deterministic blind indexing to decouple user identity from database records.
* Argon2 memory-hard hashing and MongoDB Atlas encrypted-at-rest storage.

---

### 5. Aaddellius Platform
Full-stack Spring Boot 3.2.5 + Java 21 web application integrating Google Cloud AI Platform (conversational chatbot and text-to-image synthesis) with Spring Data JPA (Hibernate) and Thymeleaf templates.

---

### 6. PS-09 Spatial Place-Name Extraction Pipeline
High-performance NLP/NER place-name extraction and canonical gazetteer mapping API leveraging spaCy, local GeoNames matching, and Nominatim fallback queries.

---

### 7. Retro Text Adventure Engine with Audio Keystrokes
Foundational Python interactive narrative engine featuring character-by-character typewriter rendering synchronized with real-time acoustic keyboard keystroke feedback using Pygame.
* **Repository:** [A-simple-text-based-game-with-typing-writing-effect](https://github.com/Demolisher-hero/A-simple-text-based-game-with-typing-writing-effect.git)

---

## 🛠️ Technical Stack & Core Competencies

| Domain | Technologies / Competencies |
| :--- | :--- |
| **Languages** | Java 21 (LTS), Rust, Python 3, C / 8086 Assembly, JavaScript (ES6+), SQL |
| **Storage & Engines** | Disk-Resident B+Trees, Slotted Page Heaps, Buffer Pools, Page Pinning, WAL Engines |
| **Systems & Networking** | Java NIO Channels, Non-Blocking Sockets, Binary Protocols, Frame Accumulators |
| **Cryptography** | Ascon-128 AEAD, Argon2 Hashing, Deterministic Blind Indexing, Zero-Trust |
| **Frameworks & Tools** | Spring Boot 3.4.x, Spring Data JPA, Hibernate, Cargo, Maven, Three.js, Thymeleaf |
| **Spatial & AI** | Google Earth Engine (GEE), spaCy NLP, Myers Diff Deltas, Fidelity-Tiered LLM Memory |

---

## 💻 Portfolio UI Architecture & Features

* **3D Visualizations:** Custom Three.js interactive cybernetic engine node in Hero section and 3D wireframe telemetry globe in Contact section.
* **YouTube AI Summary Accordions:** Interactive expand/collapse project cards with smooth height animations, badges, architectural lists, test verification tables, and embedded video players.
* **Parallax Canvas Fade:** Dynamic scroll-driven opacity fade for the About page knowledge tree that enhances readability of engineering pillar cards.
* **Serverless Contact Delivery:** Web3Forms serverless submission with spam honeypot filters and in-place DOM feedback alerts.
* **Responsive & Accessible:** Fluid CSS clamp typography, custom scrollbars, dark/light theme persistence via `localStorage`, and mobile-centered canvas layouts.

---

## 📄 License
This repository is open-source and available under the [MIT License](LICENSE).