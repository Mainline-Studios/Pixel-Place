#!/usr/bin/env bash
# Install and configure Nginx + Tor for the Pixel Place hidden service.
# Uses Tor standard random generation (not a vanity address).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ONION_WWW="${ROOT}/onion/www"
NGINX_CONF="${ROOT}/onion/nginx/pixel-place-onion.conf"
TOR_SNIPPET="${ROOT}/onion/tor/hidden-service.torrc"
HS_DIR="/var/lib/tor/pixelplace"
HOSTNAME_OUT="${ROOT}/onion/HOSTNAME"

if [[ "${EUID}" -ne 0 ]]; then
  exec sudo -E bash "$0" "$@"
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y nginx tor

install -d -m 0755 /var/www/pixelplace-onion
cp -a "${ONION_WWW}/." /var/www/pixelplace-onion/
chown -R www-data:www-data /var/www/pixelplace-onion

install -m 0644 "${NGINX_CONF}" /etc/nginx/sites-available/pixel-place-onion
ln -sfn /etc/nginx/sites-available/pixel-place-onion /etc/nginx/sites-enabled/pixel-place-onion
rm -f /etc/nginx/sites-enabled/default

if ! grep -q 'HiddenServiceDir /var/lib/tor/pixelplace/' /etc/tor/torrc; then
  printf '\n' >> /etc/tor/torrc
  cat "${TOR_SNIPPET}" >> /etc/tor/torrc
fi

install -d -m 0700 -o debian-tor -g debian-tor "${HS_DIR}"

nginx -t
if command -v systemctl >/dev/null 2>&1 && systemctl is-system-running >/dev/null 2>&1; then
  systemctl enable nginx tor
  systemctl restart nginx
  systemctl restart tor
else
  nginx -s reload 2>/dev/null || nginx
  if ! pgrep -x tor >/dev/null 2>&1; then
    install -d -m 0755 -o debian-tor -g debian-tor /var/log/tor /run/tor
    su -s /bin/sh debian-tor -c 'tor --RunAsDaemon 1 -f /etc/tor/torrc'
  else
    pkill -HUP tor || true
  fi
fi

echo "Waiting for Tor to write ${HS_DIR}/hostname ..."
for _ in $(seq 1 60); do
  if [[ -s "${HS_DIR}/hostname" ]]; then
    break
  fi
  sleep 1
done

if [[ ! -s "${HS_DIR}/hostname" ]]; then
  echo "Tor did not create ${HS_DIR}/hostname. Check /var/log/tor or journalctl -u tor." >&2
  exit 1
fi

install -m 0644 "${HS_DIR}/hostname" "${HOSTNAME_OUT}"
echo
echo "Onion address (v3, standard random generation):"
cat "${HS_DIR}/hostname"
echo
echo "Origin is Nginx on 127.0.0.1:8080. Open the hostname in Tor Browser."
echo "Private keys stay in ${HS_DIR} and are not copied into git."
