# Security Status

**Date:** 2026-05-16
**Project:** TapCash MVP

## Service Account Key
- **File Name:** `serviceAccountKey.json`
- **Git Tracking Status:** UNTRACKED. The file has been removed from Git tracking via `git rm --cached` and is explicitly listed in `.gitignore` (which was fixed to remove UTF-16 corruption).
- **Rotation Required:** YES. Since the file was previously tracked in earlier commits before the `.gitignore` fix, the key exists in the Git history. It is highly recommended to rotate this Firebase Admin key immediately in the Firebase Console.

## Next Steps
1. Generate a new private key in Firebase Console -> Project Settings -> Service Accounts.
2. Download the new JSON and overwrite the local `serviceAccountKey.json`.
3. Delete the old key in the Firebase Console.
4. Never commit the new key.
