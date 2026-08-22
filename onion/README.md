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
```

## Quick start

On Debian/Ubuntu:

```bash
chmod +x onion/setup.sh
./onion/setup.sh
```

The script installs packages, installs the Nginx site, appends the Tor snippet, starts both services, and copies the generated address to `onion/HOSTNAME`.

Open that hostname in [Tor Browser](https://www.torproject.org/download/) as **`http://`**, not `https://`. It will not resolve on the ordinary DNS internet.

## Tor Browser “connection has timed out”

That page means Tor Browser never reached the hidden service. Typical causes:

1. **HTTPS instead of HTTP.** This origin is HTTP on port 80. Tor already encrypts the circuit. In Tor Browser, turn off HTTPS-Only Mode for this site (or for onions) and load:

   `http://2nnrmifdnwtijyd7pr26c6kuuqzlon25tt2dimxv2h6hnrmbkdniwbid.onion/`

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
sudo nginx -t && sudo systemctl reload nginx
sudo tee -a /etc/tor/torrc < onion/tor/hidden-service.torrc
sudo systemctl restart tor
# Without systemd: sudo tor --defaults-torrc /usr/share/tor/tor-service-defaults-torrc -f /etc/tor/torrc
sudo cat /var/lib/tor/pixelplace/hostname
```
