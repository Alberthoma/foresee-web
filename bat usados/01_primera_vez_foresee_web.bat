@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM =================== CONFIGURACION ===================
set "REPO_URL=https://github.com/Alberthoma/foresee-web.git"
set "REPO_WEB=https://alberthoma.github.io/foresee-web/"
REM =====================================================

title Publicar (primera vez) foresee-web

echo.
echo === Verificando que Git este instalado ===
where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git no esta instalado o no esta en el PATH.
  echo Instala Git desde https://git-scm.com/download/win y vuelve a ejecutar este .bat
  pause
  exit /b 1
)

echo.
echo === Comprobando que estes en la carpeta DEL PROYECTO ===
if not exist "index.html" (
  echo [ADVERTENCIA] No se encontro index.html en esta carpeta.
  echo Asegurate de ejecutar este .bat dentro de la carpeta de tu app (donde esta index.html).
  echo Puedes continuar, pero GitHub Pages necesita un index.html en la raiz.
  choice /c SY /m "Deseas continuar de todas formas? (S/N)"
  if errorlevel 2 exit /b 1
)

echo.
echo === Inicializando repo local (si no existe) ===
if not exist ".git" (
  git init
)

echo.
echo === Creando .nojekyll (evita procesamiento de Jekyll) ===
if not exist ".nojekyll" (
  type nul > ".nojekyll"
)

echo.
echo === Creando .gitignore basico (si no existe) ===
if not exist ".gitignore" (
  (
    echo # Sistema
    echo Thumbs.db
    echo .DS_Store
    echo
    echo # Logs
    echo *.log
    echo
    echo # Build tools comunes
    echo node_modules/
    echo dist/
    echo build/
  ) > ".gitignore"
)

echo.
echo === Estableciendo rama principal: main ===
git branch -M main 2>nul

echo.
echo === Vinculando con GitHub (origin) ===
git remote remove origin 2>nul
git remote add origin "%REPO_URL%"

echo.
echo === Preparando primer commit ===
git add -A

REM Hacemos commit; si ya hubiera commits previos, esto no falla
git commit -m "Publicacion inicial del sitio" 2>nul

echo.
echo === Subiendo a GitHub ===
git push -u origin main
if errorlevel 1 (
  echo.
  echo --- El push fallo. Intentando hacer pull --rebase (por si el repo remoto tiene README u otros archivos) ---
  git pull --rebase origin main
  if errorlevel 1 (
    echo [ERROR] No se pudo hacer pull --rebase. Revisa conflictos en los archivos.
    echo Abre PowerShell aqui y ejecuta:
    echo    git status
    echo Resuelve conflictos, luego:
    echo    git add -A
    echo    git rebase --continue  ^(si aplica^)
    echo    git push
    pause
    exit /b 1
  )
  echo Reintentando push...
  git push -u origin main
  if errorlevel 1 (
    echo [ERROR] El push volvio a fallar.
    echo Posibles causas: credenciales incorrectas o permisos insuficientes.
    echo Si Git te pide usuario/contrase^na:
    echo   - Usuario:  Alberthoma
    echo   - Contrase^na: tu PAT (Personal Access Token) de GitHub con permisos de repo.
    pause
    exit /b 1
  )
)

echo.
echo === Listo. Paso siguiente: activar GitHub Pages ===
echo 1) Abre la configuracion de Pages del repo:
echo    https://github.com/Alberthoma/foresee-web/settings/pages
echo 2) En "Build and deployment > Source" elige "Deploy from a branch".
echo 3) En Branch selecciona: main   y en Folder: /(root).  Guarda.
echo 4) Tu sitio quedara disponible en: %REPO_WEB%
echo.
pause
