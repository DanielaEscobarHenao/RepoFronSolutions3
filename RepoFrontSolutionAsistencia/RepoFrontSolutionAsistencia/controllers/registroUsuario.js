const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const userValue = document.getElementById("username").value.trim();
    const emailValue = document.getElementById("email").value.trim();
    const passValue = document.getElementById("password").value.trim();
    const roleValue = document.getElementById("role").value;

    if (!userValue || !passValue || !emailValue || !roleValue) {
        alert("Debes completar todos los campos requeridos.");
        return;
    }

    // Validar formato de correo
    if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
        alert("Por favor, introduce un correo electrónico válido.");
        return;
    }

    // Obtener usuarios del localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Verificar si el usuario o el correo ya existen
    if (users.find(u => u.username === userValue)) {
        alert("El nombre de usuario ya existe.");
        return;
    }
    if (users.find(u => u.email === emailValue)) {
        alert("El correo electrónico ya está registrado.");
        return;
    }

    // Crear un nuevo usuario
    const newUser = {
        id: Date.now(),
        username: userValue,
        password: passValue,
        email: emailValue,
        role: roleValue
    };

    if (roleValue === 'Estudiante') {
        const materiaValue = document.getElementById('materia').value;
        if (!materiaValue) {
            alert('Si eres estudiante, debes seleccionar una materia y un grupo.');
            return;
        }
        newUser.materia = materiaValue;

        const grupoValue = document.getElementById('grupo').value;
        if (!grupoValue) {
            alert('Si eres estudiante, debes seleccionar una materia y un grupo.');
            return;
        }
        newUser.group = grupoValue;
    }

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
    window.location.href = "./logIn.html";
});