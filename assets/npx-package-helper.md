# Update Workflow

1. **Make your changes locally**
   - Edit your code, update your `card.js`, or adjust `package.json` as needed.
   - Test thoroughly with `npm link` or `npx ./` to confirm everything works.

2. **Bump the version**
   npm requires a new version number for each publish. You can do this with:
   ```bash
   npm version patch   # for small fixes (1.0.0 → 1.0.1)
   npm version minor   # for new features (1.0.0 → 1.1.0)
   npm version major   # for breaking changes (1.0.0 → 2.0.0)
   ```
   This updates `package.json`, creates a Git commit, and tags the version.

3. **Publish the new version**
   Once the version is bumped:
   ```bash
   npm publish
   ```
   This uploads the new package to the npm registry.

4. **Verify**
   - Run:
     ```bash
     npm info duc-mt
     ```
     to confirm the new version is live.
   - Test with:
     ```bash
     npx duc-mt
     ```
     to see the updated CLI card.

---

# Best Practices
- **Always test locally** before publishing (`npm link` is your friend).
- **Write a README.md** so users know what changed.
- **Use semantic versioning** (patch/minor/major) so users understand the impact.
- If you're using GitHub, push your commits and tags so your repo matches npm.

---

So in short: **edit → test → bump version → publish → verify**.
