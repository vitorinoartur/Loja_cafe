// public/js/app.js
let cafes = [];
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let filtroAtual = 'Todos';
let enderecosSelecionado = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    cafes = await getCafes(); // precisa estar definida em outro script
    renderizarProdutos(cafes);
    atualizarTotalCarrinho();
  } catch (error) {
    console.error('Erro ao carregar cafés:', error);
    alert('Não foi possível carregar os produtos.');
  }
});

function renderizarProdutos(produtos) {
  const grid = document.getElementById('gridProdutos');
  grid.innerHTML = '';

  produtos.forEach(cafe => {
    const precoNum = Number(cafe.preco);
    const precoFormatado = isNaN(precoNum) ? '0.00' : precoNum.toFixed(2);

    const card = document.createElement('div');
    card.className = 'card-produto';
    card.innerHTML = `
      <div class="card-imagem">☕</div>
      <div class="card-body">
        <div class="card-nome">${cafe.nome}</div>
        <div class="card-categoria">${cafe.categoria}</div>
        <div class="card-descricao">${cafe.descricao}</div>
        <div class="card-intensidade">Intensidade: ${cafe.intensidade}/10</div>
        <div class="card-preco">R$ ${precoFormatado}</div>
        <button class="btn-comprar" onclick="adicionarAoCarrinho(${cafe.id}, '${cafe.nome}', ${precoNum || 0})">
          🛒 Comprar
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filtrarPorCategoria(categoria, event) {
  filtroAtual = categoria;

  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (event) event.target.classList.add('active');

  if (categoria === 'Todos') {
    renderizarProdutos(cafes);
  } else {
    const filtrados = cafes.filter(cafe => cafe.categoria === categoria);
    renderizarProdutos(filtrados);
  }
}

function adicionarAoCarrinho(id, nome, preco) {
  const item = carrinho.find(item => item.id === id);

  if (item) {
    item.quantidade++;
  } else {
    carrinho.push({ id, nome, preco, quantidade: 1 });
  }

  salvarCarrinho();
  atualizarTotalCarrinho();
  alert(`${nome} adicionado ao carrinho!`);
}

function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function atualizarTotalCarrinho() {
  const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
  document.getElementById('totalCarrinho').textContent = totalItens;
}

// ... (restante do código igual ao seu, mas com try/catch nos fetch)
