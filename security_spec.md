# Fashcon Security Specification

## Data Invariants
1. **RBAC**: Only users with `role: 'admin'` or `role: 'super_admin'` can perform write operations on `blogs`, `products`, and `categories`.
2. **Super Admin Exclusivity**: Only `super_admin` can manage `users` (specifically roles) and perform hard deletes.
3. **Audit Trail**: Every administrative write MUST be logged (handled via application code, but rules should restrict log writes to authenticated admins).
4. **Immutability**: `createdAt` and `authorId` must not change after creation.
5. **Soft Delete**: Admins can only set `isDeleted: true`. Hard delete is reserved for `super_admin`.
6. **PII Protection**: User email and role data is strictly protected.

## The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Identity Spoofing**: Admin attempts to create a blog post with a different `authorId`.
2. **Privilege Escalation**: A standard user attempts to update their own `role` to `super_admin`.
3. **Shadow Update**: Admin attempts to hard delete a blog post (`delete` operation) instead of soft deleting (`update isDeleted`).
4. **Value Poisoning**: An attacker attempts to inject a 2MB string into a `slug` field.
5. **Relationship Orphan**: Creating a blog post with a `categoryId` that doesn't exist.
6. **Bypass Master Gate**: Admin attempts to update a blog post that has already reached a "Terminal State" (e.g., status: 'archived') without super_admin rights.
7. **PII Leak**: A standard user attempts to `get` the private profile of another user.
8. **Resource Exhaustion**: Sending an array with 10,000 tags in a blog post.
9. **Timestamp Manipulation**: Admin providing a `createdAt` date from 2010.
10. **Query Scrape**: An unauthenticated user attempts to `list` the entire `analytics` collection.
11. **Action Bypass**: An admin attempts to update `viewCount` directly (should be incremental/system-only).
12. **Terminal Status Lock**: A standard admin trying to un-publish a post that was locked by a super admin.

## Test Runner (Logic Overview)

The testing logic will verify that:
- `isSignedIn()` is enforced.
- `role` checks are accurate.
- `isValidBlog()`, `isValidProduct()`, etc., enforce key and size constraints.
- `affectedKeys().hasOnly()` guards specific update pathways.
