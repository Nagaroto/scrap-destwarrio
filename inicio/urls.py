
from .views import escarp_view
from django.urls import path
from . import views
from .views import adicionar_carrinho

urlpatterns = [
    path("", escarp_view, name="estilo"),
    path("home/", views.home, name="home"),
    path("login/", views.logi, name="logi"),
    path('carrinho/adicionar/', adicionar_carrinho),
    path('api/carrinho/', views.api_carrinho, name='api_carrinho'),
    path('api/produtos/', views.api_produtos, name='api_produtos'),
    path('tabela/',views.tabela, name='tabela' ),
    path("carrinho/excluir/", views.excluir_produto, name="excluir_produto"),
    path("grafico/", views.grafico, name="grafico"),


]



