#!/bin/bash
#
# Warm up OG image cache by requesting each app's OG image once.
# This ensures all OG images are generated and certified before
# social networks try to fetch them.
#
# Usage: ./warmup-og.sh [total_apps]
#   total_apps  Number of apps (default: 183)

CANISTER_URL="https://g37d7-6qaaa-aaaac-bceua-cai.icp0.io"
TOTAL=${1:-183}
FAILED=0
SUCCESS=0

echo "Warming up OG images for $TOTAL apps..."
echo "Canister: $CANISTER_URL"
echo ""

for i in $(seq 1 $TOTAL); do
  URL="$CANISTER_URL/app/$i/og.png"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$URL")

  if [ "$STATUS" = "200" ]; then
    echo "  [$i/$TOTAL] OK"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "  [$i/$TOTAL] FAILED (HTTP $STATUS)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "Done. $SUCCESS succeeded, $FAILED failed out of $TOTAL."
