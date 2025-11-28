# GEMINI.md

This file provides a comprehensive overview of the 16-Bit Weather Platform, a Next.js application that delivers real-time weather information with a retro terminal aesthetic.

## Project Overview

The 16-Bit Weather Platform is a professional weather application built with Next.js 15, React 19, and TypeScript. It offers a wide range of features, including:

*   **Real-time Weather Data:** Temperature, conditions, wind, humidity, pressure, UV index, air quality, and pollen count.
*   **Interactive Forecasting:** 5-day and hourly forecasts.
*   **Location Services:** Search by city, ZIP code, or coordinates, with geolocation support.
*   **User Authentication:** Users can create accounts to save their favorite locations.
*   **Multiple Themes:** Dark, Miami, and Tron themes.
*   **Weather Radar:** An interactive map displaying weather patterns.
*   **Games Arcade:** Retro weather-themed games.
*   **News Aggregation:** Weather-related news from various sources.
*   **Learning Hub:** Educational content about weather phenomena.

The application is designed to be responsive, accessible, and performant, utilizing modern web technologies and best practices.

## Building and Running

### Prerequisites

*   Node.js 18+ and npm
*   OpenWeatherMap API key
*   Supabase account

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/deephouse23/Weather-application-.git
    cd Weather-application-
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables by creating a `.env.local` file and adding the necessary API keys and Supabase credentials.

### Development

To start the development server, run:

```bash
npm run dev
```

### Production

To build and start the application in production mode, run:

```bash
npm run build
npm start
```

### Testing

To run the test suite, use:

```bash
npm test
```

## Development Conventions

*   **Code Style:** The project follows standard TypeScript and React conventions. ESLint is used for linting.
*   **Testing:** The project uses Jest and React Testing Library for unit and integration testing. Playwright is used for end-to-end testing.
*   **Commits:** Commit messages should be clear and descriptive, following conventional commit standards.
*   **Branching:** Feature branches should be used for new features, and pull requests should be submitted for review.
*   **Styling:** Tailwind CSS is used for styling, with a custom theme system.
*   **Error Monitoring:** Sentry is used for error monitoring and reporting.
*   **Analytics:** Vercel Analytics and Speed Insights are used for performance monitoring.
