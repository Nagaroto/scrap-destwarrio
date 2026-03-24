# Módulo de modelos do aplicativo 'inicio', definindo as estruturas de dados para o banco de dados.
# Contém o modelo CarrinhoItem para gerenciar itens no carrinho de compras do usuário.
from django.db import models
from django.contrib.auth.models import User

from django.db import models
from django.contrib.auth.models import User

# Modelo que representa um item no carrinho de compras de um usuário.
# Armazena informações do produto e quantidade selecionada.
class CarrinhoItem(models.Model):
    # Chave estrangeira para o usuário proprietário do item, com índice para otimização de consultas.
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='itens_carrinho',
        db_index=True
    )
    nome = models.CharField(max_length=255)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    link = models.URLField()

    # ⭐ NOVO CAMPO — controla quantas unidades do produto existem
    quantidade = models.PositiveIntegerField(default=1)

    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.nome} ({self.quantidade}) - {self.usuario.username}"


# ⭐ IMPORTANTE
# Sua view excluir usa ItemCarrinho
# então criamos um alias apontando para o model real
ItemCarrinho = CarrinhoItem
