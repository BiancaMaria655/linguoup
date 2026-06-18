#!/usr/bin/env bash
# =============================================================================
# install_skills.sh — Autonomous Agent Skills Installer
# Installs all skills into .agents/skills/ using git sparse-checkout
# =============================================================================
set -euo pipefail

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="${WORKSPACE_ROOT}/.agents/skills"
TMPDIR_BASE="${WORKSPACE_ROOT}/.agents/.tmp_install"

# Colors for logging
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# Clean up on exit
cleanup() { rm -rf "${TMPDIR_BASE}" 2>/dev/null || true; }
trap cleanup EXIT

mkdir -p "${SKILLS_DIR}" "${TMPDIR_BASE}"

# =============================================================================
# install_skill_sparse <repo_url> <sparse_path> <skill_name>
#   repo_url    = e.g. https://github.com/owner/repo
#   sparse_path = path inside repo (e.g. skills/frontend-design), or "" for root
#   skill_name  = target directory name under .agents/skills/
# =============================================================================
install_skill_sparse() {
  local repo_url="$1"
  local sparse_path="$2"
  local skill_name="$3"

  local target_dir="${SKILLS_DIR}/${skill_name}"
  local tmp_repo="${TMPDIR_BASE}/${skill_name}"

  log_info "Installing: ${skill_name} from ${repo_url}/${sparse_path}"

  # Clean stale attempt
  rm -rf "${tmp_repo}"
  mkdir -p "${tmp_repo}"

  # Sparse clone — no-checkout, depth 1 for speed
  if ! git clone \
    --quiet \
    --depth 1 \
    --no-checkout \
    --filter=blob:none \
    "${repo_url}.git" \
    "${tmp_repo}" 2>/dev/null; then
    log_warn "Clone failed for ${skill_name} — skipping"
    return 0
  fi

  cd "${tmp_repo}"
  git sparse-checkout init --cone --quiet 2>/dev/null || git sparse-checkout init --quiet 2>/dev/null || true

  if [[ -n "${sparse_path}" ]]; then
    git sparse-checkout set --quiet "${sparse_path}" 2>/dev/null || true
  fi

  git checkout --quiet 2>/dev/null || true

  # Determine source directory
  local src_dir="${tmp_repo}"
  if [[ -n "${sparse_path}" ]]; then
    src_dir="${tmp_repo}/${sparse_path}"
  fi

  if [[ ! -d "${src_dir}" ]]; then
    log_warn "Source path '${sparse_path}' not found in ${repo_url} — skipping"
    cd "${WORKSPACE_ROOT}"
    return 0
  fi

  # Install: remove previous version and copy fresh
  rm -rf "${target_dir}"
  cp -r "${src_dir}" "${target_dir}"

  # Verify SKILL.md exists (warn if missing, don't fail)
  if [[ -f "${target_dir}/SKILL.md" ]]; then
    log_ok "Installed: ${skill_name} ✓ (SKILL.md found)"
  else
    log_warn "Installed: ${skill_name} ✓ (SKILL.md NOT found — check repo)"
  fi

  cd "${WORKSPACE_ROOT}"
  return 0
}

# =============================================================================
# SKILL MANIFEST
# Format: install_skill_sparse <repo> <inner_path> <skill_name>
# =============================================================================

log_info "Starting autonomous skill installation into ${SKILLS_DIR}"
echo "================================================================"

# ── Google Stitch ────────────────────────────────────────────────────────────
install_skill_sparse \
  "https://github.com/google-labs-code/stitch-skills" \
  "" \
  "stitch-skills"

# ── Antigravity Community Skills ─────────────────────────────────────────────
install_skill_sparse \
  "https://github.com/sickn33/antigravity-awesome-skills" \
  "skills/frontend-design" \
  "frontend-design"

install_skill_sparse \
  "https://github.com/sickn33/antigravity-awesome-skills" \
  "skills/backend-architect" \
  "backend-architect"

install_skill_sparse \
  "https://github.com/sickn33/antigravity-awesome-skills" \
  "skills/nestjs-expert" \
  "nestjs-expert"

install_skill_sparse \
  "https://github.com/sickn33/antigravity-awesome-skills" \
  "skills/docker-expert" \
  "docker-expert"

install_skill_sparse \
  "https://github.com/sickn33/antigravity-awesome-skills" \
  "skills/github-actions-templates" \
  "github-actions-templates"

# ── Terraform ────────────────────────────────────────────────────────────────
install_skill_sparse \
  "https://github.com/hashicorp/agent-skills" \
  "terraform/code-generation/skills/terraform-style-guide" \
  "terraform-style-guide"

# ── Vercel / next-skills ──────────────────────────────────────────────────────
install_skill_sparse \
  "https://github.com/vercel-labs/next-skills" \
  "skills/next-best-practices" \
  "next-best-practices"

install_skill_sparse \
  "https://github.com/vercel-labs/next-skills" \
  "skills/next-cache-components" \
  "next-cache-components"

# ── Vercel / agent-skills ─────────────────────────────────────────────────────
install_skill_sparse \
  "https://github.com/vercel-labs/agent-skills" \
  "skills/deploy-to-vercel" \
  "deploy-to-vercel"

install_skill_sparse \
  "https://github.com/vercel-labs/agent-skills" \
  "skills/react-best-practices" \
  "react-best-practices"

install_skill_sparse \
  "https://github.com/vercel-labs/agent-skills" \
  "skills/web-design-guidelines" \
  "web-design-guidelines"

install_skill_sparse \
  "https://github.com/vercel-labs/agent-skills" \
  "skills/composition-patterns" \
  "composition-patterns"

# ── Prisma ────────────────────────────────────────────────────────────────────
install_skill_sparse \
  "https://github.com/prisma/skills" \
  "prisma-database-setup" \
  "prisma-database-setup"

# ── Supabase ──────────────────────────────────────────────────────────────────
install_skill_sparse \
  "https://github.com/supabase/agent-skills" \
  "" \
  "supabase"

# ── Clerk ─────────────────────────────────────────────────────────────────────
install_skill_sparse \
  "https://github.com/clerk/skills" \
  "skills/core/clerk-setup" \
  "clerk-setup"

install_skill_sparse \
  "https://github.com/clerk/skills" \
  "skills/core/clerk" \
  "clerk"

# =============================================================================
# CLEANUP — Remove legacy agent directories
# =============================================================================
echo ""
echo "================================================================"
log_info "Cleaning up legacy agent directories..."

LEGACY_DIRS=(".agent" ".cursor" ".opencode")
for legacy in "${LEGACY_DIRS[@]}"; do
  legacy_path="${WORKSPACE_ROOT}/${legacy}"
  if [[ -d "${legacy_path}" ]]; then
    rm -rf "${legacy_path}"
    log_ok "Removed legacy directory: ${legacy}"
  else
    log_info "Not found (clean): ${legacy}"
  fi
done

# =============================================================================
# REPORT
# =============================================================================
echo ""
echo "================================================================"
log_info "Installation complete. Installed skills:"
if [[ -d "${SKILLS_DIR}" ]]; then
  for skill_dir in "${SKILLS_DIR}"/*/; do
    skill_name=$(basename "${skill_dir}")
    if [[ -f "${skill_dir}/SKILL.md" ]]; then
      echo -e "  ${GREEN}✓${NC} ${skill_name}"
    else
      echo -e "  ${YELLOW}⚠${NC} ${skill_name} (no SKILL.md)"
    fi
  done
else
  log_error "Skills directory not found!"
  exit 1
fi

echo ""
log_ok "Done. Active agent config: .agents/  |  Skills: .agents/skills/"
echo "================================================================"
