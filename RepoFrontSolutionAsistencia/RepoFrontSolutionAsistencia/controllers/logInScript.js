// Seleccionar elementos del DOM
const loginBtn = document.getElementById("loginBtn");
const username = document.getElementById("username");
const password = document.getElementById("password");

// Inicializar usuarios en localStorage si no existen
function initializeUsers() {
  const users = localStorage.getItem('users');
  if (!users) {
    // Crear usuarios por defecto
    const defaultUsers = [
      { username: 'admin', password: 'admin123', role: 'Administrador' },
      { username: 'docente1', password: 'docente123', role: 'Docente' },
      { username: 'Estudiante', password: 'Estudiante123', role: 'Estudiante' }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    console.log('Usuarios inicializados en localStorage');
  }
}

// Validar credenciales
function validateLogin(user, pass) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.find(u => u.username === user && u.password === pass);
}

// Inicializar usuarios al cargar la página
initializeUsers();

// Evento del botón de login
loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  
  const userValue = username.value.trim();
  const passValue = password.value.trim();

  // Validación de campos vacíos
  if (userValue === "" || passValue === "") {
    alert("Por favor, completa todos los campos.");
    return;
  }

  // Validar credenciales
  const validUser = validateLogin(userValue, passValue);
  
  if (validUser) {
    // Guardar sesión actual
    const session = {
      username: validUser.username,
      role: validUser.role,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('currentSession', JSON.stringify(session));
    
    // Confirmación visual
    loginBtn.innerText = "Ingresando...";
    loginBtn.classList.remove("btn-primary");
    loginBtn.classList.add("btn-success");
    loginBtn.disabled = true;
    
    // Redireccionar después de 1 segundo
    setTimeout(() => {
      window.location.href = "./tablaRegistro.html";
    }, 1000);
    
  } else {
    // Credenciales incorrectas
    alert("Usuario o contraseña incorrectos. \n\nUsuarios de prueba:\n- admin / admin123\n- docente1 / docente123\n- Estudiante / Estudiante123");
    
    // Limpiar campos
    password.value = "";
    password.focus();
  }
});

// Permitir login con tecla Enter
password.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    loginBtn.click();
  }
});

username.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    password.focus();
  }
});