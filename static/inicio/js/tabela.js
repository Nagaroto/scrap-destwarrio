document.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector(".products-container")
    if (!container) return

    /* ================= ESTADO REAL ================= */
    let carrinho = []
    let requisicaoEmProgresso = false

    function salvarCarrinho(){
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        console.log('Carrinho salvo:', carrinho);
    }

    /* ================= PEGAR TODOS PRODUTOS DA TELA ================= */
    function carregarProdutosDaTela(){
        carrinho = []
        console.log('Carregando produtos da tela...');

        document.querySelectorAll(".product-card").forEach(card => {

            const nome = card.querySelector("h3").innerText.trim()
            const preco = card.querySelector(".price").innerText.trim()
            const quantidade = parseInt(
                card.querySelector(".quantity").innerText
            ) || 1

            for(let i = 0; i < quantidade; i++){
                carrinho.push({ nome, preco })
            }

        })

        salvarCarrinho()
    }

    /* roda ao iniciar */
    carregarProdutosDaTela()

    /* ================= CSRF ================= */
    function getCookie(name){
        let cookieValue = null
        if (document.cookie){
            const cookies = document.cookie.split(';')
            for (let cookie of cookies){
                cookie = cookie.trim()
                if (cookie.startsWith(name + '=')){
                    cookieValue = decodeURIComponent(cookie.slice(name.length + 1))
                    break
                }
            }
        }
        return cookieValue
    }

    const csrfToken = getCookie("csrftoken")

    /* ================= PEGAR DADOS DO CARD ================= */
    function getProduto(card){
        return {
            nome: card.querySelector("h3").innerText.trim(),
            preco: card.querySelector(".price").innerText.trim(),
            link: card.querySelector("a") ? card.querySelector("a").href : ""
        }
    }

    /* ================= DESABILITAR BOTÕES ================= */
    function desabilitarBotoes(card, estado){
        card.querySelectorAll(".plus, .minus, .delete-btn").forEach(btn => {
            btn.disabled = estado
            btn.style.opacity = estado ? "0.5" : "1"
            btn.style.pointerEvents = estado ? "none" : "auto"
        })
    }

    /* ================= SINCRONIZAR COM BACKEND ================= */
    async function sincronizarComBackend(){
        try {
            const res = await fetch("/inicio/api/carrinho/", {
                credentials: 'same-origin'
            })
            
            if (!res.ok) return
            
            const itensBackend = await res.json()
            console.log("Itens do backend:", itensBackend)
            
            // Atualizar quantidade dos cards existentes
            document.querySelectorAll(".product-card").forEach(card => {
                const id = Number(card.dataset.id)
                const itemBackend = itensBackend.find(i => i.id === id)
                
                if (itemBackend) {
                    const qtdEl = card.querySelector(".quantity")
                    if (qtdEl) {
                        qtdEl.innerText = itemBackend.quantidade
                    }
                } else {
                    // Item foi removido no backend, remove do frontend
                    card.style.opacity = "0"
                    card.style.transform = "scale(0.9)"
                    setTimeout(() => card.remove(), 300)
                }
            })
            
            carregarProdutosDaTela()
        } catch(err) {
            console.error("Erro ao sincronizar:", err)
        }
    }

    /* ================= ALTERAR QUANTIDADE ================= */
    async function alterarQuantidade(id, delta){

        if (requisicaoEmProgresso) {
            console.log("Requisição em progresso, ignore clique")
            return
        }

        const el = document.getElementById("qtd-" + id)
        if (!el) return

        let atual = parseInt(el.innerText) || 1
        const card = el.closest(".product-card")

        if (!card) return

        const produto = getProduto(card)

        try{

            requisicaoEmProgresso = true
            desabilitarBotoes(card, true)

            if (delta > 0){
                // ===== BOTÃO PLUS: AUMENTAR QUANTIDADE =====
                console.log("PLUS - Adicionando ao carrinho:", produto)
                
                const resAdd = await fetch("/inicio/carrinho/adicionar/", {
                    method:"POST",
                    credentials: 'same-origin',
                    headers:{
                        "Content-Type":"application/json",
                        "X-CSRFToken":csrfToken
                    },
                    body:JSON.stringify(produto)
                })

                console.log("Response status:", resAdd.status)
                const dataAdd = await resAdd.json()
                console.log("Response data:", dataAdd)

                if (!resAdd.ok){
                    if (resAdd.status === 401) {
                        alert('Você precisa estar logado para adicionar ao carrinho')
                        window.location.href = '/inicio/login/'
                        return
                    }
                    throw new Error(dataAdd.erro || 'Erro ao adicionar')
                }

                // Animação visual sutil
                el.style.transform = "scale(1.2)"
                setTimeout(() => {
                    el.style.transform = "scale(1)"
                }, 300)

                // Sincroniza com backend após 500ms (tempo para resposta)
                setTimeout(() => {
                    sincronizarComBackend()
                }, 500)

            } else {
                // ===== BOTÃO MINUS: DIMINUIR QUANTIDADE =====
                console.log("MINUS - Removendo do carrinho. ID:", id, "Atual:", atual)
                
                const resRem = await fetch("/inicio/carrinho/excluir/", {
                    method:"POST",
                    credentials: 'same-origin',
                    headers:{
                        "Content-Type":"application/json",
                        "X-CSRFToken":csrfToken
                    },
                    body:JSON.stringify({
                        produto_id: Number(id),
                        quantidade: Number(1)
                    })
                })

                console.log("Response status:", resRem.status)
                const dataRem = await resRem.json()
                console.log("Response data:", dataRem)

                if (!resRem.ok){
                    if (resRem.status === 401){
                        alert('Você precisa estar logado para excluir produtos')
                        window.location.href = '/inicio/login/'
                        return
                    }
                    throw new Error(dataRem.erro || 'Erro ao remover')
                }

                // Animação visual
                el.style.transform = "scale(0.9)"
                setTimeout(() => {
                    el.style.transform = "scale(1)"
                }, 300)

                // Sincroniza com backend
                setTimeout(() => {
                    sincronizarComBackend()
                }, 500)
            }

        }catch(err){
            console.error("Erro na alteração:", err)
            alert("Erro ao alterar quantidade: " + err.message)
        } finally {
            requisicaoEmProgresso = false
            desabilitarBotoes(card, false)
        }
    }

    /* ================= EXCLUIR ================= */
    async function excluirProduto(btn){

        if (requisicaoEmProgresso) {
            console.log("Requisição em progresso, ignore clique")
            return
        }

        const id = Number(btn.dataset.id)
        const card = btn.closest(".product-card")
        const qtdEl = document.getElementById("qtd-" + id)

        if (!id || !qtdEl || !card) return

        const atual = parseInt(qtdEl.innerText) || 1

        console.log("DELETE - Removendo item. ID:", id, "Quantidade:", atual)

        try{

            requisicaoEmProgresso = true
            desabilitarBotoes(card, true)

            // ===== BOTÃO DELETE: REMOVE COMPLETAMENTE =====
            const resDel = await fetch("/inicio/carrinho/excluir/", {
                method:"POST",
                credentials: 'same-origin',
                headers:{
                    "Content-Type":"application/json",
                    "X-CSRFToken":csrfToken
                },
                body:JSON.stringify({
                    produto_id: Number(id),
                    quantidade: Number(atual)
                })
            })

            console.log("Response status:", resDel.status)
            const dataDel = await resDel.json()
            console.log("Response data:", dataDel)

            if (!resDel.ok){
                if (resDel.status === 401){
                    alert('Você precisa estar logado para excluir produtos')
                    window.location.href = '/inicio/login/'
                    return
                }
                throw new Error(dataDel.erro || 'Erro ao deletar')
            }

            // Remove com animação suave
            card.style.opacity = "0"
            card.style.transform = "translateX(-100%)"
            setTimeout(() => {
                card.remove()
                carregarProdutosDaTela()
            }, 300)

        }catch(err){
            console.error("Erro na exclusão:", err)
            alert("Erro ao excluir: " + err.message)
        } finally {
            requisicaoEmProgresso = false
            desabilitarBotoes(card, false)
        }
    }

    /* ================= EVENTOS ================= */
    container.addEventListener("click", e => {

        const btn = e.target.closest("button")
        if (!btn) return

        if (btn.classList.contains("plus")){
            console.log("Clicou PLUS. Data-id:", btn.dataset.id)
            alterarQuantidade(btn.dataset.id, 1)
        }

        if (btn.classList.contains("minus")){
            console.log("Clicou MINUS. Data-id:", btn.dataset.id)
            alterarQuantidade(btn.dataset.id, -1)
        }

        if (btn.classList.contains("delete-btn")){
            console.log("Clicou DELETE. Data-id:", btn.dataset.id)
            excluirProduto(btn)
        }
    })

    /* ================= BOTÃO GRÁFICO ================= */
    const btnGrafico = document.getElementById("btnGrafico")

    if (btnGrafico){
        btnGrafico.onclick = () => {
            salvarCarrinho()
            window.location.href = "/inicio/grafico/"
        }
    }

    /* ================= FILTRO ================= */
    const inputBusca = document.getElementById("filtro")

    if(inputBusca){
        inputBusca.addEventListener("input", e => {

            const valor = e.target.value.toLowerCase()

            document.querySelectorAll(".product-card").forEach(card => {

                const nome = card.querySelector("h3").innerText.toLowerCase()

                card.style.display = nome.includes(valor) ? "flex" : "none"
            })
        })
    }

})
