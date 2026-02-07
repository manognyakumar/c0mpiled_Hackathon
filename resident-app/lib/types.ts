/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TYPES — Discriminated unions, no `any`, ever.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/* ── Locale ────────────────────────────────────────── */
export type Locale = 'en' | 'ar';
export type Dir = 'ltr' | 'rtl';

/* ── Visitor Status — Discriminated Union ──────────── */
export type VisitorStatus = 'APPROVED' | 'PENDING' | 'EXPIRED' | 'DENIED' | 'scheduled' | 'arrived' | 'expired';

export interface Visitor {
  id: string;
  name: string;
  time_window: string;
  status: VisitorStatus;
  purpose?: string;
  photo_url?: string;
}

/* ── Approval Request ──────────────────────────────── */
export interface ApprovalRequest {
  id: string;
  name: string;
  purpose: string;
  requested_at: string;
  photo_url?: string;
}

/* ── Recurring Visitor ─────────────────────────────── */
export interface RecurringVisitor {
  id: string;
  name: string;
  role: string;
  recurrence_rule: string;
  active: boolean;
}

/* ── API Payloads ──────────────────────────────────── */
export interface ApprovePayload {
  visitor_id: string;
  valid_until: string;
}

export interface DenyPayload {
  visitor_id: string;
}

/* ── Voice ─────────────────────────────────────────── */
export interface VoiceProcessingResponse {
  ok: boolean;
  transcript: string;
  locale_guess?: Locale;
}

/* ── Dashboard Stats ───────────────────────────────── */
export interface DashboardStats {
  today: number;
  pending: number;
  approved: number;
  onPremises: number;
}

