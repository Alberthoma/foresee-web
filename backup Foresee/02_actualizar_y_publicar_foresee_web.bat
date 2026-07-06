@echo off
setlocal EnableExtensions EnableDelayedExpansion

title Actualizar y publicar foresee-web

REM Mensaje de commit por parametro (opcional)
set "COMMIT_MSG=%~1"
if "%COMMIT_MSG%"=="" set "COMMIT_MSG=Actualizacion del sitio"

echo.
echo === Verificando Git ===
where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git no esta instalado o no esta en el PATH.
  echo Instala Git desde https://git-scm.com/download/win
  pause
  exit /b 1
)

echo.
echo === Comprobando repo ===
if not exist ".git" (
  echo [ERROR] Esta carpeta no parece ser un repositorio Git.
  echo Asegurate de ejecutar este .bat dentro de la carpeta del proyecto ya inicializada.
  pause
  exit /b 1
)

echo.
echo === Tomando ultimos cambios del remoto (por si editaste en GitHub) ===
git pull --rebase origin main

echo.
echo === Preparando cambios ===
git add -A

echo.
echo === Haciendo commit: %COMMIT_MSG% ===
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
  echo (No habia cambios que commitear o ocurrio un error leve)
)

echo.
echo === Subiendo a GitHub ===
git push
if errorlevel 1 (
  echo [ERROR] No se pudo hacer push. Verifica credenciales o conflictos.
  pause
  exit /b 1
)

echo.
echo === Publicado! En pocos segundos se vera en GitHub Pages ===
echo URL: https://alberthoma.github.io/foresee-web/
echo (Si no ves cambios, espera unos segundos y recarga con Ctrl+F5)
echo.
pause
