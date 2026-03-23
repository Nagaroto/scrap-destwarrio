#!/bin/bash
echo "Instalando dependencias para Linux..."

# Atualiza o sistema e instala Python e pip se necessário
sudo apt update && sudo apt install -y python3 python3-pip

# Instala dependências do projeto
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

echo "Dependencias instaladas! Rodando o programa..."
# Substitua 'main.py' pelo arquivo principal do projeto
python3 main.py