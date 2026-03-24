@echo off
echo Verificando Python...

python --version >nul 2>&1
if errorlevel 1 (
    echo Python nao encontrado. Por favor instale Python 3.8+
    pause
    exit /b 1
)

echo Criando ambiente virtual...
if not exist ".venv" (
    python -m venv .venv
)

call .venv\Scripts\activate.bat

echo Atualizando pip...
python -m pip install --upgrade pip

echo Instalando dependencias...
if exist requirements.txt (
    pip install -r requirements.txt
) else (
    echo requirements.txt nao encontrado
)

echo Aplicando migrations...
python manage.py migrate

echo Iniciando servidor...
timeout /t 2
start http://127.0.0.1:8001/inicio/login/
python manage.py runserver 0.0.0.0:8001
