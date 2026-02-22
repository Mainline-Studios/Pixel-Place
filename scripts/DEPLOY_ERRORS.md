# "Error deploying functions" – what to do

## "An operation on function api ... is already in progress"

**Cause:** A previous deploy or update is still running on Google’s side. New deploys are rejected until it finishes.

**Fix:**

1. **Wait 2–5 minutes**, then run again:
   ```bash
   firebase deploy --only functions
   ```

2. **Or use the retry script** (tries up to 3 times with 90s wait):
   ```bash
   chmod +x scripts/deploy-functions.sh
   ./scripts/deploy-functions.sh
   ```

3. **Check in Google Cloud Console** that no deploy is stuck:  
   https://console.cloud.google.com/functions/list?project=pixel-place-823b1  
   If the `api` function shows "Updating" for a long time, wait for it to finish or contact Google Cloud support.

This is a Google Cloud limitation, not a bug in your code.
