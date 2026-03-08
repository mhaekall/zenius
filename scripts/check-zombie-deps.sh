#!/bin/bash
# scripts/check-zombie-deps.sh
# AI Automation: Mendeteksi package yang ada di package.json tapi tidak di-import di /src

echo "🔍 Memeriksa Zombie Dependencies..."

# Ekstrak dependencies dari package.json (mengabaikan devDependencies untuk saat ini)
DEPS=$(node -e "const pkg = require('./package.json'); console.log(Object.keys(pkg.dependencies || {}).join('\n'));")

ZOMBIES=0
for DEP in $DEPS; do
  # Pengecualian untuk framework base atau package yang digunakan secara implisit
  if [[ "$DEP" == "react" || "$DEP" == "react-dom" || "$DEP" == "vite" ]]; then
    continue
  fi
  
  # Cek apakah package di-import di dalam folder src/
  if ! grep -rnqE "from ['\"]${DEP}['\"]|require\(['\"]${DEP}['\"]\)" src/ 2>/dev/null; then
    echo "🚨 Zombie terdeteksi: $DEP (Tercatat di package.json, tapi tidak dipakai di src/)"
    ZOMBIES=$((ZOMBIES+1))
  fi
done

if [ "$ZOMBIES" -gt 0 ]; then
  echo "❌ Ditemukan $ZOMBIES zombie dependencies! Tolong hapus menggunakan pnpm remove <package>."
  exit 1
else
  echo "✅ Semua dependencies di package.json aktif digunakan!"
  exit 0
fi
