# Latest Update Logs

Version history for **Pixel Place** deploys. Newest release is listed first.

| Version | Nickname | Log |
|--------|----------|-----|
| **3.0** | Safehouse | [3.0 Safehouse LATEST](./3.0%20Safehouse%20LATEST.md) |
| 2.0 | Pyxbridge (mobile / touch) | [2.0 Pyxbridge](./2.0%20Pyxbridge.md) |
| 1.0 | Fresh Start | [1.0 Fresh Start](./1.0%20Fresh%20Start.md) |

## How to add a log on deploy

1. Remove `LATEST` from the current latest filename (e.g. `3.0 Safehouse LATEST.md` → `3.0 Safehouse.md`).
2. Update that file’s **Superseded by** line to link to the new version.
3. Add a new file: `[version] [Nickname] LATEST.md` with **Preceded by** pointing at the previous latest.
4. Update this README table (new row at the top).
5. Commit with the deploy and push to `main`.
