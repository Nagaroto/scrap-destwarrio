# Módulo responsável por realizar web scraping no Mercado Livre utilizando Selenium e BeautifulSoup.
# Este arquivo contém a função principal 'escarp' que busca produtos com base em um termo de pesquisa.
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re

# Função principal que realiza o scraping de produtos no Mercado Livre.
# Recebe um termo de pesquisa e retorna uma lista de dicionários com nome, preço e link dos produtos.
def escarp(termo):
    # Import local para evitar erros em tempo de import do Django (manage.py)
    # quando a dependência 'beautifulsoup4' não estiver instalada no ambiente.
    try:
        from bs4 import BeautifulSoup
    except Exception as e:
        raise ImportError("beautifulsoup4 não está instalado — instale com 'pip install beautifulsoup4'")

    # Inicializa lista para armazenar os produtos encontrados.
    produtos = []

    # Verifica se o termo de pesquisa foi fornecido; se não, retorna lista vazia.
    if not termo:
        return produtos

    # Configura opções do Chrome para execução headless e simulação de navegador real.
    options = Options()

    # Configurações para modo headless moderno, evitando detecção de automação.
    options.add_argument("--headless=new")

    # Simula um navegador real com tamanho de janela e desabilita recursos de automação.
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Define User-Agent real para simular navegador legítimo.
    options.add_argument(
        "user-agent=Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
    options.add_argument("--lang=pt-BR")

    # Inicializa o driver do Chrome com as opções configuradas e cria um WebDriverWait para esperas.
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 25)

    # Acessa a página inicial do Mercado Livre.
    driver.get("https://www.mercadolivre.com.br/")

    # Aguarda e localiza o campo de busca, enviando o termo de pesquisa.
    campo = wait.until(
        EC.presence_of_element_located((By.NAME, "as_word"))
    )
    campo.send_keys(termo)

    # Localiza e clica no botão de submit para realizar a busca.
    botao = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
    )
    botao.click()

    # Aguarda o carregamento dos resultados de busca.
    wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "li.ui-search-layout__item"))
    )

    # Parseia o HTML da página com BeautifulSoup para extração de dados.
    soup = BeautifulSoup(driver.page_source, "html.parser")

    # Itera sobre cada item de produto na lista de resultados.
    for card in soup.select("li.ui-search-layout__item"):
        # Extrai título, preço bruto e link do produto do elemento HTML.
        titulo = card.select_one("h3")
        preco_raw = card.select_one(".poly-price__current")
        link = card.select_one("a[href]")

        # Verifica se todos os elementos necessários foram encontrados; se não, pula o item.
        if not (titulo and preco_raw and link):
            continue

        # Limpa e formata o texto do preço utilizando expressão regular para extrair o valor numérico.
        texto_preco = preco_raw.text.strip()
        match = re.search(r'R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})', texto_preco)

        if not match:
            continue

        preco_limpo = match.group(1)

        # Adiciona o produto à lista com nome, preço formatado e link.
        produtos.append({
            "nome": titulo.text.strip(),
            "preco": f"R$ {preco_limpo}",
            "link": link["href"]
        })

    # Fecha o navegador e retorna a lista de produtos encontrados.
    driver.quit()
    return produtos
