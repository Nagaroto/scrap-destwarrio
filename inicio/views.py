from django.views.decorators.http import require_POST, require_GET

from .services.escarp import escarp
from .models import CarrinhoItem
from django.http import JsonResponse
from django.shortcuts import render, redirect
from decimal import Decimal, InvalidOperation
import json



def escarp_view(request):
    # Reset search term to avoid interference
    termo = request.GET.get("q")
    if termo:
        print("TERMO RECEBIDO:", termo)
    else:
        print("Nenhum termo de pesquisa recebido.")
    termo = request.GET.get("q")
    produtos = []

    if termo:
        print("TERMO RECEBIDO:", termo)
        produtos = escarp(termo)
        print("QTD PRODUTOS:", len(produtos))

    return render(request, "estilo.html", {
        "produtos": produtos,
        "termo": termo
    })


def adicionar_carrinho(request):
    print("BODY RECEBIDO:", request.body)
    print("CONTENT TYPE:", request.content_type)

    if request.method != 'POST':
        return JsonResponse({'erro': 'Método não permitido'}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({'erro': 'Usuário não autenticado'}, status=401)

    if not request.body:
        return JsonResponse({'erro': 'Body vazio'}, status=400)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'erro': 'JSON inválido'}, status=400)

    try:
        preco = Decimal(str(data.get('preco', '0')).replace(',', '.'))
    except InvalidOperation:
        return JsonResponse({'erro': 'Preço inválido'}, status=400)

    try:
        nome = data.get('nome', '')
        link = data.get('link', '')

        # 🔥 pega TODOS iguais
        itens = CarrinhoItem.objects.filter(
            usuario=request.user,
            nome=nome,
            link=link
        )

        if itens.exists():
            # pega o primeiro
            item = itens.first()

            # soma quantidade
            item.quantidade += 1
            item.save()

            # 🔥 limpa duplicados antigos (se existirem)
            itens.exclude(id=item.id).delete()

        else:
            CarrinhoItem.objects.create(
                usuario=request.user,
                nome=nome,
                preco=preco,
                link=link,
                quantidade=1
            )

        return JsonResponse({'status': 'ok'})

    except Exception as e:
        print("ERRO CARRINHO:", e)
        return JsonResponse({'erro': str(e)}, status=500)


@require_POST
def excluir_produto(request):

    print("\n===== EXCLUIR CARRINHO =====")
    print("USER:", request.user)
    print("BODY:", request.body)
    print("CONTENT TYPE:", request.content_type)

    # ===== usuário precisa estar logado =====
    if not request.user.is_authenticated:
        return JsonResponse({'erro': 'Usuário não autenticado'}, status=401)

    # ===== body obrigatório =====
    if not request.body:
        return JsonResponse({'erro': 'Body vazio'}, status=400)

    # ===== JSON válido =====
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'erro': 'JSON inválido'}, status=400)

    produto_id = data.get("produto_id")
    quantidade = data.get("quantidade")

    print("ID:", produto_id)
    print("QTD RECEBIDA:", quantidade)

    # ===== valida dados =====
    try:
        quantidade = int(quantidade)
    except (TypeError, ValueError):
        return JsonResponse({'erro': 'Quantidade inválida'}, status=400)

    if not produto_id or quantidade <= 0:
        return JsonResponse({'erro': 'Dados inválidos'}, status=400)

    try:

        # ⭐ garante que o item pertence ao usuário
        item = CarrinhoItem.objects.get(
            id=produto_id,
            usuario=request.user
        )

        print("ITEM ENCONTRADO:", item.nome)
        print("QTD ATUAL BANCO:", item.quantidade)

        # ===== REMOVER TOTAL =====
        if quantidade >= item.quantidade:
            item.delete()
            print("ITEM EXCLUÍDO COMPLETAMENTE")
            return JsonResponse({'status': 'ok'})

        # ===== excluir parcial =====
        nova_qtd = item.quantidade - quantidade

        if nova_qtd <= 0:
            item.delete()
            print("ITEM COM QTD 0 OU MENOR → REMOVIDO")
            return JsonResponse({'status': 'ok'})

        item.quantidade = nova_qtd
        item.save()

        print("NOVA QTD SALVA:", item.quantidade)

        return JsonResponse({
            'status': 'ok'
        })

    except CarrinhoItem.DoesNotExist:

        print("ITEM NÃO EXISTE")
        return JsonResponse({'erro': 'Produto não encontrado'}, status=404)

    except Exception as e:

        print("ERRO SERVIDOR:", str(e))
        return JsonResponse({'erro': str(e)}, status=500)




def home(request):
    return render(request, 'primeiro.html')


def tabela(request):
    # Mostra apenas os itens do usuário logado e aplica filtro de busca (q)
    if not request.user.is_authenticated:
        # redireciona para login se não autenticado
        return redirect('/inicio/login/')

    busca = request.GET.get('q')

    itens = CarrinhoItem.objects.filter(usuario=request.user, quantidade__gt=0)

    if busca:
        itens = itens.filter(nome__icontains=busca)

    return render(request, "tabela.html", {
        "itens": itens
    })



from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login

def logi(request):
    if request.method == "POST":

        if request.content_type and 'application/json' in request.content_type:
            try:
                body = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({'erro': 'JSON inválido'}, status=400)

            username = body.get('username')
            password = body.get('password')
        else:
            username = request.POST.get('username')
            password = request.POST.get('password')

        # Validações básicas
        if not username or not password:
            return JsonResponse({'erro': 'Username e password são obrigatórios'}, status=400)

        user = authenticate(request, username=username, password=password)

        if user is None:
            # Verificar se o usuário já existe
            if User.objects.filter(username=username).exists():
                return JsonResponse({'erro': 'Username já existe'}, status=400)
            
            # Criar novo usuário apenas se não existir
            try:
                user = User.objects.create_user(username=username, password=password)
                user.save()
                user = authenticate(request, username=username, password=password)
            except Exception as e:
                return JsonResponse({'erro': f'Erro ao criar usuário: {str(e)}'}, status=400)

        if user is None:
            return JsonResponse({'erro': 'Credenciais inválidas'}, status=401)

        login(request, user)

        if request.content_type and 'application/json' in request.content_type:
            return JsonResponse({'status': 'ok'})

        return redirect('/inicio/home/')

    return render(request, "logi.html")


def grafico(request):
    if not request.user.is_authenticated:
        return redirect('/inicio/login/')
    return render(request, "grafico.html")


@require_GET
def api_carrinho(request):
    """
    Retorna os itens do carrinho para o usuário autenticado em JSON.
    O formato é lista de objetos: {id, nome, preco, quantidade, link, criado_em}.
    Essa view é pensada para consumo por gráficos/visualizações no frontend.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'erro': 'Usuário não autenticado'}, status=401)

    itens = CarrinhoItem.objects.filter(usuario=request.user, quantidade__gt=0)

    resultado = []
    for it in itens:
        resultado.append({
            'id': it.id,
            'nome': it.nome,
            # preco como string formatada (ex: "R$ 49,90") para o frontend
            'preco': f"R$ {format(it.preco, '0.2f').replace('.', ',')}",
            'quantidade': it.quantidade,
            'link': it.link,
            'criado_em': it.criado_em.isoformat() if it.criado_em else None,
        })

    return JsonResponse(resultado, safe=False)


@require_GET
def api_produtos(request):
    """
    Retorna TODOS os produtos do banco de dados para análise geral (não filtrado por usuário).
    Ideal para gráficos de análise de mercado.
    Formato: lista de objetos {id, nome, preco, quantidade, usuario_id, link, criado_em}
    """
    # Busca todos os itens do carrinho (todos os usuários)
    itens = CarrinhoItem.objects.all().order_by('-criado_em')

    resultado = []
    for it in itens:
        resultado.append({
            'id': it.id,
            'nome': it.nome,
            'preco': f"R$ {format(it.preco, '0.2f').replace('.', ',')}",
            'quantidade': it.quantidade,
            'usuario_id': it.usuario_id,
            'link': it.link,
            'criado_em': it.criado_em.isoformat() if it.criado_em else None,
        })

    return JsonResponse(resultado, safe=False)
