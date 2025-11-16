// public/js/app.js
let cafes = [];
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let filtroAtual = 'Todos';
let enderecosSelecionado = null;

document.addEventListener('DOMContentLoaded', async () => {
  cafes = await getCafes();
  renderizarProdutos(cafes);
  atualizarTotalCarrinho();
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

function filtrarPorCategoria(categoria) {
  filtroAtual = categoria;

  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

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

function abrirCarrinho() {
  const modal = document.getElementById('modalCarrinho');
  const itensDiv = document.getElementById('itensCarrinho');
  const totalDiv = document.getElementById('totalPrice');

  itensDiv.innerHTML = '';

  if (carrinho.length === 0) {
    itensDiv.innerHTML = '<p style="text-align: center; color: #999;">Carrinho vazio</p>';
    totalDiv.textContent = '0.00';
  } else {
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
  }

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

async function carregarEnderecos() {
  try {
    const response = await fetch('/api/enderecos', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      console.error('Erro ao carregar endereços');
      return;
    }

    const enderecos = await response.json();
    const listaDiv = document.getElementById('listaEnderecos');
    listaDiv.innerHTML = '';

    if (enderecos.length === 0) {
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
  document.querySelectorAll('.endereco-item').forEach(el => {
    el.classList.remove('selecionado');
  });
  elemento.classList.add('selecionado');
  enderecosSelecionado = id;
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
      
      // Limpar campos do formulário individualmente
      document.getElementById('cep').value = '';
      document.getElementById('rua').value = '';
      document.getElementById('numero').value = '';
      document.getElementById('complemento').value = '';
      document.getElementById('bairro').value = '';
      document.getElementById('cidade').value = '';
      document.getElementById('estado').value = '';
      
      esconderFormEndereco();
      await carregarEnderecos();
    } else {
      const errorData = await response.json();
      alert('Erro ao salvar endereço: ' + (errorData.error || 'Erro desconhecido'));
    }
  } catch (error) {
    console.error('Erro ao salvar endereço:', error);
    alert('Erro inesperado: ' + error.message);
  }
}

async function finalizarPedido() {
  if (!enderecosSelecionado) {
    alert('Selecione um endereço de entrega!');
    return;
  }

  const formaPagamento = document.querySelector('input[name="pagamento"]:checked').value;
  
  const nomeCartao = document.getElementById('nomeCartao').value;
  const numeroCartao = document.getElementById('numeroCartao').value;
  const validadeCartao = document.getElementById('validadeCartao').value;
  const cvvCartao = document.getElementById('cvvCartao').value;

  if (!nomeCartao || !numeroCartao || !validadeCartao || !cvvCartao) {
    alert('Preencha todos os dados do cartão!');
    return;
  }

  if (numeroCartao.length !== 16) {
    alert('Número do cartão inválido! Deve ter 16 dígitos.');
    return;
  }

  if (cvvCartao.length !== 3) {
    alert('CVV inválido! Deve ter 3 dígitos.');
    return;
  }

  try {
    const pedido = {
      endereco_id: enderecosSelecionado,
      forma_pagamento: formaPagamento,
      itens: carrinho
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
      alert(`Pedido realizado com sucesso!\nPedido #${data.pedido_id}\nTotal: R$ ${data.total.toFixed(2)}`);
      
      carrinho = [];
      salvarCarrinho();
      atualizarTotalCarrinho();
      fecharCheckout();
      
      // Limpar formulário de endereço
      document.getElementById('cep').value = '';
      document.getElementById('rua').value = '';
      document.getElementById('numero').value = '';
      document.getElementById('complemento').value = '';
      document.getElementById('bairro').value = '';
      document.getElementById('cidade').value = '';
      document.getElementById('estado').value = '';
      
      // Limpar formulário de pagamento
      document.getElementById('nomeCartao').value = '';
      document.getElementById('numeroCartao').value = '';
      document.getElementById('validadeCartao').value = '';
      document.getElementById('cvvCartao').value = '';
      
      esconderFormEndereco();
    } else {
      alert('Erro ao finalizar pedido: ' + data.error);
    }
  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
    alert('Erro inesperado: ' + error.message);
  }
}

window.onclick = function(event) {
  const modalCarrinho = document.getElementById('modalCarrinho');
  const modalLogin = document.getElementById('modalLogin');
  const modalCheckout = document.getElementById('modalCheckout');

  if (event.target === modalCarrinho) {
    modalCarrinho.style.display = 'none';
  }
  if (event.target === modalLogin) {
    modalLogin.style.display = 'none';
  }
  if (event.target === modalCheckout) {
    modalCheckout.style.display = 'none';
  }
}