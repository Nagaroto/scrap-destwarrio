@echo off
title Instalador Automatico
color 0A

echo Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo Python nao encontrado!
    echo Abrindo Microsoft Store...
    start "" "ms-windows-store://pdp/?productid=9PJPW5LDXLZ5"
    echo Instale o Python e rode novamente.
    pause
    exit
)

echo Criando ambiente virtual...
if not exist .venv (
    python -m venv .venv
)

call .venv\Scripts\activate

echo Atualizando pip...
python -m pip install --upgrade pip

echo Instalando dependencias...
if exist requirements.txt (
    pip install -r requirements.txt
) else (
    echo Nenhum requirements.txt encontrado.
)

echo Aplicando migrations...
python manage.py migrate

echo Iniciando servidor...
start http://127.0.0.1:8000
python manage.py runserver

pause