# Pixel Place hidden service (`.onion`)

A Tor v3 onion site for Pixel Place: classified-looking **secrets of Pixel Place**, in-jokes, and a fake 67 ballot. The public internet never sees this origin: Nginx listens on loopback, and Tor publishes a randomly generated hidden-service address.

## Address generation

This uses **standard random generation**, not a vanity address.

1. Install Nginx and Tor.
2. Set `HiddenServiceDir` and `HiddenServicePort` in `torrc`.
3. Start Tor. On first launch it creates an ed25519 key pair under `HiddenServiceDir` and writes `hostname`.
4. That file is the unique `.onion` address (56 characters for v3; legacy v2 was 16).

The snippet is in [`tor/hidden-service.torrc`](tor/hidden-service.torrc):

```
HiddenServiceDir /var/lib/tor/pixelplace/
HiddenServiceVersion 3
HiddenServicePort 80 127.0.0.1:8080
HiddenServicePort 443 127.0.0.1:8443
```

## Quick start

On Debian/Ubuntu:

```bash
chmod +x onion/setup.sh
./onion/setup.sh
```

The script installs packages, installs the Nginx site, appends the Tor snippet, starts both services, and copies the generated address to `onion/HOSTNAME`.

Open that hostname in [Tor Browser](https://www.torproject.org/download/). Prefer **`https://`**. Tor Browser’s HTTPS-Only Mode upgrades onions to HTTPS; a HTTP-only origin times out instead of loading.

```
https://2nnrmifdnwtijyd7pr26c6kuuqzlon25tt2dimxv2h6hnrmbkdniwbid.onion/
```

The TLS cert is self-signed (public CAs do not issue this `.onion`). Click **Advanced → Accept the Risk and Continue** once. Then **New Identity** if a previous timeout is cached.

## Tor Browser “connection has timed out”

That page means Tor Browser never reached the hidden service. Typical causes:

1. **HTTPS-Only Mode hitting a HTTP-only onion.** This origin now serves TLS on hidden-service port 443. If you still time out, New Identity, then open the `https://` URL and accept the self-signed warning.

2. **Tor is not bootstrapped.** If the daemon was started with `tor -f /etc/tor/torrc` and without Debian’s defaults file, it uses the wrong data directory, circuits never come up, and every `.onion` (including DuckDuckGo) times out. Restart with:

   ```bash
   sudo install -d -m 0755 -o debian-tor -g debian-tor /run/tor /var/log/tor
   sudo tor --defaults-torrc /usr/share/tor/tor-service-defaults-torrc -f /etc/tor/torrc
   ```

   Wait until `curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org/api/ip` returns `"IsTor":true`, then retry the hostname. First descriptor publish can take a minute after bootstrap.

3. **The host process is gone.** A hidden service on a cloud agent VM disappears when that VM stops. Nginx on `127.0.0.1:8080` can still be up while Tor is dead; only Tor publishes the `.onion`.

## Layout

| Path | Role |
|------|------|
| `www/` | Static site served as the onion origin |
| `www/vault-files.js` | 260 cabinet files (130 sealed) |
| `MASTER_LIST.md` | Operator cheat sheet: every file and unlock command |
| `scripts/generate-vault-files.mjs` | Regenerates vault-files.js + MASTER_LIST.md |
| `nginx/pixel-place-onion.conf` | Loopback-only Nginx vhost (`127.0.0.1:8080`) |
| `tor/hidden-service.torrc` | Hidden service lines for `/etc/tor/torrc` |
| `HOSTNAME` | Public v3 address after first successful Tor start |
| `/var/lib/tor/pixelplace/` | Live keys (created by Tor; **never commit**) |

## Keys

`hs_ed25519_secret_key` in `HiddenServiceDir` **is** the domain. Losing it loses the address; publishing it lets anyone impersonate the service. Keep that directory `0700` and owned by `debian-tor`. Back it up offline if you need a stable hostname across machines. Do not put private keys in git.

## Manual install

```bash
sudo apt-get update
sudo apt-get install -y nginx tor
sudo mkdir -p /var/www/pixelplace-onion
sudo cp -a onion/www/. /var/www/pixelplace-onion/
sudo cp onion/nginx/pixel-place-onion.conf /etc/nginx/sites-available/pixel-place-onion
sudo ln -sfn /etc/nginx/sites-available/pixel-place-onion /etc/nginx/sites-enabled/pixel-place-onion
sudo rm -f /etc/nginx/sites-enabled/default
ONION="$(tr -d '[:space:]' < /var/lib/tor/pixelplace/hostname 2>/dev/null || echo pixelplace.onion)"
sudo openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -sha256 -days 825 -nodes \
  -keyout /etc/nginx/pixelplace-onion.key -out /etc/nginx/pixelplace-onion.crt \
  -subj "/CN=${ONION}" -addext "subjectAltName=DNS:${ONION}"
sudo nginx -t && sudo systemctl reload nginx
sudo tee -a /etc/tor/torrc < onion/tor/hidden-service.torrc
sudo systemctl restart tor
# Without systemd: sudo tor --defaults-torrc /usr/share/tor/tor-service-defaults-torrc -f /etc/tor/torrc
sudo cat /var/lib/tor/pixelplace/hostname
```
