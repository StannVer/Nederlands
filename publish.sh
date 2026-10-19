#!/usr/bin/env bash
#
# Publish the course to Netlify (personal account).
#
#   ./publish.sh            validate, then deploy app/ to production
#
# The site lives on the PERSONAL Netlify account. This computer's Netlify CLI may be signed in to
# the work account, so the script never uses that login: it reads a personal access token from a
# file outside OneDrive and refuses to publish if the token belongs to anyone else.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_FILE="$ROOT/deploy/site.json"
TOKEN_FILE="${NL_NETLIFY_TOKEN_FILE:-/mnt/c/Users/sverschaeve/.personal/netlify-token.txt}"
EXPECTED_ACCOUNT="stanverschaeve@gmail.com"

for d in "$HOME"/.nvm/versions/node/*/bin "$HOME"/.npm-global/bin; do [ -d "$d" ] && PATH="$d:$PATH"; done
export PATH
command -v netlify >/dev/null || { echo "ERROR: netlify CLI not found (npm install -g --prefix ~/.npm-global netlify-cli)"; exit 1; }

python3 "$ROOT/tools/validate.py" || { echo "ERROR: content does not validate. Nothing was published."; exit 1; }

[ -s "$TOKEN_FILE" ] || { echo "ERROR: no personal Netlify token at $TOKEN_FILE"; exit 1; }
NETLIFY_AUTH_TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE" | sed 's/^\xef\xbb\xbf//')"
export NETLIFY_AUTH_TOKEN
ACCOUNT="$(netlify api getCurrentUser 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(String(JSON.parse(s).email||"").toLowerCase())}catch(e){}})')"
[ "$ACCOUNT" = "$EXPECTED_ACCOUNT" ] || { echo "ERROR: the token belongs to '${ACCOUNT:-nobody (invalid or expired)}', not $EXPECTED_ACCOUNT. Nothing was published."; exit 1; }
echo "Publishing as $ACCOUNT (personal Netlify account)"

if [ ! -s "$SITE_FILE" ]; then
  echo "No site yet: creating one."
  mkdir -p "$ROOT/deploy"
  netlify api createSite --data '{"body":{"name":"nederlands-'"$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' \n')"'"}}' \
    | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log(JSON.stringify({site_id:j.id,url:j.ssl_url||j.url},null,2))})' > "$SITE_FILE"
fi
SITE_ID="$(node -e 'console.log(require(process.argv[1]).site_id)' "$SITE_FILE")"

netlify deploy --prod --dir "$ROOT/app" --site "$SITE_ID" --message "$(git -C "$ROOT" log -1 --format=%s)"
echo "Live at: $(node -e 'console.log(require(process.argv[1]).url)' "$SITE_FILE")"
