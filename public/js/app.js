// public/js/app.js

let cafes = [];
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let filtroAtual = 'Todos';
let enderecoSelecionado = null;

// ===== CARREGAR CAFÉS (estava faltando!) =====
async function getCafes() {
  try {
    const response = await fetch('/api/cafes');
    if (!response.ok) {
      console.error('Erro ao buscar cafés:', response.status);
      return [];
    }
    const data = await response.json();
    console.log('Cafés carregados:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar cafés:', error);
    return [];
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    cafes = await getCafes();
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
  const totalEl = document.getElementById('totalCarrinho');
  if (totalEl) {
    totalEl.textContent = totalItens;
  }
}

// ===== ABRIR CARRINHO (estava faltando!) =====
function abrirCarrinho() {
  console.log('📦 Abrindo carrinho...');
  console.log('Itens:', carrinho);

  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  // Mostrar resumo do carrinho
  let resumo = 'Itens no carrinho:\n\n';
  let total = 0;

  carrinho.forEach(item => {
    const subtotal = item.preco * item.quantidade;
    resumo += `${item.nome} x${item.quantidade} = R$ ${subtotal.toFixed(2)}\n`;
    total += subtotal;
  });

  resumo += `\n---\nTOTAL: R$ ${total.toFixed(2)}`;
  alert(resumo);

  // Redirecionar para checkout
  window.location.href = '/checkout.html';
}

// ===== FINALIZAR PEDIDO =====
async function finalizarPedido() {
  console.log('🛒 Finalizando pedido...');

  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('Você precisa estar logado para fazer um pedido.');
    window.location.href = '/index.html';
    return;
  }

  const enderecoId = document.getElementById('enderecoId')?.value;
  const formaPagamento = document.getElementById('formaPagamento')?.value || 'credito';

  if (!enderecoId) {
    alert('Por favor, selecione um endereço de entrega.');
    return;
  }

  const pedidoData = {
    endereco_id: parseInt(enderecoId),
    forma_pagamento: formaPagamento,
    itens: carrinho.map(item => ({
      cafe_id: item.id,
      quantidade: item.quantidade,
      preco: item.preco
    }))
  };

  console.log('📝 Dados do pedido:', pedidoData);

  try {
    const response = await fetch('/api/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(pedidoData)
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert('Sua sessão expirou. Faça login novamente.');
        localStorage.removeItem('authToken');
        window.location.href = '/index.html';
        return;
      }
      const errorData = await response.json();
      alert('Erro ao criar pedido: ' + errorData.error);
      return;
    }

    const result = await response.json();
    console.log('✅ Pedido criado:', result);

    alert(`Pedido #${result.pedido_id} criado com sucesso!\nTotal: R$ ${result.total.toFixed(2)}`);
    
    carrinho = [];
    salvarCarrinho();
    atualizarTotalCarrinho();
    window.location.href = '/index.html';
  } catch (error) {
    console.error('❌ Erro ao finalizar pedido:', error);
    alert('Erro ao criar pedido: ' + error.message);
  }
}

// ===== REMOVER DO CARRINHO =====
function removerDoCarrinho(id) {
  carrinho = carrinho.filter(item => item.id !== id);
  salvarCarrinho();
  atualizarTotalCarrinho();
}

// ===== LIMPAR CARRINHO =====
function limparCarrinho() {
  if (confirm('Tem certeza que deseja limpar o carrinho?')) {
    carrinho = [];
    salvarCarrinho();
    atualizarTotalCarrinho();
    alert('Carrinho limpo!');
  }
}
