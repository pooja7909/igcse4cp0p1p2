// Two addresses for the same app:
//  - the TEACHER address (your normal one, e.g. igcse4cp0p1p2-mtps.vercel.app) opens the teacher sign-in,
//  - the STUDENT address (an extra domain added in Vercel) is the only one students are given.
// On the student address there is no sign-in at all, and every link a student opens keeps them on it.
// Until the student address has been added in Vercel, everything works on one address as before.

export const STUDENT_HOST: string = (((import.meta as any).env?.VITE_STUDENT_HOST as string) || "bisb-cs-students.vercel.app").toLowerCase();
const OK_KEY = "edexcel_student_site_ok";

export function isStudentSite(): boolean {
  try {
    return window.location.host.toLowerCase() === STUDENT_HOST;
  } catch {
    return false;
  }
}

/** Last known answer to "has the student address been set up?" (saved in this browser). */
export function studentSiteKnownOk(): boolean {
  try {
    const v = JSON.parse(localStorage.getItem(OK_KEY) || "null");
    return !!(v && v.ok && Date.now() - v.at < 7 * 86400000);
  } catch {
    return false;
  }
}

/** Asks the student address whether it is this app. Remembers the answer. */
export async function checkStudentSite(): Promise<boolean> {
  if (isStudentSite()) return true;
  let ok = false;
  try {
    const r = await fetch(`${window.location.protocol}//${STUDENT_HOST}/api/site-check`, { signal: AbortSignal.timeout(4000) });
    const d = await r.json();
    ok = r.ok && d && d.app === "igcse-4cp0";
  } catch {
    ok = false;
  }
  try {
    localStorage.setItem(OK_KEY, JSON.stringify({ ok, at: Date.now() }));
  } catch {}
  return ok;
}

/** The address to put in links and QR codes for students. */
export function studentOrigin(): string {
  if (typeof window === "undefined") return "";
  if (isStudentSite()) return window.location.origin;
  return studentSiteKnownOk() ? `${window.location.protocol}//${STUDENT_HOST}` : window.location.origin;
}
