import { GET as ledgerSummaryGet } from "@/app/api/ledger/summary/route";

/**
 * Deprecated alias — superseded by /api/ledger/summary (see
 * docs/governance/DEFERRED_WORK.md, "dashboard and cashout both depend on
 * a /api/debug/* route"). Kept as a re-export, not deleted, per Rule 14.
 */
export const GET = ledgerSummaryGet;
