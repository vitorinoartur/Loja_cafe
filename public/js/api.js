// public/js/api.js
// Funções para comunicar com o servidor backend

const API_BASE_URL = 'http://localhost:3000/api';
let authToken = null;

// ===== LOGIN =====
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('authToken', data.token);
      return { success: true, data };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== LOGOUT =====
function logout() {
  authToken = null;
  localStorage.removeItem('authToken');
}

// ===== GET TOKEN =====
function getToken() {
  return authToken || localStorage.getItem('authToken');
}

// ===== LISTAR CAFÉS =====
async function getCafes() {
  try {
    const response = await fetch(`${API_BASE_URL}/cafes`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Erro ao buscar cafés:', error);
  }
  return [];
}

// ===== GET CAFÉ POR ID =====
async function getCafeById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/cafes/${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Erro ao buscar café:', error);
  }
  return null;
}

// ===== CRIAR CAFÉ =====
async function criarCafe(cafe) {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, error: 'Não autenticado' };
    }

    const response = await fetch(`${API_BASE_URL}/cafes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cafe)
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== ATUALIZAR CAFÉ =====
async function atualizarCafe(id, cafe) {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, error: 'Não autenticado' };
    }

    const response = await fetch(`${API_BASE_URL}/cafes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cafe)
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== DELETAR CAFÉ =====
async function deletarCafe(id) {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, error: 'Não autenticado' };
    }

    const response = await fetch(`${API_BASE_URL}/cafes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}