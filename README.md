# Omnitrix Simulator

A high-fidelity Omnitrix simulation built with React, focused on modeling complex interaction systems through a deterministic state machine, resource management, and animation-driven UI.

The project treats the interface as a responsive system rather than static UI—where user input, internal state, and constraints (like energy and cooldown) work together to drive behavior.

---

## Why This Project

This project explores how complex, device-like interactions can be modeled in a frontend application.

Unlike traditional UI projects, the system is built around a deterministic state machine where:

* user input triggers controlled transitions
* internal constraints (energy, cooldown) influence behavior
* UI reflects system state instead of driving it

The goal was to simulate a responsive, hardware-like experience using clean and scalable frontend architecture.

---

## Architecture & Features

### Core Mechanics

* **Unidirectional State Machine:** Governs strict transitions across discrete hardware modes, preventing race conditions.
* **Resource Management Loop:** Handles continuous energy depletion and regeneration.
* **Progression System:** Manages experience thresholds to gate access to advanced configurations.

### Advanced Systems

* **Input Buffering:** Captures sequence-based commands for hidden system overrides.
* **Override Sequences:** Implements multi-phase states for advanced features (e.g., specialized character forms).

### UI/UX Implementation

* **Declarative Animations:** Utilizes Framer Motion for performant, interruptible component transitions.
* **Responsive Layout Architecture:** Built on a consistent design system for predictable rendering across viewports.
* **Hardware Parallax:** Integrates dynamic background tracking to simulate physical depth.

---

## Technical Stack

* **React (Vite):** Provides an optimized build pipeline and efficient component-driven architecture.
* **Tailwind CSS:** Enforces a consistent design system with utility-first styling.
* **Framer Motion:** Handles complex UI transitions and animation logic efficiently.

---

## Project Structure

The repository is structured to strictly separate UI components from business logic and application state.

```text
src/
 ├── app/         # Application bootstrap and global configurations
 ├── components/  # Domain-driven UI layer (alien, omnitrix, ui)
 ├── constants/   # Immutable application state definitions
 ├── context/     # Global theme and dependency injection
 ├── data/        # Static data models and configuration sets
 ├── hooks/       # State machine and transition controllers
 ├── services/    # Business logic and system rules (energy, cooldown)
 └── utils/       # Pure helper functions
```

---

## Engineering Decisions

* **Dedicated Service Layer:** Extracts energy and system calculations from the UI, ensuring logic remains isolated, testable, and scalable.
* **Centralized Constants:** Prevents magic strings and guarantees consistent state handling across the application.
* **Absolute Imports (`@/`):** Improves developer experience by eliminating fragile relative paths.
* **Feature-Based Module Grouping:** Organizes components by domain, allowing the system to scale without structural complexity.

---

## State Machine Lifecycle

The core device operates on a predictable lifecycle loop:

* **IDLE:** The system is dormant, regenerating resources and awaiting input.
* **SELECTING:** The interface responds to user interaction for configuration selection.
* **ACTIVE:** The selected mode is executed, consuming system resources.
* **COOLDOWN:** The system locks due to resource depletion until recovery thresholds are met.

---

## Setup Instructions

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Future Scope

* Backend API integration for dynamic data and session persistence.
* Real-time synchronization using WebSockets.
* Mobile optimization with enhanced touch interactions.
* Performance improvements through code-splitting and lazy loading.

---

## Engineering Focus

Built to demonstrate strong frontend engineering fundamentals, including state-driven design, separation of concerns, and scalable architecture.

The project emphasizes building maintainable, predictable systems rather than purely visual UI.