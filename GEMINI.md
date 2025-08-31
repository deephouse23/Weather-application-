0# GEMINI.md

## Project Overview

This is a Next.js web application that provides a retro 16-bit styled weather forecast experience. It fetches data from various weather APIs and presents it in a nostalgic terminal interface. The application is built with React, Next.js, and TypeScript, and styled with Tailwind CSS.

### Key Technologies

*   **Framework:** Next.js 14
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI:** React 19
*   **State Management:** React Hooks and Context API
*   **Data Fetching:** `fetch` API, with client-side caching
*   **Deployment:** Vercel

## Building and Running

### Prerequisites

*   Node.js 16+
*   npm or yarn
*   OpenWeatherMap API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/deephouse23/Weather-application-.git
    cd Weather-application-
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your API keys:
    ```
    NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
    NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here
    NEXT_PUBLIC_GOOGLE_AIR_QUALITY_API_KEY=your_google_air_quality_key_here
    ```

### Commands

*   **Run development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

*   **Create a production build:**
    ```bash
    npm run build
    ```

*   **Start production server:**
    ```bash
    npm start
    ```

*   **Run tests:**
    ```bash
    npm test
    ```

*   **Lint the code:**
    ```bash
    npm run lint
    ```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Utility classes are preferred over custom CSS.
*   **Components:** Components are organized in the `components` directory. Reusable components are encouraged.
*   **State Management:** Global state (like theme and location) is managed using React's Context API. Component-level state is managed with `useState` and `useEffect` hooks.
*   **API Calls:** API calls are handled in the `lib/weather-api.ts` file. The application uses a client-side caching mechanism to reduce API calls.
*   **Error Handling:** The application uses Error Boundaries to catch and handle rendering errors in components.
*   **SEO:** The application is optimized for SEO with dynamic metadata and a sitemap.
