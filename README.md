# Vanguard - AI-Powered Threat Modeling Sandbox

<img width="201" height="93" alt="Screenshot 2025-08-09 111733" src="https://github.com/user-attachments/assets/d7a1e118-0f6a-42a1-8e7f-6fa97573d0ff" />

---

## Overview

Vanguard is an AI-driven cybersecurity sandbox for modern security teams. It helps users simulate, analyze, and visualize cloud-native attack scenarios in a controlled environment. Rather than relying on static threat reports, Vanguard generates dynamic attack simulations, proposes defensive actions, evaluates their impact, and surfaces practical response insights.

## Core Features

- **AI Scenario Generation:** Describe an attack in plain language (for example, "data exfiltration from an S3 bucket") and the system generates a realistic simulated script.
- **Dynamic Threat Modeling:** Execute a script in the sandbox to produce a full scenario with security events, affected cloud resources, and key metrics.
- **Countermeasure Analysis:** Generate defensive scripts, simulate attacker-vs-defender interaction, score effectiveness, and refine the defense automatically.
- **Response Plan Generation:** Produce concise, actionable response steps for individual security events.
- **Interactive Dashboard:** Visualize simulation impact with live-style charts and event streams.
- **Session History:** Save and revisit prior simulations for comparison and review.

## How The AI Pipeline Works

Vanguard runs as a connected set of Genkit flows. From one input, the system constructs an end-to-end scenario in real time rather than relying on static mock datasets.

<img width="892" height="562" alt="Screenshot 2025-08-17 142149" src="https://github.com/user-attachments/assets/082a3219-16d1-4c3c-acd3-a8dee8db94b7" />

1. **Script Generation (`generateAttackScript`)**
Interprets a user-described attack and produces a plausible simulated script using safe placeholder behavior.

2. **Scenario Modeling (`modelAttackScenario`)**
Analyzes script intent and generates linked outputs: threat analysis, risk score, event stream, impacted resources, and suggested countermeasure.

3. **Interaction Analysis (`analyzeInteraction`)**
Simulates attack vs. defense behavior, creates a detailed interaction log, calculates effectiveness, and proposes improved defense logic.

4. **Response Planning (`generateResponsePlan`)**
Builds incident response guidance tailored to a selected event.

The `modelAttackScenario` flow acts as the orchestrator, ensuring command-level actions map coherently to events, resource impacts, and dashboard metrics so each run tells a logically connected story.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **AI/Backend:** Google Genkit, Google AI Platform
- **State Management:** React Context API
- **Charts:** Recharts

## Running Locally

1. **Clone the repository:**
```bash
git clone <repository-url>
cd <repository-name>
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set environment variables:**
Create a `.env` file in the project root and add:
```bash
GOOGLE_API_KEY=your_api_key_here
```

4. **Run development server:**
```bash
npm run dev
```

Application runs at `http://localhost:9002`.
