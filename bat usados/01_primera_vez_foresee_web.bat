@echo off
setlocal EnableExtensions

REM ============== CONFIG ==============
set "REPO_URL=https://github.com/Alberthoma/foresee-web.git"
set "REPO_WEB=https://alberthoma.github.io/foresee-web/"
REM ====================================

title Publicar (primera vez) foresee-web - FIX

echo.
echo === Verificando que Git este instalado ===
where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: Git no esta instalado o no esta en el PATH.
  echo Descarga Git desde https://git-scm.com/download/win e instalalo.
  pause
  exit /b 1
)

echo.
echo === Comprobando que ejecutes este archivo dentro de la carpeta del proyecto ===
if not exist "index.html" (
  echo ADVERTENCIA: No se encontro un archivo llamado index.html en esta carpeta.
  echo Debes ejecutar este archivo dentro de la carpeta de tu app donde esta index.html
  echo GitHub Pages necesita un index.html en la raiz.
  set /p ANS=Continuar de todas formas? Escribe S para SI. Cualquier otra tecla cancela: 
  if /I not "%ANS%"=="S" exit /b 1
)

echo.
echo === Inicializando repositorio local si no existe ===
if not exist ".git" (
  git init
)

echo.
echo === Creando archivo .nojekyll si no existe ===
if not exist ".nojekyll" (
  type nul > ".nojekyll"
)

echo.
echo === Creando .gitignore basico si no existe ===
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
echo === Estableciendo rama principal main ===
git branch -M main 2>nul

echo.
echo === Vinculando repositorio remoto origin ===
git remote remove origin 2>nul
git remote add origin "%REPO_URL%"

echo.
echo === Preparando primer commit ===
git add -A
git commit -m "Publicacion inicial del sitio" 2>nul

echo.
echo === Subiendo a GitHub ===
git push -u origin main
if errorlevel 1 (
  echo.
  echo El primer push no se pudo completar. Intentando actualizar desde el remoto con pull --rebase
  git pull --rebase origin main
  if errorlevel 1 (
    echo ERROR: No fue posible hacer pull --rebase. Revisa conflictos con "git status".
    echo Luego de resolverlos ejecuta: git add -A, y despues git rebase --continue si aplica, y git push
    pause
    exit /b 1
  )
  echo Reintentando push...
  git push -u origin main
  if errorlevel 1 (
    echo ERROR: El push volvio a fallar.
    echo Usuario:  Alberthoma
    echo Contrasena: tu token personal de GitHub (PAT) con permiso de repo o Contents: Read and Write
    pause
    exit /b 1
  )
)

echo.
echo === Listo. Activa GitHub Pages en el repositorio ===
echo Abre la configuracion de Pages del repositorio y selecciona:
echo   - Build and deployment: Deploy from a branch
echo   - Branch: main
echo   - Folder: / (root)
echo Tu sitio: %REPO_WEB%
echo.
pause
