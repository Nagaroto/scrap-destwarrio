# Scrap DestWarrio

O Scrap DestWarrio não é apenas mais um script de scraping.
Trata-se de um sistema completo de coleta, processamento e visualização de dados, projetado para rodar de forma simples, confiável e direta.

Enquanto muitos projetos semelhantes exigem configuração manual extensa e frequentemente quebram em ambientes diferentes, este foi construído com foco em execução imediata.

A proposta é clara: clonar, executar e utilizar.

---

## Ideia por trás

Grande parte dos scrapers disponíveis:

* quebram com facilidade
* exigem configuração manual
* dependem de conhecimento técnico prévio

O Scrap DestWarrio segue outra abordagem:

Automação, simplicidade e estrutura.

---

## Tecnologias utilizadas

O projeto utiliza um conjunto sólido de ferramentas:

* Python
* Selenium
* BeautifulSoup4
* SQLite3
* Django
* HTML, CSS e JavaScript

Cada tecnologia foi escolhida para cumprir um papel específico dentro do fluxo do sistema.

---

## Funcionalidades

* Coleta automatizada de dados
* Navegação em páginas dinâmicas com Selenium
* Extração estruturada com BeautifulSoup
* Armazenamento em banco SQLite
* Organização backend com Django
* Visualização dos dados via interface web

---

## Estrutura do projeto

O projeto foi organizado de forma clara e funcional:

* inicio/ → lógica principal (models, views, services)
* templates/ → interface HTML
* static/ → arquivos de estilo e scripts
* scripts/ → automações e testes
* launcher.py → ponto de entrada principal
* instala_linux.sh → instalação automática para Linux/Mac
* instala_windows.bat → instalação automática para Windows

---

## Diferenciais

### Execução simplificada

O usuário não precisa configurar manualmente o ambiente.

### Detecção automática de sistema

O launcher identifica o sistema operacional e executa o script correto.

### Instalação automatizada

As dependências são instaladas automaticamente.

### Estrutura real de projeto

Não se trata de um script isolado, mas de um sistema organizado.

---

## Casos de uso

* Coleta de dados de sites dinâmicos
* Monitoramento de informações
* Análise de conteúdo
* Automação de tarefas repetitivas
* Base para projetos maiores

---

## Requisitos

* Python instalado
* Conexão com internet
* Permissões básicas no sistema

---

## Funcionamento interno

O fluxo do sistema é direto:

1. O usuário executa o launcher
2. O sistema identifica o ambiente
3. O script apropriado é executado
4. As dependências são instaladas
5. O banco de dados é preparado
6. O servidor é iniciado

---

## Banco de dados

O projeto utiliza SQLite3 por ser:

* leve
* rápido
* sem necessidade de configuração
* portátil

Isso permite execução imediata sem instalação de serviços externos.

---

## Sobre o scraping

O sistema combina duas abordagens:

Selenium para interação com páginas dinâmicas.
BeautifulSoup para extração e organização dos dados.

Essa combinação garante flexibilidade e eficiência.

---

## Público alvo

* Desenvolvedores
* Analistas de dados
* Pessoas interessadas em automação
* Projetos que precisam coletar dados da web

---

## Considerações

Muitos projetos de scraping disponíveis não são pensados para uso real.
Este foi estruturado para funcionar como base sólida.

---

## Como usar

### Linux / Mac

```bash
git clone https://github.com/Nagaroto/scrap-destwarrio.git
cd scrap-destwarrio
python3 launcher.py
```

---

### Windows

```bat
git clone https://github.com/Nagaroto/scrap-destwarrio.git
cd scrap-destwarrio
python launcher.py
```

---

## O que esperar

Após executar:

* as dependências serão instaladas
* o ambiente será preparado
* o sistema será iniciado

---

## Conclusão

O Scrap DestWarrio é mais do que um script.
É uma base funcional, estruturada e pronta para evolução.

Pode ser utilizado tanto como ferramenta quanto como ponto de partida para projetos maiores.

---

## Autor

Hercolys da Silva Lima

---

Se quiser depois, eu te deixo esse README ainda mais pesado com:

* imagens do sistema
* demonstração
* badges de build e status

aí vira nível projeto open source grande mesmo.
