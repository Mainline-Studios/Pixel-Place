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
elif ! grep -q 'HiddenServicePort 443 127.0.0.1:8443' /etc/tor/torrc; then
  sed -i '/HiddenServicePort 80 127.0.0.1:8080/a HiddenServicePort 443 127.0.0.1:8443' /etc/tor/torrc
fi

install -d -m 0700 -o debian-tor -g debian-tor "${HS_DIR}"

ensure_tls_cert() {
  local host="${1}"
  local crt="/etc/nginx/pixelplace-onion.crt"
  local key="/etc/nginx/pixelplace-onion.key"
  if [[ -f "${crt}" && -f "${key}" ]] && openssl x509 -in "${crt}" -noout -text 2>/dev/null | grep -q "${host}"; then
    return
  fi
  openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -sha256 -days 825 -nodes \
    -keyout "${key}" -out "${crt}" \
    -subj "/CN=${host}" \
    -addext "subjectAltName=DNS:${host}"
  chmod 640 "${key}" "${crt}"
  chown root:www-data "${key}"
}

ensure_tls_cert "pixelplace.onion"
nginx -t

# Debian's packaged defaults set DataDirectory /var/lib/tor, User debian-tor,
# and SocksPort 9050. Starting with only `-f /etc/tor/torrc` (no defaults)
# puts the daemon in ~/.tor, circuits never bootstrap, and every .onion times out.
install -d -m 0755 -o debian-tor -g debian-tor /var/log/tor /run/tor
touch /var/log/tor/notices.log
chown debian-tor:debian-tor /var/log/tor/notices.log
chmod 640 /var/log/tor/notices.log

start_tor() {
  if command -v systemctl >/dev/null 2>&1 && systemctl is-system-running >/dev/null 2>&1; then
    systemctl enable nginx tor
    systemctl restart nginx
    systemctl restart tor
    return
  fi
  nginx -s reload 2>/dev/null || nginx
  local defaults="/usr/share/tor/tor-service-defaults-torrc"
  if pgrep -x tor >/dev/null 2>&1; then
    pkill -HUP tor || true
  elif [[ -f "${defaults}" ]]; then
    tor --defaults-torrc "${defaults}" -f /etc/tor/torrc
  else
    su -s /bin/sh debian-tor -c 'tor --RunAsDaemon 1 -f /etc/tor/torrc'
  fi
}
start_tor

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
ONION_HOST="$(tr -d '[:space:]' < "${HS_DIR}/hostname")"
ensure_tls_cert "${ONION_HOST}"
nginx -t
if command -v systemctl >/dev/null 2>&1 && systemctl is-system-running >/dev/null 2>&1; then
  systemctl reload nginx
else
  nginx -s reload
fi
echo
echo "Onion address (v3, standard random generation):"
echo "${ONION_HOST}"
echo
echo "Tor Browser HTTPS-Only Mode needs TLS. Open:"
echo "  https://${ONION_HOST}/"
echo "Accept the self-signed warning once (no public CA issues .onion certs here)."
echo "Private keys stay in ${HS_DIR} and are not copied into git."
