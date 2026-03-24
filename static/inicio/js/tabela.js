document.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector(".products-container")
    if (!container) return

    /* ================= ESTADO REAL ================= */
    let carrinho = []

    function salvarCarrinho(){
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        console.log('Carrinho salvo:', carrinho);
    }

    /* ================= PEGAR TODOS PRODUTOS DA TELA ================= */
    function carregarProdutosDaTela(){
        carrinho = [] // limpa antes de recriar
        console.log('Carregando produtos da tela...');

        carrinho = [] // limpa antes de recriar

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
            preco: card.querySelector(".price").innerText.trim()
        }
    }

    /* ================= ALTERAR QUANTIDADE ================= */
    async function alterarQuantidade(id, delta){

        const el = document.getElementById("qtd-" + id)
        if (!el) return

        let atual = parseInt(el.innerText) || 1
        const card = el.closest(".product-card")

        const produto = getProduto(card)

        try{

            if (delta > 0){

                const resAdd = await fetch("/inicio/carrinho/adicionar/", {
                    method:"POST",
                    credentials: 'same-origin',
                    headers:{
                        "Content-Type":"application/json",
                        "X-CSRFToken":csrfToken
                    },
                    body:JSON.stringify(produto)
                })

                if (!resAdd.ok){
                    if (resAdd.status === 401) {
                        alert('Você precisa estar logado para adicionar ao carrinho')
                        window.location.href = '/inicio/login/'
                        return
                    }
                    throw new Error('Erro ao adicionar')
                }

                el.innerText = atual + 1

            } else {

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

                if (!resRem.ok){
                    if (resRem.status === 401){
                        alert('Você precisa estar logado para excluir produtos')
                        window.location.href = '/inicio/login/'
                        return
                    }
                    throw new Error('Erro ao remover')
                }

                if (atual <= 1){
                    card.remove()
                } else {
                    el.innerText = atual - 1
                }
                
                // RECARREGA A PÁGINA APÓS DIMINUIR
                setTimeout(() => {
                    location.reload()
                }, 500)
                return
            }

            //  RECARREGA TUDO - para garantir que o estado real esteja sempre atualizado
            carregarProdutosDaTela()

        }catch(err){
            console.error(err)
            alert("Erro ao alterar quantidade")
        }
    }

    /* ================= EXCLUIR ================= */
    async function excluirProduto(btn){

        const id = Number(btn.dataset.id)
        const card = btn.closest(".product-card")
        const qtdEl = document.getElementById("qtd-" + id)

        if (!id || !qtdEl) return

        const atual = parseInt(qtdEl.innerText) || 1

        try{

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

            if (!resDel.ok){
                if (resDel.status === 401){
                    alert('Você precisa estar logado para excluir produtos')
                    window.location.href = '/inicio/login/'
                    return
                }
                throw new Error('Erro ao deletar')
            }

            card.remove()

            //  RECARREGA TUDO
            carregarProdutosDaTela()

        }catch(err){
            console.error(err)
            alert("Erro ao excluir")
        }
    }

    /* ================= EVENTOS ================= */
    container.addEventListener("click", e => {

        const btn = e.target.closest("button")
        if (!btn) return

        if (btn.classList.contains("plus")){
            alterarQuantidade(btn.dataset.id, 1)
        }

        if (btn.classList.contains("minus")){
            alterarQuantidade(btn.dataset.id, -1)
        }

        if (btn.classList.contains("delete-btn")){
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