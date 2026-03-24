#!/bin/bash

echo "Verificando Python..."

if ! command -v python3 &> /dev/null
then
    echo "Python3 nao encontrado."
    echo "Tentando instalar..."
    sudo apt update && sudo apt install -y python3 python3-pip python3-venv
fi

echo "Criando ambiente virtual..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate

echo "Atualizando pip..."
python3 -m pip install --upgrade pip

echo "Instalando dependencias..."
if [ -f requirements.txt ]; then
    pip install -r requirements.txt
else
    echo "requirements.txt nao encontrado"
fi

echo "Aplicando migrations..."
python3 manage.py migrate

echo "Iniciando servidor..."
xdg-open http://127.0.0.1:8000 2>/dev/null
python3 manage.py runserver