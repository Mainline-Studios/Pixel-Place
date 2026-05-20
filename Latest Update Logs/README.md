# Latest Update Logs

Version history for **Pixel Place** deploys. Newest release is listed first.

| Version | Nickname | Log |
|--------|----------|-----|
| **3.0** | Safehouse | [3.0 Safehouse LATEST](./3.0%20Safehouse%20LATEST.md) |
| 2.0 | Pyxbridge (mobile / touch) | [2.0 Pyxbridge](./2.0%20Pyxbridge.md) |
| 1.0 | Fresh Start | [1.0 Fresh Start](./1.0%20Fresh%20Start.md) |

## Log sections (current and future `LATEST` files)

| Section | Purpose |
|--------|---------|
| **Prior releases** | Links to every earlier log in this folder (newest predecessor first). |
| **Exits** | Checklist of the **previous** log’s **Roadmap** bullets — `[x]` done, `[ ]` still open. On the first log with a roadmap, list what this release actually shipped instead. |
| **Roadmap** | Forward-looking plans for the next era. |

## How to add a log on deploy

1. Remove `LATEST` from the current latest filename (e.g. `3.0 Safehouse LATEST.md` → `3.0 Safehouse.md`).
2. Update that file’s **Superseded by** line to link to the new version.
3. Add `[version] [Nickname] LATEST.md` with:
   - **Preceded by** → previous latest (single link).
   - **Prior releases** → all older logs (newest first).
   - **Exits** → copy each bullet from the demoted file’s **Roadmap**; mark `[x]` or `[ ]` honestly.
   - **Roadmap** → new forward plans.
4. Update this README table (new row at the top).
5. Commit with the deploy and push to `main`.

### Example — Exits when shipping 4.0 (from 3.0 Safehouse roadmap)

```markdown
## Exits

- [ ] **Next Game Studio** — Replace the current Studio tab with a new creation flow (retire legacy Studio UI when the replacement ships).
- [ ] **Safety & trust** — Deeper reporting follow-up, appeals tooling for admins, and clearer in-product safety education.
- [ ] **Mobile** — Refine touch layouts beyond mobile beta; revisit HistoriMac and other desktop-first experiences on tablets where it makes sense.
- [ ] **Games & community** — More built-in titles, smoother publish/review paths, and stronger discovery in the games catalog.
- [x] **Access & comfort** — Continue accessibility themes, localization, and calmer defaults alongside optional high-energy styles.
- [x] **Platform** — PWA install polish, status-page integration, and ongoing deploy notes in this log.
```

Adjust checkboxes when you ship 4.0.
