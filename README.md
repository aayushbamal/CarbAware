# CarbAware 🌎🔋

CarbAware is a modern, responsive, and secure carbon footprint tracker web application built with **React**, **TypeScript**, and **Vite**, powered by **Supabase Authentication** and a context-aware AI environmental coach named **Ecodroid AI** (meta-llama 3.3).

Live Application: **[https://carbaware.vercel.app](https://carbaware.vercel.app)**  
GitHub Repository: **[https://github.com/aayushbamal/CarbAware](https://github.com/aayushbamal/CarbAware)**

---

## 1. Chosen Challenge Vertical
**Persona**: Carbon Footprint Tracker & Ecodroid AI Coach.

**Concept**: To make personal carbon footprint reductions intuitive and actionable by combining:
1. **Interactive Footprint Questionnaire**: Gathers metrics on Weekly Commutes, Home Energy consumption, Flight records, Diet, and Consumption frequencies.
2. **"What-If" Sandbox Simulation**: Allows users to simulate lifestyle changes (e.g. switching to solar power, eating plant-based meals, or driving an EV) to preview potential annual carbon savings in real-time.
3. **Daily Action Tracker**: Gamified check-in system that awards Eco XP points for logging sustainable habits.
4. **Offset Center**: Integration where users can spend points to fund certified carbon reduction projects (e.g., Wind Farms, Reforestation).
5. **Ecodroid AI Coach**: A personalized chatbot companion that reads the user's specific questionnaire metrics to offer context-aware reduction strategies.

---

## 2. Approach & Architecture

### A. Frontend Design
*   **Aesthetics**: Premium dark-mode interface built with harmonized HSL colors, glassmorphic container modules (`backdrop-filter`), smooth hover states, and dynamic radial background glows. 
*   **CSS System**: Built on vanilla CSS (`index.css`) for high performance and custom style sheet injection support (compact layouts and motion sensitivity controls).

### B. Security Architecture (NVIDIA CORS-Bypass Proxy)
*   **The Problem**: The NVIDIA NIM API endpoints (`integrate.api.nvidia.com`) do not return CORS headers. Making client-side browser fetch calls directly from a React application results in network CORS blockages and exposes the developer's `NVIDIA_API_KEY` on the network inspector.
*   **The Solution**:
    *   **Local Development**: Configured a Vite server proxy in [vite.config.ts](file:///c:/Users/Aayush/Desktop/promptwars/vite.config.ts) to forward `/api/chat` calls directly from Node.js, bypassing CORS.
    *   **Production**: Deployed a Node.js Vercel Serverless Function [api/chat.js](file:///c:/Users/Aayush/Desktop/promptwars/api/chat.js) that acts as a secure server-side proxy. The Vercel function reads the `NVIDIA_API_KEY` from production environment variables (or local fallbacks) and queries NVIDIA's endpoints securely, keeping the API key shielded from the frontend client.

### C. Authentication Layer
*   Uses **Supabase JS** for registration and database sync.
*   Includes **Google OAuth Sign-In** alongside secure Email/Password forms.
*   Uses unique local storage profile keys (`carbaware_profile_{userId}`) so switching user accounts seamlessly segregates points, achievements, and dashboard metrics.

---

## 3. Dynamic Assistant Logic (Ecodroid AI)
Instead of static prompts, **Ecodroid AI** utilizes the user's custom questionnaire parameters to generate customized system instructions:
*   **Context Injection**: The chatbot feeds user display name, weekly commute mileage, vehicle choice, diet type, home heating/electric source, and total annual computed footprint directly to the LLM.
*   **Persona Customization**: Users can select from 4 distinct Ecodroid personalities in Settings:
    1. **Friendly Assistant 🤖**: Practical, accessible, and warm.
    2. **Strict Environmentalist 🧬**: Direct, scientific, focusing on raw numbers and rigid rules.
    3. **Eco-Optimist ☀️**: Highly encouraging, positive, and focused on hopeful motivators.
    4. **Climate Commander 🎖️**: Action-oriented military-style tactical target approach.
*   **Creativity Slider**: Connects to the model's `temperature` parameter (0.1 to 1.0) so users can toggle between precise, structured advice versus creative alternative suggestions.

---

## 4. Accessibility & Inclusive Design
CarbAware includes a dedicated **Visual Customization** Settings interface:
*   **Compact Mode**: Toggles spacing paddings and layout widths to accommodate smaller display views.
*   **Reduced Motion**: Instantly strips all transition animations and slide effects. This is a critical feature for users with vestibular disorders or motion sensitivities.
*   **Frosted Opacity Customizer**: A slider that adjusts the opacity percentage of glassmorphic panels (5% to 40%) to ensure text readability contrasts are always satisfying.

---

## 5. Testing & Verification
CarbAware includes a test suite managed by **Vitest** to validate the carbon footprint mathematical formulas.
*   To run tests:
    ```bash
    npm run test
    ```
*   **Test Results**: Core footprint computations (housing energy, transport categories, diet types) pass verification tests:
    ```text
    ✓ src/utils/carbonCalculator.test.ts (3 tests) 3ms
    Test Files  1 passed (1)
         Tests  3 passed (3)
    ```

---

## 6. Project Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   NVIDIA NIM API Key (Configured in `src/config.ts`)
*   Supabase Account (Configured in `.env`)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/aayushbamal/CarbAware.git
   cd CarbAware
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 7. Assumptions Made
1. **Supabase Redirects**: Assumes the developer has configured their Google Client credentials and local/production redirect callbacks (e.g. `http://localhost:5173`) inside their Supabase project console.
2. **NVIDIA Completion model**: Assumes the API key has permission scopes for the public chat completion endpoint `integrate.api.nvidia.com` hosting `meta/llama-3.3-70b-instruct`.
