import * as Sentry from "@sentry/nextjs";
import { replayIntegration } from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  enabled: !!process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    if (event.exception) {
      event.exception.values?.forEach((value) => {
        value.stacktrace?.frames?.forEach((frame) => {
          if (frame.abs_path?.includes("node_modules")) {
            frame.in_app = false;
          }
        });
      });
    }
    return event;
  },
  integrations: [
    Sentry.browserTracingIntegration(),
    replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
