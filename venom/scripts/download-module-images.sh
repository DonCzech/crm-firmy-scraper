#!/bin/bash
# Download Unsplash photos for module icons (free for commercial use under Unsplash License).
set -u
DEST=public/modules
mkdir -p "$DEST"

declare -a items=(
  "clanky-blog|1455390582262-044cdead277a"
  "seo-viditelnost|1460925895917-afdab827c52f"
  "eshop-katalog|1556742044-3c52d6e88c62"
  "rezervace-online|1611224885990-ab7363d7f0d2"
  "formulare-leady|1517842645767-c639042777db"
  "media-knihovna|1502920917128-1aa500764cbd"
  "rychlost-vykon|1530695641065-1c5c89bb9d83"
  "predplatne-kurzy|1522202176988-66273c2fd55f"
  "domena-hosting|1558494949-ef010cbdcc31"
  "analytika-konverze|1551288049-bebda4e38f71"
  "zabezpeceni-gdpr|1563013544-824ae1b704d3"
  "integrace-zapier|1551434678-e076c223a692"
  "live-editor|1517694712202-14dd9538aa97"
  "historie-verze|1532153975070-2e9ab71f1b14"
  "tym-role|1522071820081-009f0129c71c"
  "newsletter-mailing|1521587760476-6c12a4b040da"
  "popup-bannery|1611224923853-80b023f02d71"
  "vicejazycne-weby|1451187580459-43490279c0fa"
  "platby-fakturace|1556740738-b6a63e27c4df"
  "galerie-foto|1495121605193-b116b5b9c5fe"
  "video-streaming|1574267432553-4b4628081c31"
  "mapy-lokace|1524661135-423995f22d0b"
  "recenze-rating|1542223189-67a03fa0f0bd"
  "ai-asistent|1485827404703-89b55fcc595e"
  "accessibility-wcag|1559757148-5c350d0d3c56"
  "kontaktni-formular|1573497019418-b400bb3ab074"
  "ssl-zabezpeceni|1614064641938-3bbee52942c7"
  "backup-obnova|1544197150-b99a580bb7a8"
  "cookie-banner|1558961363-fa8fdf82db35"
  "embed-kody|1542831371-29b0f74f9713"
  "dashboard-statistiky|1543286386-2e659306cd6c"
  "ab-testovani|1454165804606-c3d57bc86b40"
  "podpora-cesky|1552581234-26160f608093"
)

for entry in "${items[@]}"; do
  slug="${entry%%|*}"
  pid="${entry##*|}"
  out="$DEST/$slug.jpg"
  url="https://images.unsplash.com/photo-${pid}?w=1600&q=80&auto=format&fit=crop"
  if curl -fsSL "$url" -o "$out"; then
    sz=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")
    if [ "$sz" -lt 5000 ]; then
      echo "TINY  $slug ($sz bytes)"
      rm "$out"
    else
      echo "OK    $slug"
    fi
  else
    echo "FAIL  $slug ($pid)"
  fi
done
