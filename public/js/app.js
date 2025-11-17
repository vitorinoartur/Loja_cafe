let cafes = [];
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let filtroAtual = 'Todos';
let enderecoSelecionado = null;

// -------- AJAX CAFÉS -----------
async function getCafes() {
  const response = await fetch('/api/cafes');
  return response.ok ? await response.json() : [];
}

document.addEventListener('DOMContentLoaded', async () => {
  cafes = await getCafes();
  renderizarProdutos(cafes);
  atualizarTotalCarrinho();
});

// -------- RENDER E FILTRO ---------
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
  document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
  if (event) event.target.classList.add('active');
  renderizarProdutos(categoria === 'Todos' ? cafes : cafes.filter(c => c.categoria === categoria));
}

// -------- CARRINHO ---------
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

// -------- MODAL CARRINHO E CHECKOUT ---------
function abrirCarrinho() {
  const modal = document.getElementById('modalCarrinho');
  const itensDiv = document.getElementById('itensCarrinho');
  const totalDiv = document.getElementById('totalPrice');
  itensDiv.innerHTML = '';
  if (carrinho.length === 0) {
    itensDiv.innerHTML = '<p style="text-align: center; color: #999;">Carrinho vazio</p>';
    totalDiv.textContent = '0.00';
    modal.style.display = 'block';
    return;
  }
  let total = 0;
  carrinho.forEach((item, index) => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-carrinho';
    itemDiv.innerHTML = `
      <div class="item-info">
        <div class="item-nome">${item.nome}</div>
        <div class="item-quantidade">Quantidade: ${item.quantidade}</div>
      </div>
      <div class="item-preco">R$ ${subtotal.toFixed(2)}</div>
      <button class="item-remove" onclick="removerDoCarrinho(${index})">❌</button>
    `;
    itensDiv.appendChild(itemDiv);
  });
  totalDiv.textContent = total.toFixed(2);
  modal.style.display = 'block';
}

function fecharCarrinho() {
  document.getElementById('modalCarrinho').style.display = 'none';
}

function removerDoCarrinho(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarTotalCarrinho();
  abrirCarrinho();
}

// ---- Checkout -----
function irParaCheckout() {
  if (!verificarLogin()) {
    return;
  }
  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }
  fecharCarrinho();
  abrirCheckout();
}

async function abrirCheckout() {
  const modal = document.getElementById('modalCheckout');
  modal.style.display = 'block';
  await carregarEnderecos();
}

function fecharCheckout() {
  document.getElementById('modalCheckout').style.display = 'none';
}

// --- Endereços ---
async function carregarEnderecos() {
  try {
    const response = await fetch('/api/enderecos', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    const listaDiv = document.getElementById('listaEnderecos');
    listaDiv.innerHTML = '';
    if (!response.ok) {
      listaDiv.innerHTML = '<p style="color: #999;">Erro ao carregar endereços</p>';
      return;
    }
    const enderecos = await response.json();
    if (!enderecos.length) {
      listaDiv.innerHTML = '<p style="color: #999;">Nenhum endereço cadastrado</p>';
    } else {
      enderecos.forEach(endereco => {
        const enderecoDiv = document.createElement('div');
        enderecoDiv.className = 'endereco-item';
        enderecoDiv.innerHTML = `
          <strong>${endereco.rua}, ${endereco.numero}</strong><br>
          ${endereco.bairro} - ${endereco.cidade}, ${endereco.estado}
        `;
        enderecoDiv.onclick = () => selecionarEndereco(endereco.id, enderecoDiv);
        listaDiv.appendChild(enderecoDiv);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar endereços:', error);
  }
}

function selecionarEndereco(id, elemento) {
  document.querySelectorAll('.endereco-item').forEach(el => el.classList.remove('selecionado'));
  elemento.classList.add('selecionado');
  enderecoSelecionado = id;
}

function mostrarFormEndereco() {
  document.getElementById('formNovoEndereco').style.display = 'block';
}

function esconderFormEndereco() {
  document.getElementById('formNovoEndereco').style.display = 'none';
}

async function handleSalvarEndereco(event) {
  event.preventDefault();
  const endereco = {
    cep: document.getElementById('cep').value,
    rua: document.getElementById('rua').value,
    numero: document.getElementById('numero').value,
    complemento: document.getElementById('complemento').value,
    bairro: document.getElementById('bairro').value,
    cidade: document.getElementById('cidade').value,
    estado: document.getElementById('estado').value
  };
  try {
    const response = await fetch('/api/enderecos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(endereco)
    });
    if (response.ok) {
      alert('Endereço salvo com sucesso!');
      document.getElementById('formNovoEndereco').reset();
      esconderFormEndereco();
      await carregarEnderecos();
    } else {
      const errorData = await response.json();
      alert('Erro ao salvar endereço: ' + (errorData.error || 'Erro desconhecido'));
    }
  } catch (error) {
    alert('Erro inesperado: ' + error.message);
  }
}

// ---- Finalizar Pedido ----
async function finalizarPedido() {
  if (!enderecoSelecionado) {
    alert('Selecione um endereço de entrega!');
    return;
  }
  try {
    const pedido = {
      endereco_id: enderecoSelecionado,
      forma_pagamento: document.querySelector('input[name="pagamento"]:checked').value || 'credito',
      itens: carrinho.map(item => ({
        cafe_id: item.id,
        quantidade: item.quantidade,
        preco: item.preco
      }))
    };
    const response = await fetch('/api/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(pedido)
    });
    const data = await response.json();
    if (response.ok) {
      alert(`Pedido realizado!\n#${data.pedido_id}\nTotal: R$ ${data.total.toFixed(2)}`);
      carrinho = [];
      salvarCarrinho();
      atualizarTotalCarrinho();
      fecharCheckout();
    } else {
      alert('Erro ao finalizar pedido: ' + data.error);
    }
  } catch (error) {
    alert('Erro inesperado: ' + error.message);
  }
}

// -------- UTIL ---------
function getAuthToken() {
  return localStorage.getItem('authToken');
}

function verificarLogin() {
  if (!getAuthToken()) {
    alert('Faça login para finalizar seu pedido.');
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

// Fechar modais ao clicar fora
window.onclick = function(event) {
  ['modalCarrinho','modalLogin','modalCheckout'].forEach(id=>{
    const modal = document.getElementById(id);
    if (event.target === modal) modal.style.display = 'none';
  });
};
