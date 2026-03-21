# Firestore `users` — operational notes

## Blank `password_hash`

Some user documents may have an **empty or missing `password_hash`**. Common cases:

- **Google / OAuth-only** accounts (never set a Pixel Place password).
- **Legacy or manual imports** where the field was omitted.
- **Partial writes** or older clients that did not populate the field.

**Behavior:** Email/username + password login compares against `password_hash`. If it is blank, login fails with invalid credentials until the user sets a password through a supported flow (e.g. admin reset, account linking, or registration path that writes a bcrypt hash).

Do not assume every user row has a non-empty `password_hash` when writing admin tools or migrations.
