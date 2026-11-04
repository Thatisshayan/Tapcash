#!/bin/bash
# Set Netlify env vars for TapCash build

netlify env:set FIREBASE_PROJECT_ID "tapcash-16238" --scope builds --scope functions --force
netlify env:set FIREBASE_CLIENT_EMAIL "firebase-adminsdk-xxxxx@tapcash-16238.iam.gserviceaccount.com" --scope builds --scope functions --force
netlify env:set SESSION_SECRET "placeholder-session-secret-change-me-in-production!!!!!!" --scope builds --scope functions --force
netlify env:set RAPIDOREACH_APP_ID "placeholder" --scope builds --scope functions --force
netlify env:set RAPIDOREACH_APP_KEY "placeholder" --scope builds --scope functions --force
netlify env:set RAPIDOREACH_APP_SECRET "placeholder" --scope builds --scope functions --force
netlify env:set RAPIDOREACH_TRANSACTION_KEY "placeholder" --scope builds --scope functions --force
netlify env:set PROXYCHECK_API_KEY "placeholder" --scope builds --scope functions --force
netlify env:set RESEND_API_KEY "placeholder" --scope builds --scope functions --force
netlify env:set PAYPAL_CLIENT_ID "placeholder" --scope builds --scope functions --force
netlify env:set PAYPAL_CLIENT_SECRET "placeholder" --scope builds --scope functions --force
netlify env:set TREMENDOUS_API_KEY "placeholder" --scope builds --scope functions --force
netlify env:set TREMENDOUS_CAMPAIGN_ID "placeholder" --scope builds --scope functions --force
netlify env:set TREMENDOUS_ENVIRONMENT "testflight" --scope builds --scope functions --force
netlify env:set SENTRY_DSN "https://placeholder@placeholder.ingest.sentry.io/0" --scope builds --scope functions --force
netlify env:set SENTRY_ORG "placeholder" --scope builds --scope functions --force
netlify env:set SENTRY_PROJECT "tapcash" --scope builds --scope functions --force
netlify env:set SENTRY_AUTH_TOKEN "placeholder" --scope builds --scope functions --force
netlify env:set UPSTASH_REDIS_REST_URL "https://placeholder.upstash.io" --scope builds --scope functions --force
netlify env:set UPSTASH_REDIS_REST_TOKEN "placeholder" --scope builds --scope functions --force
netlify env:set ADMIN_UIDS "placeholder" --scope builds --scope functions --force
netlify env:set CRON_SECRET "placeholder-cron-secret-change-me" --scope builds --scope functions --force
netlify env:set NEXT_PUBLIC_APP_URL "https://tapcash.online" --scope builds --scope functions --force
netlify env:set LOOTABLY_API_KEY "placeholder" --scope builds --scope functions --force
netlify env:set LOOTABLY_SECRET_KEY "placeholder" --scope builds --scope functions --force

echo "All env vars set!"
