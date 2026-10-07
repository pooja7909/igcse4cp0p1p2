/**
 * Multi-Teacher Authentication and Faculty Session Client Helper.
 * Supports individual teacher registrations, logins, profile tracking, and secure bearer tokens.
 */

import { TeacherProfile } from "../types";
export type { TeacherProfile };

const TEACHER_TOKEN_KEY = "edexcel_teacher_token";
const TEACHER_PROFILE_KEY = "edexcel_teacher_profile";

// Teacher logins are kept only until the browser (or tab) is closed, never "remembered"
// on the computer. On shared classroom computers a student opening the app later must
// never land in a teacher's dashboard.
try {
  // One-time cleanup of logins remembered by older versions of the app
  localStorage.removeItem(TEACHER_TOKEN_KEY);
  localStorage.removeItem(TEACHER_PROFILE_KEY);
} catch (e) {}

export function getTeacherToken(): string | null {
  try {
    return sessionStorage.getItem(TEACHER_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setTeacherToken(token: string, _persist = false): void {
  try {
    sessionStorage.setItem(TEACHER_TOKEN_KEY, token);
  } catch (e) {}
}

export function getStoredTeacherProfile(): TeacherProfile | null {
  try {
    const raw = sessionStorage.getItem(TEACHER_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function setStoredTeacherProfile(profile: TeacherProfile, _persist = false): void {
  try {
    sessionStorage.setItem(TEACHER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {}
}

export function clearTeacherToken(): void {
  try {
    sessionStorage.removeItem(TEACHER_TOKEN_KEY);
    localStorage.removeItem(TEACHER_TOKEN_KEY);
    sessionStorage.removeItem(TEACHER_PROFILE_KEY);
    localStorage.removeItem(TEACHER_PROFILE_KEY);
  } catch (e) {}
}

export interface TeacherLoginParams {
  email?: string;
  password?: string;
  passcode?: string;
}

export async function teacherLogin(
  params: TeacherLoginParams | string
): Promise<{ success: boolean; teacher?: TeacherProfile; error?: string }> {
  const passcode = typeof params === "string" ? params.trim() : params.passcode?.trim();
  const email = typeof params === "object" ? params.email?.trim() : "";
  const password = typeof params === "object" ? params.password : "";

  try {
    const body = typeof params === "string" ? { passcode: params.trim() } : params;
    const res = await fetch("/api/teacher/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (res.ok && data.token) {
        setTeacherToken(data.token);
        if (data.teacher) {
          setStoredTeacherProfile(data.teacher);
        }
        return { success: true, teacher: data.teacher };
      }
      return { success: false, error: data.error || "Incorrect teacher credentials." };
    }
  } catch (e: any) {
    console.warn("Backend authentication API unreachable:", e);
    return { success: false, error: "Could not reach the server to sign in. Check your connection and try again." };
  }

  return { success: false, error: "Could not sign in: unexpected response from the server." };
}

export interface TeacherRegisterParams {
  name: string;
  email: string;
  password: string;
  school?: string;
  department?: string;
}

export async function teacherRegister(
  params: TeacherRegisterParams
): Promise<{ success: boolean; teacher?: TeacherProfile; error?: string }> {
  try {
    const res = await fetch("/api/teacher/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (res.ok && data.token) {
      setTeacherToken(data.token);
      if (data.teacher) {
        setStoredTeacherProfile(data.teacher);
      }
      return { success: true, teacher: data.teacher };
    }
    return { success: false, error: data.error || "Registration failed. Please check your details." };
  } catch (e: any) {
    return { success: false, error: "Network error connecting to registration service." };
  }
}

export async function teacherLogout(): Promise<void> {
  const token = getTeacherToken();
  if (token) {
    try {
      await fetch("/api/teacher/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {}
  }
  clearTeacherToken();
}

export async function teacherChangePassword(
  oldPasscode: string,
  newPasscode: string
): Promise<{ success: boolean; error?: string }> {
  const token = getTeacherToken();
  if (!token) {
    return { success: false, error: "Teacher session expired. Please re-authenticate." };
  }

  try {
    const res = await fetch("/api/teacher/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPasscode, newPasscode }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // The server invalidates old sessions on password change and returns a new token.
      if (data.token) setTeacherToken(data.token);
      return { success: true };
    }
    return { success: false, error: data.error || "Failed to update passcode." };
  } catch (e: any) {
    return { success: false, error: "Network error updating credentials." };
  }
}

export async function fetchCurrentTeacher(): Promise<TeacherProfile | null> {
  const token = getTeacherToken();
  if (!token) return null;

  try {
    const res = await fetch("/api/teacher/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.teacher) {
        setStoredTeacherProfile(data.teacher);
        return data.teacher;
      }
    }
  } catch (e) {
    console.warn("Could not fetch current teacher profile:", e);
  }
  return getStoredTeacherProfile();
}

export async function fetchAllTeachers(): Promise<TeacherProfile[]> {
  const token = getTeacherToken();
  if (!token) return [];

  try {
    const res = await fetch("/api/teachers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.teachers || [];
    }
  } catch (e) {
    console.warn("Could not fetch teachers list:", e);
  }
  return [];
}

export async function verifyTeacherToken(): Promise<boolean> {
  const token = getTeacherToken();
  if (!token) return false;

  try {
    const res = await fetch("/api/teacher/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.teacher) {
        setStoredTeacherProfile(data.teacher);
      }
      if (data.authenticated || data.valid) return true;
    }
    if (res.status === 401) {
      // Definitive answer from the server: the session is invalid or expired.
      clearTeacherToken();
      return false;
    }
  } catch (e) {
    console.warn("Token verification check failed or offline:", e);
  }

  // Server unreachable: keep the stored session; protected requests will re-check it.
  return !!getStoredTeacherProfile();
}

export const TEACHER_SESSION_EXPIRED_EVENT = "teacher-session-expired";

/** Returns the current teacher token (empty string if not signed in). */
export function ensureTeacherToken(): string {
  return getTeacherToken() || "";
}

export async function teacherFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = ensureTeacherToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, {
    ...init,
    headers,
  });

  // Session missing or expired: sign out locally and ask the app to show the login screen.
  if (res.status === 401) {
    clearTeacherToken();
    try {
      window.dispatchEvent(new Event(TEACHER_SESSION_EXPIRED_EVENT));
    } catch {}
  }

  return res;
}
