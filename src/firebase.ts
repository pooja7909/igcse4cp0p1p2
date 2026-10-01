/**
 * Browser-side Firestore access has been switched off.
 *
 * The server (server.ts + serverStore.ts) is now the single source of truth and
 * stores everything in Firestore itself. When every browser also read and wrote
 * Firestore directly (live listeners on the whole question bank, a write on every
 * autosave), the free daily quota ran out within one lesson.
 *
 * These functions keep their original names and signatures so the rest of the app
 * works unchanged; they simply do nothing. Live updates come from the server, which
 * the dashboards already poll.
 */
import { Assessment, StudentSession } from "./types";

export async function syncAssessmentToFirestore(_assessment: Assessment): Promise<void> {}

export async function fetchAssessmentFromFirestore(_codeOrId: string): Promise<Assessment | null> {
  return null;
}

export function subscribeToAssessmentStudents(
  _assessmentId: string,
  _onUpdate: (students: Record<string, StudentSession>) => void
): () => void {
  return () => {};
}

export async function syncStudentSessionToFirestore(
  _assessmentId: string,
  _studentSession: Partial<StudentSession> & { studentId: string }
): Promise<void> {}

export async function fetchAllAssessmentsFromFirestore(): Promise<Assessment[]> {
  return [];
}

export function subscribeToAllAssessments(_onUpdate: (assessments: Assessment[]) => void): () => void {
  return () => {};
}

export async function syncCustomQuestionToFirestore(_question: any): Promise<void> {}

export function subscribeToCustomQuestions(_onUpdate: (questions: any[]) => void): () => void {
  return () => {};
}
