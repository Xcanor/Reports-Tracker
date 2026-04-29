# Implementation Guide - Authentication & Submission Management Enhancements

**Date**: April 2026
**Version**: 2.0.0
**Status**: ✅ COMPLETE

## Overview

This document details all enhancements made to the Reports Tracker system:
1. Email + Mobile Login Support
2. Admin User Credential Management
3. Deadline Validation Fixes
4. Full Submission Data Visibility & CRUD

---

## 1. Authentication Enhancement

### New Login Method: Email/Mobile

**Endpoint**: LoginPage - Modern Auth Tab

Users can now login using:
- Email address (e.g., `maria.santos@dti.gov.ph`)
- Mobile number (e.g., `+639171234567` or `09171234567`)
- Password

**Validation Rules**:
- Email: Standard RFC format check
- Phone: Philippines format (`09XX-XXXXXXX` or `+639XX-XXXXXXX`)
- Phone numbers auto-normalized to `+63` format

### New Signup Method

**UI**: LoginPage - Sign Up tab, Modern Auth method

Required fields:
- Full Name (min 2 characters)
- Email (unique, valid format)
- Mobile Number (unique, valid format)
- Password (min 6 characters)
- Office (optional, defaults to RO-HQ)
- Division (optional)

**Validation**:
```typescript
validateSignupData({
  name: string,
  email: string,
  mobile: string,
  password: string
}): Record<string, string>
```

Returns validation errors or empty object if valid.

### Backward Compatibility

**Legacy Method Still Supported**:
- Login with: Name + Office + Division + Password
- Signup with: Name + Office + Password + Role + Division

Users can toggle between methods on login screen.

---

## 2. User Type Changes

### AppUser Interface

```typescript
interface AppUser {
  id: string;
  name: string;
  email: string;           // NEW
  mobile: string;          // NEW
  office: string;
  division?: string;
  number: string;          // Employee number
  role: UserRole;          // 'admin' | 'user'
  assignedTemplates: string[];
  createdAt: string;
  password: string;
}
```

### Data Migration

All mock users updated with sample data:
- Email: `firstname.lastname@dti.gov.ph`
- Mobile: `+6391712XXXXX`

---

## 3. Validation Utilities

### Location: `src/app/utils/validation.ts`

#### Functions

```typescript
// Email validation
isValidEmail(email: string): boolean
// Returns true if valid RFC format

// Phone validation (Philippines)
isValidPhone(phone: string): boolean
// Accepts: 09XXXXXXXXX, +639XXXXXXXXX, with hyphens, spaces

// Phone normalization
normalizePhoneNumber(phone: string): string
// Converts to +63XXXXXXXXX format

// Password validation
isValidPassword(password: string): boolean
// Min 6 characters

// Full signup validation
validateSignupData(data: {
  name?: string;
  email?: string;
  mobile?: string;
  password?: string;
}): Record<string, string>
// Returns error messages or empty

// Input type detection
detectInputType(input: string): 'email' | 'phone' | 'unknown'
```

### Usage Example

```typescript
import { isValidEmail, isValidPhone, validateSignupData } from '../utils/validation';

if (!isValidEmail(emailInput)) {
  setError('Invalid email format');
}

const errors = validateSignupData(formData);
if (Object.keys(errors).length > 0) {
  setError(Object.values(errors)[0]);
}
```

---

## 4. Deadline Validation

### Location: `src/app/utils/deadline.ts`

#### Functions

```typescript
// Check if submission is on-time or late
checkSubmissionTiming(
  submissionDate: string,      // ISO date
  deadlineDate: string         // ISO date
): 'on_time' | 'late'

// Determine full submission status
determineSubmissionStatus(
  submissionDate: string | null,
  deadlineDate: string,
  isSubmitted: boolean
): 'not_started' | 'pending' | 'submitted' | 'late'

// Get last day of month
getMonthEndDeadline(month: number, year: number): string
// Returns ISO date of last day

// Validate deadline format
isValidDeadlineDate(deadlineDate: string): boolean

// Format for display
formatDeadlineDate(deadlineDate: string): string
// Returns "April 30, 2026"

// Check if deadline passed
isDeadlinePassed(deadlineDate: string): boolean

// Calculate days remaining
getDaysUntilDeadline(deadlineDate: string): number
// Returns negative if past deadline
```

### Implementation Notes

**Important**: The old system stored submission `status` as a string without validating against actual deadlines. The new system:

1. **Stores**: `submissionDate` (when actually submitted)
2. **Compares**: `submissionDate <= deadlineDate` (inclusive)
3. **Sets Status**: Based on this comparison
4. **Prevents Bypassing**: Date stored on creation, not editable

---

## 5. Admin User Management

### Route: `/admin/users/edit`

### Component: `UsersEditPage`

**Features**:
- View all users in table format
- Search by: name, email, phone
- Inline editing mode
- Edit fields: Name, Email, Mobile, Role
- Delete user with confirmation
- Validation on each field
- Prevent duplicate emails/phones
- Prevent self-deletion

### UI Flow

1. Search/filter users
2. Click Edit icon
3. Inline fields become editable
4. Modify values with real-time validation
5. Click Save or Cancel
6. Success message appears

### Validation

- Email format check
- Phone format check
- Uniqueness validation (except current user)
- Required fields check

### API Usage

```typescript
const { updateUser, deleteUser, users } = useApp();

// Update user
updateUser(userId, {
  name: 'New Name',
  email: 'new@dti.gov.ph',
  mobile: '+639171234567',
  password: 'newpass123'
});

// Delete user
deleteUser(userId);
```

---

## 6. Submission Management

### Route: `/admin/submissions/manage`

### Component: `SubmissionsManagementPage`

**Features**:
- View all submissions in table
- Search by: user name, template
- Filter by status: submitted/pending/late/not_started
- View submission details in modal
- Delete submissions with confirmation
- Display full submission data (JSON format)

### UI Flow

1. Search/filter submissions
2. Click Eye icon to view details
3. Modal shows: User info, template, status, all submitted data
4. Click Trash icon to delete
5. Confirm deletion

### Available Data

Each submission displays:
- Submitted by (name, email)
- Template name & code
- Submission date
- Current status
- All form data entered

### CRUD Operations

| Operation | Status | Location |
|-----------|--------|----------|
| Create | ✅ | ReportSubmission page (user) |
| Read | ✅ | SubmissionsManagementPage |
| Update | ⚠️ | AppContext only (no UI) |
| Delete | ✅ | SubmissionsManagementPage |

### Future: Edit Submissions

Can add edit UI by calling:
```typescript
const { updateSubmission } = useApp();
updateSubmission(submissionId, {
  status: 'submitted',
  data: { field1: 'value1', ... }
});
```

---

## 7. Context API Changes

### AppContext Methods Added/Modified

```typescript
interface AppContextType {
  // New auth methods
  loginWithCredential(emailOrMobile: string, password: string): AppUser | null
  signupNew(data: { 
    name: string
    email: string
    mobile: string
    password: string
    office?: string
    division?: string 
  }): AppUser | null
  
  // New user methods
  getUserByEmailOrMobile(emailOrMobile: string): AppUser | undefined
  
  // New submission methods
  deleteSubmission(id: string): void
  getSubmissionsByUserId(userId: string): Submission[]
  getSubmissionsByTemplateId(templateId: string): Submission[]
  
  // Existing (unchanged)
  login(...): AppUser | null           // Legacy
  signup(...): AppUser                 // Legacy
  updateSubmission(id, updates): void  // Still available
  addSubmission(submission): void      // Still available
}
```

---

## 8. Database Schema (Frontend Considerations)

### If migrating to backend database:

#### Users Table Changes
```sql
ALTER TABLE users 
ADD COLUMN email VARCHAR(255) UNIQUE NOT NULL,
ADD COLUMN mobile VARCHAR(20) UNIQUE NOT NULL;
```

#### Templates Table Changes
```sql
ALTER TABLE report_templates
ADD COLUMN deadline_date DATE;  -- For specific dates
```

#### Submission Integrity
```sql
-- Ensure submission data stored with dates
ALTER TABLE submissions
ADD CONSTRAINT check_on_time_late 
  CHECK (status IN ('submitted', 'pending', 'not_started', 'late'));
```

---

## 9. Testing Checklist

### Authentication Tests
- [x] Login with email + password
- [x] Login with phone + password
- [x] Signup with email/phone (new account)
- [x] Prevent duplicate email signup
- [x] Prevent duplicate phone signup
- [x] Legacy login still works (name/office)
- [x] Legacy signup still works

### Validation Tests
- [x] Email format validation
- [x] Phone format validation (09XX, +639XX)
- [x] Phone normalization to +63
- [x] Password min length
- [x] Required field validation

### Admin Features
- [x] View all users
- [x] Edit user name
- [x] Edit user email
- [x] Edit user mobile
- [x] Change user role
- [x] Delete user
- [x] Prevent self-deletion
- [x] Search users

### Submission Management
- [x] View all submissions
- [x] Filter by status
- [x] Search by user/template
- [x] View submission details
- [x] Delete submission
- [x] See submission data

### Deadline Validation
- [x] On-time submission (≤ deadline)
- [x] Late submission (> deadline)
- [x] Edge case: exact deadline
- [x] Timezone consistency

---

## 10. Demo & Testing

### Quick Test Steps

1. **New Email Login**:
   - Go to Login page
   - Select "Email / Phone" tab
   - Enter: `maria.santos@dti.gov.ph` / `admin123`
   - Should login as admin

2. **New Phone Login**:
   - Enter: `+639171234567` / `admin123`
   - Should login as same admin

3. **Admin User Management**:
   - Go to `/admin/users/edit`
   - Search for "Juan"
   - Click Edit on Juan dela Cruz
   - Change email to `juan.new@dti.gov.ph`
   - Click Save
   - Verify success message

4. **Submissions Management**:
   - Go to `/admin/submissions/manage`
   - Filter by "Late" status
   - Click Eye icon
   - View submission data
   - Click Trash to delete

---

## 11. Troubleshooting

### "Cannot find name 'isValidEmail'"
- Ensure import is present: `import { isValidEmail, isValidPhone } from '../utils/validation'`
- File location: `src/app/utils/validation.ts`

### Email/Phone not validating
- Phone must be 10 digits after 09 or +639
- Email must have @ and domain
- Use `detectInputType()` to debug what's being detected

### Deadline not comparing correctly
- Both dates must be ISO format: `YYYY-MM-DD`
- Use `getMonthEndDeadline()` for monthly reports
- Remember: deadline is inclusive (≤)

### User deletion failing
- Cannot delete own account
- User must be admin-logged in
- Confirmation dialog must be confirmed

---

## 12. Performance Considerations

- Email/phone validation is O(1) regex check
- User search is O(n) but typically fast for <1000 users
- Submission filtering is O(n) but cached with useMemo
- No database queries yet (frontend only)

---

## 13. Security Notes

⚠️ **Current Limitations** (Frontend-Only):
- Passwords not hashed (store in plain for demo)
- Email uniqueness only frontend-checked
- Phone uniqueness only frontend-checked
- No rate limiting on login attempts
- No audit logging

**Backend Implementation Needed**:
- Hash passwords with bcrypt
- Enforce uniqueness at database level
- Add rate limiting/throttling
- Implement audit logging
- Add email verification
- Add SMS verification (for phone)

---

## 14. Migration Guide (If Using Backend)

### User Creation
```javascript
// Old (still works)
signup(name, office, password, role, division)

// New preferred method
signupNew({
  name: 'Juan dela Cruz',
  email: 'juan@dti.gov.ph',
  mobile: '+639171234567',
  password: 'secure123',
  office: 'LEY',
  division: 'FAD'
})
```

### Login
```javascript
// Old (still works)
login(name, office, password, role, division)

// New preferred method
loginWithCredential('juan@dti.gov.ph', 'secure123')
// or
loginWithCredential('+639171234567', 'secure123')
```

---

## 15. Support & Questions

For issues or questions:
1. Check this guide first
2. Review validation functions in `src/app/utils/`
3. Check AppContext methods in `src/app/context/AppContext.tsx`
4. Look at component examples: UsersEditPage, SubmissionsManagementPage

---

**Last Updated**: April 29, 2026
**Next Review**: When moving to backend/database
