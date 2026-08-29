#!/usr/bin/env bash
# Granada installer — Claude Code-style curl | bash.
# Puts `granada` in ~/.local/bin from a GitHub Release tarball (no git clone).
# Requires Node.js 22.12+ (Granada is a Node CLI, not a native binary).
#
#   curl -fsSL https://raw.githubusercontent.com/daskinnyman/granada-release/main/install.sh | bash
set -euo pipefail

REPO="${GRANADA_REPO:-daskinnyman/granada-release}"
VERSION="${GRANADA_VERSION:-latest}"
PREFIX="${GRANADA_PREFIX:-${HOME}/.local}"
MIN_NODE_MAJOR=22
MIN_NODE_MINOR=12

log() {
  printf 'granada-install: %s\n' "$*" >&2
}

die() {
  printf 'granada-install: %s\n' "$*" >&2
  exit 1
}

if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
  die "refusing to run as root (do not use sudo)"
fi

command -v node >/dev/null 2>&1 || die "Node.js ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}+ is required"
command -v npm >/dev/null 2>&1 || die "npm is required (ships with Node.js)"

node -e "const [ma, mi] = process.versions.node.split('.').map(Number);
if (ma < ${MIN_NODE_MAJOR} || (ma === ${MIN_NODE_MAJOR} && mi < ${MIN_NODE_MINOR})) {
  process.exit(1);
}" || die "Node.js ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}+ required (found $(node -p 'process.versions.node'))"

github_token() {
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    printf '%s' "${GITHUB_TOKEN}"
    return 0
  fi
  if command -v gh >/dev/null 2>&1; then
    gh auth token 2>/dev/null || true
  fi
}

download_with_gh() {
  local dest_dir="$1"
  local tag
  if [[ "${VERSION}" == "latest" ]]; then
    gh release download --repo "${REPO}" --pattern 'granada.tgz' --dir "${dest_dir}" 2>/dev/null \
      || gh release download --repo "${REPO}" --pattern 'granada-*.tgz' --dir "${dest_dir}"
  else
    tag="${VERSION#v}"
    gh release download "v${tag}" --repo "${REPO}" --pattern "granada-${tag}.tgz" --dir "${dest_dir}" \
      || gh release download "v${tag}" --repo "${REPO}" --pattern 'granada.tgz' --dir "${dest_dir}"
  fi
}

download_with_curl() {
  local dest_dir="$1"
  local api token curl_auth=() asset_meta tag asset_name dest
  command -v curl >/dev/null 2>&1 || die "curl is required to download the release"

  if [[ "${VERSION}" == "latest" ]]; then
    api="https://api.github.com/repos/${REPO}/releases/latest"
  else
    api="https://api.github.com/repos/${REPO}/releases/tags/v${VERSION#v}"
  fi

  token="$(github_token)"
  if [[ -n "${token}" ]]; then
    curl_auth=(-H "Authorization: Bearer ${token}")
  fi

  asset_meta="$(curl -fsSL "${curl_auth[@]}" -H 'Accept: application/vnd.github+json' "${api}" \
    | node --input-type=commonjs -e '
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(0, "utf8"));
const tag = String(data.tag_name ?? "");
const assets = Array.isArray(data.assets) ? data.assets : [];
const asset = assets.find((item) => item.name === "granada.tgz")
  ?? assets.find((item) => /^granada-.*\.tgz$/.test(String(item.name)));
if (!tag || !asset || !asset.name) process.exit(2);
process.stdout.write(JSON.stringify({ tag: tag, name: asset.name }));
')" || die "failed to fetch ${api}"

  tag="$(printf '%s' "${asset_meta}" | node --input-type=commonjs -e '
const fs = require("fs");
process.stdout.write(String(JSON.parse(fs.readFileSync(0, "utf8")).tag));
')"
  asset_name="$(printf '%s' "${asset_meta}" | node --input-type=commonjs -e '
const fs = require("fs");
process.stdout.write(String(JSON.parse(fs.readFileSync(0, "utf8")).name));
')"
  dest="${dest_dir}/${asset_name}"

  curl -fsSL "${curl_auth[@]}" -L \
    -o "${dest}" \
    "https://github.com/${REPO}/releases/download/${tag}/${asset_name}" \
    || die "failed to download ${asset_name} from ${REPO} ${tag}"
}

first_tarball() {
  local dir="$1"
  local match
  for match in "${dir}"/granada.tgz "${dir}"/granada-*.tgz; do
    if [[ -f "${match}" ]]; then
      printf '%s' "${match}"
      return 0
    fi
  done
  return 1
}

resolve_tarball() {
  if [[ -n "${GRANADA_TARBALL:-}" ]]; then
    printf '%s' "${GRANADA_TARBALL}"
    return 0
  fi

  local tmp found
  tmp="$(mktemp -d)"
  WORK_DIR="${tmp}"

  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    download_with_gh "${tmp}"
  else
    download_with_curl "${tmp}"
  fi

  found="$(first_tarball "${tmp}")" || die "download produced no granada*.tgz — publish a GitHub Release first"
  printf '%s' "${found}"
}

WORK_DIR=""
cleanup() {
  if [[ -n "${WORK_DIR}" && -d "${WORK_DIR}" ]]; then
    rm -rf "${WORK_DIR}"
  fi
}
trap cleanup EXIT

tarball="$(resolve_tarball)"
[[ -f "${tarball}" ]] || die "tarball not found: ${tarball}"

install_cmd=(npm install -g --omit=dev --ignore-scripts --prefix "${PREFIX}" "${tarball}")

if [[ "${GRANADA_DRY_RUN:-}" == "1" ]]; then
  printf '%s\n' "${install_cmd[*]}"
  exit 0
fi

log "installing into ${PREFIX}"
mkdir -p "${PREFIX}/bin"
"${install_cmd[@]}"

bin_path="${PREFIX}/bin/granada"
[[ -x "${bin_path}" ]] || die "install finished but ${bin_path} is missing"

case ":${PATH}:" in
  *":${PREFIX}/bin:"*) ;;
  *)
    log "add ${PREFIX}/bin to PATH (Claude Code uses the same directory):"
    log "  echo 'export PATH=\"${PREFIX}/bin:\$PATH\"' >> ~/.zshrc && source ~/.zshrc"
    ;;
esac

log "installed ${bin_path}"
log "try: granada"
log "or:  granada init --repo ."
