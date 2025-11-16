// public/js/admin.js

let cafesAdmin = [];
let cafeEditando = null;

// Função para login
async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();

  if (response.ok) {
    return { success: true, data };
  } else {
    return { success: false, error: data.error };
  }
}

// Função chamada ao submeter o formulário de login
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const result = await login(username, password);

  if (result.success) {
    localStorage.setItem('authToken', result.data.token); // Salva token JWT
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    carregarCafes();
    carregarDashboard();
  } else {
    document.getElementById('loginError').textContent = result.error || 'Erro ao fazer login';
  }
}

// Função para logout
function logout() {
  if (confirm('Tem certeza que deseja sair?')) {
    localStorage.removeItem('authToken');
    location.reload();
  }
}

// Mostrar a seção ativa no painel admin
function showSection(sectionId) {
  // Remove a classe active de todas as seções e dos itens do menu
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

  // Adiciona classe active na seção selecionada
  document.getElementById(sectionId).classList.add('active');
  
  // Destaque o botão correspondente no menu pelo id
  const btn = document.getElementById(sectionId + '-btn');
  if (btn) {
    btn.classList.add('active');
  }
}

// Carregar dashboard com estatísticas
async function carregarDashboard() {
  cafesAdmin = await getCafes();

  const totalCafes = cafesAdmin.length;
  const cafeForte = cafesAdmin.filter(c => c.categoria === 'Forte').length;
  const cafePremium = cafesAdmin.filter(c => c.categoria === 'Premium').length;
  const cafeSuave = cafesAdmin.filter(c => c.categoria === 'Suave').length;

  document.getElementById('totalCafes').textContent = totalCafes;
  document.getElementById('cafeForte').textContent = cafeForte;
  document.getElementById('cafePremium').textContent = cafePremium;
  document.getElementById('cafeSuave').textContent = cafeSuave;
}

// Buscar token JWT armazenado
function getToken() {
  return localStorage.getItem('authToken');
}

// Carregar cafés na tabela de gerenciamento
async function carregarCafes() {
  cafesAdmin = await getCafes();
  const tbody = document.getElementById('tabelaBody');
  tbody.innerHTML = '';

  cafesAdmin.forEach(cafe => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cafe.id}</td>
      <td>${cafe.nome}</td>
      <td>${cafe.categoria}</td>
      <td>R$ ${Number(cafe.preco).toFixed(2)}</td>
      <td>
        <button onclick="editarCafe(${cafe.id})">Editar</button>
        <button onclick="deletarCafe(${cafe.id})">Deletar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Função para salvar ou atualizar um café
async function handleSaveCafe(event) {
  event.preventDefault();

  const id = document.getElementById('cafeId').value;
  const cafeData = {
    nome: document.getElementById('nome').value,
    categoria: document.getElementById('categoria').value,
    descricao: document.getElementById('descricao').value,
    preco: parseFloat(document.getElementById('preco').value),
    imagem: document.getElementById('imagem').value,
    torra: document.getElementById('torra').value,
    intensidade: parseInt(document.getElementById('intensidade').value),
    estoque: parseInt(document.getElementById('estoque').value)
  };

  const token = getToken();

  if (!token) {
    alert('Você precisa estar logado para salvar um café.');
    window.location.href = 'admin.html';
    return;
  }

  let url = '/api/cafes';
  let method = 'POST';

  if (id) {
    url += `/${id}`;
    method = 'PUT';
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cafeData)
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert('Sua sessão expirou, faça login novamente.');
        localStorage.removeItem('authToken');
        window.location.href = 'admin.html';
      } else {
        const errorData = await response.json();
        alert('Erro ao salvar café: ' + errorData.error);
      }
      return;
    }

    alert('Café salvo com sucesso!');
    resetForm();
    carregarCafes();
    // Comente showSection se quiser permanecer no formulário
    // showSection('gerenciar');
  } catch (error) {
    alert('Erro inesperado: ' + error.message);
  }
}

// Função para editar um café (carregar dados no formulário)
async function editarCafe(id) {
  const token = getToken();
  if (!token) {
    alert('Você precisa estar logado para editar um café.');
    window.location.href = 'admin.html';
    return;
  }

  try {
    const response = await fetch(`/api/cafes/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      alert('Erro ao buscar dados do café para edição.');
      return;
    }

    const cafe = await response.json();

    document.getElementById('cafeId').value = cafe.id;
    document.getElementById('nome').value = cafe.nome;
    document.getElementById('categoria').value = cafe.categoria;
    document.getElementById('descricao').value = cafe.descricao;
    document.getElementById('preco').value = cafe.preco;
    document.getElementById('imagem').value = cafe.imagem;
    document.getElementById('torra').value = cafe.torra;
    document.getElementById('intensidade').value = cafe.intensidade;
    document.getElementById('estoque').value = cafe.estoque;

    showSection('adicionar');
  } catch (error) {
    alert('Erro inesperado: ' + error.message);
  }
}

// Função para deletar um café
async function deletarCafe(id) {
  if (!confirm('Tem certeza que deseja deletar este café?')) {
    return;
  }

  const token = getToken();
  if (!token) {
    alert('Você precisa estar logado para deletar um café.');
    window.location.href = 'admin.html';
    return;
  }

  try {
    const response = await fetch(`/api/cafes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erro ao deletar café: ' + errorData.error);
      return;
    }

    alert('Café deletado com sucesso!');
    carregarCafes();
  } catch (error) {
    alert('Erro inesperado: ' + error.message);
  }
}

// Função para resetar o formulário
function resetForm() {
  document.getElementById('formCafe').reset();
  document.getElementById('cafeId').value = '';
}
