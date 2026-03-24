"""Simple end-to-end test script (non-destructive):
Creates a user (if missing), logs in via the app view, adds a cart item,
then fetches `/inicio/api/carrinho/` and prints the result.

Run from project root (bscr/bscr):

python3 scripts/test_end_to_end.py

This script bootstraps Django settings and uses the Django test Client.
"""
import os
import django
import json
from pprint import pprint

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bscr.settings')

django.setup()

from django.test import Client
from django.contrib.auth.models import User

USERNAME = 'test_user_e2e'
PASSWORD = 'TestPass123!'

client = Client()

# create user if missing
user, created = User.objects.get_or_create(username=USERNAME)
if created:
    user.set_password(PASSWORD)
    user.save()
    print('Usuário criado:', USERNAME)
else:
    print('Usuário já existe:', USERNAME)

# login via JSON endpoint (view aceita JSON)
login_payload = json.dumps({'username': USERNAME, 'password': PASSWORD})
res = client.post('/inicio/login/', data=login_payload, content_type='application/json')
print('Login status:', res.status_code)
try:
    print('Login response:', res.json())
except Exception:
    print('Login response (text):', res.content.decode())

# add an item
produto = {'nome': 'Produto Teste', 'preco': 'R$ 9,99', 'link': 'http://exemplo.test/produto'}
res2 = client.post('/inicio/carrinho/adicionar/', data=json.dumps(produto), content_type='application/json')
print('Adicionar item status:', res2.status_code)
try:
    print('Adicionar item response:', res2.json())
except Exception:
    print('Adicionar item response (text):', res2.content.decode())

# fetch API carrinho
res3 = client.get('/inicio/api/carrinho/')
print('API carrinho status:', res3.status_code)
try:
    data = res3.json()
    print('Itens retornados:')
    pprint(data)
except Exception:
    print('API carrinho resposta (text):', res3.content.decode())

print('Cookies atuais (client):', client.cookies.items())
print('\nScript finalizado.')
