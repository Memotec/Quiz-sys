/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  u: string;  // username
  p: string;  // password
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface Question {
  t: string;      // Topic
  q: string;      // Question text
  o: string[];    // Options (usually 4 choices)
  a: number;      // Correct answer index (0-3)
  e?: string;     // Explanation
  c?: string;     // Custom command/CLI code if applicable
}

export interface ExamConfig {
  qty: number;    // Number of questions in an exam
  time: number;   // Duration in minutes
}

export interface ExamResult {
  id?: string;
  user: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  secondsTaken: number;
  createdAt: any;       // Firestore timestamp or date string
  answers?: Record<number, number>;
}

export interface TestState {
  user: User | null;
  questions: Question[];
  answers: Record<number, number>; // question index -> selected option index
  idx: number;                     // Current question index active
  secondsLeft: number;             // Seconds remaining in the test
  initialSeconds: number;          // Total quiz duration in seconds
  isSubmitted: boolean;            // Whether the exam is submitted and evaluated
}
