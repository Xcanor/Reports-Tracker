/**
 * Deadline Validation and Submission Status Utilities
 * Handles deadline checking and submission status determination
 */

/**
 * Checks if a submission is on-time or late
 * @param submissionDate - ISO date string of submission (e.g., "2026-04-29")
 * @param deadlineDate - ISO date string of deadline (e.g., "2026-04-30")
 * @returns 'on_time' if submissionDate <= deadlineDate, 'late' otherwise
 */
export function checkSubmissionTiming(
  submissionDate: string,
  deadlineDate: string
): 'on_time' | 'late' {
  try {
    const submission = new Date(submissionDate);
    const deadline = new Date(deadlineDate);

    // Add one day to deadline end (deadline is end of day, inclusive)
    deadline.setDate(deadline.getDate() + 1);

    return submission < deadline ? 'on_time' : 'late';
  } catch {
    console.error('Invalid date format in checkSubmissionTiming');
    return 'late'; // Default to late for safety
  }
}

/**
 * Determines submission status based on current submission state
 * @param submissionDate - ISO date string or null
 * @param deadlineDate - ISO date string
 * @param isSubmitted - Whether form was submitted
 * @returns SubmissionStatus: 'not_started' | 'pending' | 'submitted' | 'late'
 */
export function determineSubmissionStatus(
  submissionDate: string | null,
  deadlineDate: string,
  isSubmitted: boolean
): 'not_started' | 'pending' | 'submitted' | 'late' {
  if (!isSubmitted && !submissionDate) {
    return 'not_started';
  }

  if (submissionDate) {
    return checkSubmissionTiming(submissionDate, deadlineDate) === 'on_time'
      ? 'submitted'
      : 'late';
  }

  return 'pending';
}

/**
 * Gets deadline date for a given month/year (last day of month)
 * Useful for monthly report templates
 * @param month - Month number (1-12)
 * @param year - Year
 * @returns ISO date string (e.g., "2026-04-30")
 */
export function getMonthEndDeadline(month: number, year: number): string {
  const date = new Date(year, month, 0); // Day 0 of next month = last day of current month
  return date.toISOString().split('T')[0];
}

/**
 * Validates that a deadline date is properly formatted
 * @param deadlineDate - ISO date string
 * @returns true if valid date format
 */
export function isValidDeadlineDate(deadlineDate: string): boolean {
  try {
    const date = new Date(deadlineDate);
    return date instanceof Date && !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Gets human-readable deadline description
 * @param deadlineDate - ISO date string (e.g., "2026-04-30")
 * @returns Formatted string (e.g., "April 30, 2026")
 */
export function formatDeadlineDate(deadlineDate: string): string {
  try {
    const date = new Date(deadlineDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return deadlineDate;
  }
}

/**
 * Checks if current date is past deadline
 * @param deadlineDate - ISO date string
 * @returns true if today > deadline
 */
export function isDeadlinePassed(deadlineDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);

  return today > deadline;
}

/**
 * Gets days remaining until deadline
 * @param deadlineDate - ISO date string
 * @returns Number of days (negative if past deadline)
 */
export function getDaysUntilDeadline(deadlineDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);

  const diffMs = deadline.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
