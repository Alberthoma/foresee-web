@echo off
echo === Subir proyecto a GitHub (modo seguro) ===

REM Pedir token de acceso
set /p TOKEN=Introduce tu GitHub Token (se ocultará en GitHub pero no aquí): 

REM Configura Git si no está configurado
git config --global user.name "Alberthoma"
git config --global user.email "you@example.com"

REM Inicializa el repositorio si aún no existe
git init

REM Eliminar cualquier remote anterior
git remote remove origin 2>nul

REM Agregar nuevo remote seguro con token embebido
git remote add origin https://%TOKEN%@github.com/Alberthoma/calculadora-finanzas.git

REM Agregar archivos y subir
git add .
git commit -m "Subida segura sin token expuesto"
git branch -M main
git push -u origin main

echo === Subida completada ===
pause
