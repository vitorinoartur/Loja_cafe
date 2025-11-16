// public/js/auth.js
let usuarioLogado = null;
let tokenAuth = null;

document.addEventListener('DOMContentLoaded', () => {
  const tokenSalvo = localStorage.getItem('authToken');
  const usuarioSalvo = localStorage.getItem('usuarioLogado');
  
  if (tokenSalvo && usuarioSalvo) {
    tokenAuth = tokenSalvo;
    usuarioLogado = JSON.parse(usuarioSalvo);
    atualizarBotaoUsuario();
  }
});

function abrirLoginModal() {
  if (usuarioLogado) {
    alert(`Bem-vindo, ${usuarioLogado.username}!`);
    return;
  }
  document.getElementById('modalLogin').style.display = 'block';
  mostrarLogin();
}

function fecharLoginModal() {
  document.getElementById('modalLogin').style.display = 'none';
}

function mostrarLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registroForm').style.display = 'none';
  document.getElementById('loginError').textContent = '';
  document.getElementById('registroError').textContent = '';
}

function mostrarRegistro() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registroForm').style.display = 'block';
  document.getElementById('loginError').textContent = '';
  document.getElementById('registroError').textContent = '';
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('emailLogin').value;
  const senha = document.getElementById('senhaLogin').value;

  try {
    const response = await fetch('/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      tokenAuth = data.token;
      usuarioLogado = data.user;

      localStorage.setItem('authToken', tokenAuth);
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

      fecharLoginModal();
      atualizarBotaoUsuario();
      alert(`Bem-vindo, ${usuarioLogado.username}!`);
    } else {
      document.getElementById('loginError').textContent = data.error || 'Erro ao fazer login';
    }
  } catch (error) {
    document.getElementById('loginError').textContent = 'Erro inesperado: ' + error.message;
  }
}

async function handleRegistro(event) {
  event.preventDefault();

  const username = document.getElementById('usernameRegistro').value;
  const email = document.getElementById('emailRegistro').value;
  const senha = document.getElementById('senhaRegistro').value;
  const telefone = document.getElementById('telefoneRegistro').value;

  if (username.length < 3) {
    document.getElementById('registroError').textContent = 'Username deve ter pelo menos 3 caracteres';
    return;
  }

  if (senha.length < 6) {
    document.getElementById('registroError').textContent = 'Senha deve ter pelo menos 6 caracteres';
    return;
  }

  try {
    const response = await fetch('/api/usuarios/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, senha, telefone })
    });

    const data = await response.json();

    if (response.ok) {
      tokenAuth = data.token;
      usuarioLogado = data.user;

      localStorage.setItem('authToken', tokenAuth);
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

      fecharLoginModal();
      atualizarBotaoUsuario();
      alert(`Bem-vindo, ${usuarioLogado.username}! Sua conta foi criada com sucesso.`);
    } else {
      document.getElementById('registroError').textContent = data.error || 'Erro ao registrar';
    }
  } catch (error) {
    document.getElementById('registroError').textContent = 'Erro inesperado: ' + error.message;
  }
}

function logout() {
  if (confirm('Deseja realmente sair?')) {
    tokenAuth = null;
    usuarioLogado = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuarioLogado');
    atualizarBotaoUsuario();
    alert('Você foi desconectado com sucesso!');
  }
}

function atualizarBotaoUsuario() {
  const btnUsuario = document.getElementById('btnUsuario');
  const btnSair = document.getElementById('btnSair');

  if (usuarioLogado) {
    btnUsuario.style.display = 'none';
    btnSair.style.display = 'block';
    btnSair.textContent = `👤 ${usuarioLogado.username}`;
  } else {
    btnUsuario.style.display = 'block';
    btnSair.style.display = 'none';
  }
}

function verificarLogin() {
  if (!usuarioLogado || !tokenAuth) {
    alert('Você precisa fazer login para continuar.');
    abrirLoginModal();
    return false;
  }
  return true;
}

function getAuthToken() {
  return tokenAuth;
}

function getUsuarioLogado() {
  return usuarioLogado;
}