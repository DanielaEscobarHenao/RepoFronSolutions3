
const signupBtn = document.getElementById("signInBtn"); 
signupBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const userValue = document.getElementById("username").value.trim();
    const passValue = document.getElementById("password").value.trim();

    if (!userValue || !passValue) {
        alert("Debes completar todos los campos requeridos");
        return;
    }

    // Obtener usuarios del localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Verificar si el usuario ya existe con anterioridad
    if (users.find(u => u.username === userValue)) {
        alert("El usuario ya existe.");
        return;
    }

    // Crear un nuevo usuario
    const newUser = { username: userValue, password: passValue, role: "Estudiante" };

    // Guardar en localStorage
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registro exitoso, ya puedes iniciar sesión.");
    window.location.href = "./login.html"; 
});

