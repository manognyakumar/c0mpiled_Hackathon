/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * i18n — Zero-Hydration-Error Translation System
 *
 * All translations are a flat Record<string, {en, ar}>.
 * The t() helper is pure — no side effects, no flicker.
 * Locale is read once on mount via the provider.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import type { Locale } from './types';

/* ══════════════════════════════════════════════════════
   TRANSLATION DICTIONARY
   ══════════════════════════════════════════════════════ */

const dict: Record<string, Record<Locale, string>> = {
  // ── Navigation — Resident ──────────────────────────
  "Dashboard":           { en: "Dashboard",           ar: "لوحة التحكم" },
  "Today's Schedule":    { en: "Today's Schedule",    ar: "جدول اليوم" },
  "Schedule":            { en: "Schedule",            ar: "الجدول" },
  "Approval Requests":   { en: "Approval Requests",   ar: "طلبات الموافقة" },
  "Approvals":           { en: "Approvals",           ar: "الموافقات" },
  "Recurring Visitors":  { en: "Recurring Visitors",  ar: "الزوار المتكررون" },
  "Recurring":           { en: "Recurring",           ar: "متكرر" },
  "Settings":            { en: "Settings",            ar: "الإعدادات" },

  // ── Navigation — Guard ─────────────────────────────
  "Status Check":        { en: "Status Check",        ar: "فحص الحالة" },
  "New Request":         { en: "New Request",         ar: "طلب جديد" },
  "Active Log":          { en: "Active Log",          ar: "السجل النشط" },

  // ── Actions ────────────────────────────────────────
  "Approve":             { en: "Approve",             ar: "موافقة" },
  "Deny":                { en: "Deny",                ar: "رفض" },
  "Add Recurring Visitor": { en: "Add Recurring Visitor", ar: "إضافة زائر متكرر" },
  "Add":                 { en: "Add",                 ar: "إضافة" },
  "Allow Entry":         { en: "Allow Entry",         ar: "السماح بالدخول" },
  "Contact Resident":    { en: "Contact Resident",    ar: "الاتصال بالمقيم" },

  // ── Status Labels ──────────────────────────────────
  "APPROVED":            { en: "APPROVED",            ar: "موافق عليه" },
  "PENDING":             { en: "PENDING",             ar: "قيد الانتظار" },
  "EXPIRED":             { en: "EXPIRED",             ar: "منتهي الصلاحية" },
  "DENIED":              { en: "DENIED",              ar: "مرفوض" },
  "UNKNOWN":             { en: "UNKNOWN",             ar: "غير معروف" },
  "Loading":             { en: "Loading",             ar: "جارٍ التحميل" },
  "Loading...":          { en: "Loading...",          ar: "جارٍ التحميل..." },

  // ── Dashboard ──────────────────────────────────────
  "Today":               { en: "Today",               ar: "اليوم" },
  "Pending":             { en: "Pending",             ar: "قيد الانتظار" },
  "Approved":            { en: "Approved",            ar: "موافق عليه" },
  "On Premises":         { en: "On Premises",         ar: "في المبنى" },
  "Expected":            { en: "Expected",            ar: "متوقع" },
  "visitors":            { en: "visitors",            ar: "زوار" },
  "requests":            { en: "requests",            ar: "طلبات" },
  "No visitors today":   { en: "No visitors today",   ar: "لا يوجد زوار اليوم" },
  "No approval requests": { en: "No approval requests", ar: "لا توجد طلبات موافقة" },
  "No recurring visitors": { en: "No recurring visitors", ar: "لا يوجد زوار متكررون" },

  // ── Time ───────────────────────────────────────────
  "30 minutes":          { en: "30 minutes",          ar: "30 دقيقة" },
  "1 hour":              { en: "1 hour",              ar: "ساعة واحدة" },
  "2 hours":             { en: "2 hours",             ar: "ساعتان" },
  "Custom":              { en: "Custom",              ar: "مخصص" },
  "Until":               { en: "Until",               ar: "حتى" },
  "Valid until":          { en: "Valid until",         ar: "صالح حتى" },

  // ── Approval Detail ────────────────────────────────
  "Visitor Details":     { en: "Visitor Details",     ar: "تفاصيل الزائر" },
  "Requested":           { en: "Requested",           ar: "مطلوب" },
  "Grant Access":        { en: "Grant Access",        ar: "منح الوصول" },
  "Grant access for":    { en: "Grant access for",    ar: "منح الوصول لمدة" },
  "Add Note":            { en: "Add Note",            ar: "إضافة ملاحظة" },
  "Optional note":       { en: "Optional note",       ar: "ملاحظة اختيارية" },
  "Confirm Approval":    { en: "Confirm Approval",    ar: "تأكيد الموافقة" },
  "Confirm Denial":      { en: "Confirm Denial",      ar: "تأكيد الرفض" },
  "Approved until":      { en: "Approved until",      ar: "تمت الموافقة حتى" },
  "Denied":              { en: "Denied",              ar: "تم الرفض" },
  "Success":             { en: "Success",             ar: "نجح" },

  // ── Voice ──────────────────────────────────────────
  "Hold to speak":       { en: "Hold to speak",       ar: "اضغط مع الاستمرار للتحدث" },
  "Release to send":     { en: "Release to send",     ar: "حرر للإرسال" },
  "Recording...":        { en: "Recording...",        ar: "جارٍ التسجيل..." },
  "Processing voice...": { en: "Processing voice...", ar: "جارٍ معالجة الصوت..." },
  "Microphone permission denied": { en: "Microphone permission denied", ar: "تم رفض إذن الميكروفون" },
  "Voice Command":       { en: "Voice Command",       ar: "الأمر الصوتي" },
  "Tap to speak":        { en: "Tap to speak",        ar: "اضغط للتحدث" },
  "Listening":           { en: "Listening",           ar: "جارٍ الاستماع" },
  "Processing":          { en: "Processing",          ar: "جارٍ المعالجة" },
  "Transcript":          { en: "Transcript",          ar: "النص المكتوب" },
  "Confirm & Add":       { en: "Confirm & Add",       ar: "تأكيد وإضافة" },

  // ── Guard App ──────────────────────────────────────
  "Search visitor or apartment": { en: "Search visitor or apartment", ar: "ابحث عن زائر أو شقة" },
  "Search":              { en: "Search",              ar: "بحث" },
  "Upcoming Arrivals":   { en: "Upcoming Arrivals",   ar: "الوصول القادم" },
  "Check Status":        { en: "Check Status",        ar: "التحقق من الحالة" },
  "Apartment":           { en: "Apartment",           ar: "الشقة" },
  "Entry Not Allowed":   { en: "Entry Not Allowed",   ar: "الدخول غير مسموح" },
  "No visitors expected today": { en: "No visitors expected today", ar: "لا يوجد زوار متوقعون اليوم" },

  // ── New Visitor Form ───────────────────────────────
  "New Visitor":         { en: "New Visitor",         ar: "زائر جديد" },
  "Visitor Name":        { en: "Visitor Name",        ar: "اسم الزائر" },
  "Apartment Number":    { en: "Apartment Number",    ar: "رقم الشقة" },
  "Visitor Purpose":     { en: "Visitor Purpose",     ar: "غرض الزيارة" },
  "Take Photo":          { en: "Take Photo",          ar: "التقاط صورة" },
  "Retake":              { en: "Retake",              ar: "إعادة التقاط" },
  "Submit Request":      { en: "Submit Request",      ar: "إرسال الطلب" },
  "Waiting for approval": { en: "Waiting for approval", ar: "في انتظار الموافقة" },

  // ── Active Log ─────────────────────────────────────
  "Expected Today":      { en: "Expected Today",      ar: "متوقع اليوم" },
  "History":             { en: "History",             ar: "السجل" },
  "Check Out":           { en: "Check Out",           ar: "تسجيل الخروج" },
  "Checked in":          { en: "Checked in",          ar: "تم تسجيل الدخول" },
  "Overstay":            { en: "Overstay",            ar: "تجاوز المدة" },

  // ── Form Labels ────────────────────────────────────
  "Name":                { en: "Name",                ar: "الاسم" },
  "Role":                { en: "Role",                ar: "الدور" },
  "Recurrence":          { en: "Recurrence",          ar: "التكرار" },
  "Active":              { en: "Active",              ar: "نشط" },
  "Inactive":            { en: "Inactive",            ar: "غير نشط" },
  "Purpose":             { en: "Purpose",             ar: "الغرض" },

  // ── Settings ───────────────────────────────────────
  "Profile":             { en: "Profile",             ar: "الملف الشخصي" },
  "Language":            { en: "Language",            ar: "اللغة" },
  "Notifications":       { en: "Notifications",       ar: "الإشعارات" },
  "Auto-approve recurring": { en: "Auto-approve recurring", ar: "الموافقة التلقائية على المتكررين" },
  "Notification sound":  { en: "Notification sound",  ar: "صوت الإشعار" },
  "Push notifications":  { en: "Push notifications",  ar: "الإشعارات الفورية" },

  // ── Common ─────────────────────────────────────────
  "Cancel":              { en: "Cancel",              ar: "إلغاء" },
  "Confirm":             { en: "Confirm",             ar: "تأكيد" },
  "Save":                { en: "Save",                ar: "حفظ" },
  "Edit":                { en: "Edit",                ar: "تعديل" },
  "Delete":              { en: "Delete",              ar: "حذف" },
  "Close":               { en: "Close",               ar: "إغلاق" },
  "Back":                { en: "Back",                ar: "رجوع" },
  "Next":                { en: "Next",                ar: "التالي" },
  "Done":                { en: "Done",                ar: "تم" },
  "Error":               { en: "Error",               ar: "خطأ" },
};

/* ══════════════════════════════════════════════════════
   TRANSLATION FUNCTION — Pure, zero side-effects
   ══════════════════════════════════════════════════════ */

/** Pure translation lookup. Falls back to key. */
export function t(key: string, locale: Locale = 'en'): string {
  return dict[key]?.[locale] ?? dict[key]?.en ?? key;
}

/* ══════════════════════════════════════════════════════
   LOCALE UTILITIES — Client-safe helpers
   ══════════════════════════════════════════════════════ */

/** Read persisted locale — returns 'en' on server */
export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const v = localStorage.getItem('locale');
    return v === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

/** Persist locale choice */
export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('locale', locale); } catch { /* noop */ }
}

/** RTL check */
export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}
