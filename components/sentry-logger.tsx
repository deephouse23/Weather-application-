"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

/**
 * Client-side Sentry logger component.
 * Logs page views to Sentry Logs for testing.
 */
export function SentryLogger() {
    useEffect(() => {
        // Client-side Sentry log test
        Sentry.logger.info("16-Bit Weather client page view", {
            path: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        })

        Sentry.logger.debug("Client initialized", {
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
        })
    }, [])

    return null
}
