/**
 * GRÁFICO.JS — Análise de Preços
 * 
 * Responsabilidades:
 * 1. Buscar itens do carrinho via /inicio/api/carrinho/ (autenticado)
 * 2. Renderizar gráficos (barra, linha, pizza) com Chart.js
 * 3. Exibir ranking de preços ordenado
 * 4. Filtrar itens em tempo real por nome
 * 5. Calcular estatísticas (produtos, média, economia)
 */

// ================= ESTADO GLOBAL =================
let todosOsItens = []      // Todos os itens da API
let itensExibidos = []     // Itens após aplicar filtro

// Instâncias dos gráficos (Chart.js)
let graficoBarras = null
let graficoLinha = null
let graficoPizza = null

// ================= UTILITÁRIOS =================

/**
 * Converte preço formatado (ex: "R$ 49,90") para número
 */
function extrairPrecoNumerico(precoFormatado) {
    if (!precoFormatado) return 0
    // Remove "R$", espaços, substitui vírgula por ponto
    const num = parseFloat(
        precoFormatado
            .replace(/R\$\s?/g, '')  // remove "R$ "
            .replace(/\./g, '')       // remove pontos (milhares)
            .replace(',', '.')        // substitui vírgula por ponto
    )
    return isNaN(num) ? 0 : num
}

/**
 * Obtém o token CSRF do cookie
 */
function obterCsrfToken() {
    let token = null
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';')
        for (let cookie of cookies) {
            cookie = cookie.trim()
            if (cookie.startsWith('csrftoken=')) {
                token = decodeURIComponent(cookie.slice(10))
                break
            }
        }
    }
    return token
}

/**
 * Destrói gráficos existentes
 */
function destruirGraficos() {
    if (graficoBarras) {
        graficoBarras.destroy()
        graficoBarras = null
    }
    if (graficoLinha) {
        graficoLinha.destroy()
        graficoLinha = null
    }
    if (graficoPizza) {
        graficoPizza.destroy()
        graficoPizza = null
    }
}

// ================= RENDERIZAÇÃO =================

/**
 * Renderiza todos os gráficos e ranking com os dados fornecidos
 */
function renderizarGraficos(items) {
    // Se não há dados, mostra mensagem vazia
    if (!items || items.length === 0) {
        destruirGraficos()
        document.getElementById("ranking").innerHTML = "<p style='text-align:center; padding: 20px;'>Nenhum produto para exibir 😢</p>"
        atualizarEstatisticas([], 0, 0, 0)
        return
    }

    // Extrai dados para os gráficos
    const nomes = items.map(p => p.nome.substring(0, 30)) // trunca nomes longos
    const precos = items.map(p => extrairPrecoNumerico(p.preco))
    const quantidades = items.map(p => p.quantidade || 1)

    // Calcula min/max/média para cores e stats
    const menorPreco = Math.min(...precos)
    const maiorPreco = Math.max(...precos)
    const mediaPreco = precos.reduce((a, b) => a + b, 0) / precos.length

    // Define cores (barato=verde, caro=vermelho, meio=cyan)
    const cores = precos.map(p => {
        if (p === menorPreco) return "#00ff88"  // verde
        if (p === maiorPreco) return "#ff3b3b"  // vermelho
        return "#00ffe7"                         // cyan
    })

    destruirGraficos()

    // ===== GRÁFICO DE BARRAS =====
    const canvasBarra = document.getElementById("graficoBarra")
    if (canvasBarra) {
        graficoBarras = new Chart(canvasBarra, {
            type: "bar",
            data: {
                labels: nomes,
                datasets: [
                    {
                        label: "Preço (R$)",
                        data: precos,
                        backgroundColor: cores,
                        borderColor: "#00ffe7",
                        borderWidth: 1
                    },
                    {
                        label: "Quantidade",
                        data: quantidades,
                        backgroundColor: "rgba(0,200,255,0.3)",
                        borderColor: "#00c8ff",
                        borderWidth: 1,
                        yAxisID: "y1"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: { display: true, text: "Preço (R$)" }
                    },
                    y1: {
                        type: "linear",
                        position: "right",
                        title: { display: true, text: "Quantidade" }
                    }
                },
                plugins: {
                    legend: { display: true, position: "top" }
                }
            }
        })
    }

    // ===== GRÁFICO DE LINHA =====
    const canvasLinha = document.getElementById("graficoLinha")
    if (canvasLinha) {
        graficoLinha = new Chart(canvasLinha, {
            type: "line",
            data: {
                labels: nomes,
                datasets: [
                    {
                        label: "Preços",
                        data: precos,
                        borderColor: "#00ffe7",
                        backgroundColor: "rgba(0,255,231,0.1)",
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: cores,
                        pointBorderColor: cores,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: "top" }
                }
            }
        })
    }

    // ===== GRÁFICO DE PIZZA =====
    const canvasPizza = document.getElementById("graficoPizza")
    if (canvasPizza) {
        graficoPizza = new Chart(canvasPizza, {
            type: "doughnut",
            data: {
                labels: nomes,
                datasets: [
                    {
                        data: precos,
                        backgroundColor: cores,
                        borderColor: "#000",
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: "right" }
                }
            }
        })
    }

    // ===== RANKING =====
    renderizarRanking(items, menorPreco, maiorPreco)

    // ===== ESTATÍSTICAS =====
    atualizarEstatisticas(precos, menorPreco, maiorPreco, mediaPreco)
}

/**
 * Renderiza o ranking de preços
 */
function renderizarRanking(items, menorPreco, maiorPreco) {
    const rankingDiv = document.getElementById("ranking")
    rankingDiv.innerHTML = ""

    // Ordena por preço (menor primeiro)
    const ordenados = [...items].sort(
        (a, b) => extrairPrecoNumerico(a.preco) - extrairPrecoNumerico(b.preco)
    )

    ordenados.forEach((item, index) => {
        const precoNum = extrairPrecoNumerico(item.preco)

        const div = document.createElement("div")
        div.className = "rank-item"

        // Destaca o mais barato (verde) e o mais caro (vermelho)
        if (precoNum === menorPreco) div.classList.add("rank-barato")
        if (precoNum === maiorPreco) div.classList.add("rank-caro")

        // Conteúdo do card
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #00ffe7;">#${index + 1}</strong>
                    <p style="margin: 5px 0; font-size: 13px;">${item.nome}</p>
                    <p style="font-size: 11px; opacity: 0.7;">ID: ${item.id} | Qtd: ${item.quantidade}</p>
                </div>
                <span style="font-size: 16px; font-weight: bold;">${item.preco}</span>
            </div>
        `

        rankingDiv.appendChild(div)
    })
}

/**
 * Atualiza as estatísticas (produtos, média, economia)
 */
function atualizarEstatisticas(precos, minPreco, maxPreco, mediaPreco) {
    document.getElementById("totalProdutos").innerText = `Produtos: ${precos.length}`
    document.getElementById("mediaPreco").innerText = `Média: ${(mediaPreco).toFixed(2)}`
    document.getElementById("economia").innerText = `Economia: ${(maxPreco - minPreco).toFixed(2)}`
}

// ================= FILTRO =================

/**
 * Aplica filtro aos itens
 */
function aplicarFiltro(termo) {
    if (!termo || termo.trim() === "") {
        // Sem filtro: mostra todos
        itensExibidos = [...todosOsItens]
    } else {
        // Com filtro: mostra apenas os que contêm o termo
        const termoLower = termo.toLowerCase()
        itensExibidos = todosOsItens.filter(item =>
            item.nome.toLowerCase().includes(termoLower)
        )
    }

    // Re-renderiza os gráficos com os itens filtrados
    renderizarGraficos(itensExibidos)
}

// ================= INICIALIZAÇÃO =================

/**
 * Carrega os dados da API e inicializa a página
 */
async function inicializar() {
    console.log("🚀 Inicializando gráfico...")

    try {
        // Busca todos os produtos do banco para análise de mercado
        const resposta = await fetch("/inicio/api/produtos/", {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            }
        })

        // Se ocorreu erro
        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`)
        }

        // Parse dos dados
        const dados = await resposta.json()
        console.log(`✓ ${dados.length} itens carregados da API`, dados)

        // Armazena no estado global
        todosOsItens = dados
        itensExibidos = [...todosOsItens]

        // Renderiza os gráficos com os dados iniciais
        renderizarGraficos(itensExibidos)

        // Liga os eventos de filtro
        configurarFiltro()

    } catch (err) {
        console.error("❌ Erro ao carregar gráfico:", err)
        document.getElementById("ranking").innerHTML = `<p style='color: red; text-align: center;'>Erro ao carregar os dados: ${err.message}</p>`
        atualizarEstatisticas([], 0, 0, 0)
    }
}

/**
 * Configura os listeners dos filtros
 */
function configurarFiltro() {
    const inputFiltro = document.getElementById("filtro")
    const btnReset = document.getElementById("btnReset")

    // Evento de digitação no input de filtro
    if (inputFiltro) {
        inputFiltro.addEventListener("input", (e) => {
            const termo = e.target.value.trim()
            aplicarFiltro(termo)
        })
    }

    // Botão de reset
    if (btnReset) {
        btnReset.addEventListener("click", () => {
            if (inputFiltro) inputFiltro.value = ""
            aplicarFiltro("")
        })
    }
}

// ================= START =================

// Inicia quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", inicializar)