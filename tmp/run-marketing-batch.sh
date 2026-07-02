#!/bin/zsh
set -u

CORE="https://www.core.ceskypartner.cz"
BLOG="https://www.cv-editor.com"
SIZE=30

email="seo-batch-$(date +%Y%m%d%H%M%S)@example.com"
password="TmpPass$(date +%s)A1!"

echo "Registering temp user: $email"
register_json="$(curl -sS --retry 3 --retry-delay 1 --connect-timeout 20 --max-time 120 \
  -X POST "$CORE/api/auth/register" \
  -H "Content-Type: application/json" \
  --data "$(jq -nc --arg email "$email" --arg password "$password" --arg firstName "SEO" --arg lastName "Batch" '{email:$email,password:$password,firstName:$firstName,lastName:$lastName}')" )"

token="$(printf '%s' "$register_json" | jq -r '.accessToken // empty')"
if [[ -z "$token" ]]; then
  echo "FATAL: Nepodarilo se ziskat accessToken"
  echo "$register_json" | head -c 400
  echo
  exit 1
fi

batch_json="$(curl -sS --retry 3 --retry-delay 1 --connect-timeout 20 --max-time 120 \
  -H "Authorization: Bearer $token" \
  "$CORE/api/marketing/articles/next-batch?size=$SIZE")"

count="$(printf '%s' "$batch_json" | jq -r '.data|length // 0')"
if [[ "$count" == "0" ]]; then
  echo "HOTOVO — všechny články jsou přepsány."
  exit 0
fi

echo "Fetched next batch: $count articles"

results_file="$(mktemp)"
printf '| Slug | Status | Blog post ID |\n|---|---|---|\n' > "$results_file"

slugs=("${(@f)$(printf '%s' "$batch_json" | jq -r '.data[].slug')}")

for slug in "${slugs[@]}"; do
  [[ -z "$slug" ]] && continue

  source_url="$(printf '%s' "$batch_json" | jq -r --arg slug "$slug" '.data[] | select(.slug==$slug) | .sourceUrl // ""' | head -n 1)"
  fallback_excerpt="$(printf '%s' "$batch_json" | jq -r --arg slug "$slug" '.data[] | select(.slug==$slug) | .excerpt // ""' | head -n 1)"
  fallback_title="$(printf '%s' "$batch_json" | jq -r --arg slug "$slug" '.data[] | select(.slug==$slug) | .title // ""' | head -n 1)"

  rewrite_json="$(curl -sS --retry 2 --retry-delay 1 --connect-timeout 20 --max-time 600 \
    -X POST \
    -H "Authorization: Bearer $token" \
    "$CORE/api/marketing/rewrite-one?slug=$(python3 - <<PY
import urllib.parse
print(urllib.parse.quote("""$slug"""))
PY
)")"

  rewritten_body="$(printf '%s' "$rewrite_json" | jq -r '.rewrittenBody // empty')"
  if [[ -z "$rewritten_body" ]]; then
    status="ERROR: rewrite-one nevratil rewrittenBody"
    printf '| %s | %s | - |\n' "$slug" "$status" >> "$results_file"
    echo "[ERROR] $slug: $status"
    continue
  fi

  save_resp="$(curl -sS --retry 2 --retry-delay 1 --connect-timeout 20 --max-time 120 \
    -X POST \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    --data "$(jq -nc --arg rewrittenBody "$rewritten_body" '{rewrittenBody:$rewrittenBody}')" \
    "$CORE/api/marketing/save-rewrite?slug=$(python3 - <<PY
import urllib.parse
print(urllib.parse.quote("""$slug"""))
PY
)")"
  if ! printf '%s' "$save_resp" | jq -e '.slug? or .title?' >/dev/null 2>&1; then
    status="ERROR: save-rewrite failed"
    printf '| %s | %s | - |\n' "$slug" "$status" >> "$results_file"
    echo "[ERROR] $slug: $status"
    continue
  fi

  title="$(printf '%s' "$rewritten_body" | jq -r '.title // empty')"
  meta_title="$(printf '%s' "$rewritten_body" | jq -r '.metaTitle // ""')"
  meta_description="$(printf '%s' "$rewritten_body" | jq -r '.metaDescription // ""')"
  focus_keyword="$(printf '%s' "$rewritten_body" | jq -r '.focusKeyword // ""')"
  excerpt="$(printf '%s' "$rewritten_body" | jq -r '.excerpt // ""')"

  [[ -z "$title" ]] && title="$fallback_title"
  [[ -z "$excerpt" ]] && excerpt="$fallback_excerpt"

  blog_resp="$(curl -sS --retry 2 --retry-delay 1 --connect-timeout 20 --max-time 120 \
    -X POST \
    -H "Content-Type: application/json" \
    --data "$(jq -nc \
      --arg adminKey "cveditor_admin_2024" \
      --arg slug "$slug" \
      --arg title "$title" \
      --arg metaTitle "$meta_title" \
      --arg metaDescription "$meta_description" \
      --arg focusKeyword "$focus_keyword" \
      --arg excerpt "$excerpt" \
      --arg rewrittenBody "$rewritten_body" \
      --arg sourceUrl "$source_url" \
      --arg sourceSlug "$slug" \
      --arg lang "cs" \
      '{adminKey:$adminKey,slug:$slug,title:$title,metaTitle:$metaTitle,metaDescription:$metaDescription,focusKeyword:$focusKeyword,excerpt:$excerpt,rewrittenBody:$rewrittenBody,sourceUrl:$sourceUrl,sourceSlug:$sourceSlug,lang:$lang}')" \
    "$BLOG/api/blog/posts")"

  post_id="$(printf '%s' "$blog_resp" | jq -r '.id // empty')"
  if [[ -z "$post_id" ]]; then
    status="ERROR: blog import failed"
    printf '| %s | %s | - |\n' "$slug" "$status" >> "$results_file"
    echo "[ERROR] $slug: $status"
    continue
  fi

  mark_resp="$(curl -sS --retry 2 --retry-delay 1 --connect-timeout 20 --max-time 120 \
    -X POST \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    --data "$(jq -nc --arg postId "$post_id" '{postId:$postId}')" \
    "$CORE/api/marketing/articles/$(python3 - <<PY
import urllib.parse
print(urllib.parse.quote("""$slug"""))
PY
)/mark-imported")"

  if ! printf '%s' "$mark_resp" | jq -e '.ok == true' >/dev/null 2>&1; then
    status="ERROR: mark-imported failed"
    printf '| %s | %s | %s |\n' "$slug" "$status" "$post_id" >> "$results_file"
    echo "[ERROR] $slug: $status"
    continue
  fi

  printf '| %s | OK | %s |\n' "$slug" "$post_id" >> "$results_file"
  echo "[OK] $slug -> $post_id"
done

cat "$results_file"
processed="$(($(wc -l < "$results_file") - 2))"
echo ""
echo "Dávka hotova. Zpracováno $processed/$SIZE. Napiš 'pokračuj' pro další dávku."
