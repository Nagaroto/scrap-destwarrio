from django.test import TestCase, Client
from django.contrib.auth.models import User
from .models import CarrinhoItem
import json


class CarrinhoDeleteTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testdelete', password='123456')
        self.client = Client()
        self.client.login(username='testdelete', password='123456')

    def test_excluir_produto_deleta_completamente_se_qtd_igual(self):
        item = CarrinhoItem.objects.create(
            usuario=self.user,
            nome='Teste Item',
            preco='10.00',
            link='http://example.com',
            quantidade=3,
        )

        response = self.client.post(
            '/inicio/carrinho/excluir/',
            data=json.dumps({'produto_id': item.id, 'quantidade': 3}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(CarrinhoItem.objects.filter(id=item.id).exists())

    def test_excluir_produto_decrementa_e_remove_se_zerar(self):
        item = CarrinhoItem.objects.create(
            usuario=self.user,
            nome='Teste Item 2',
            preco='20.00',
            link='http://example.com',
            quantidade=2,
        )

        response = self.client.post(
            '/inicio/carrinho/excluir/',
            data=json.dumps({'produto_id': item.id, 'quantidade': 1}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(item.quantidade, 1)

        response = self.client.post(
            '/inicio/carrinho/excluir/',
            data=json.dumps({'produto_id': item.id, 'quantidade': 1}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(CarrinhoItem.objects.filter(id=item.id).exists())
