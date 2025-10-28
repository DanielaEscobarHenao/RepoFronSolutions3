//Necesito controlar el formulario del documento

let tituloFormulario=document.getElementById("tituloFormulario")
let nombreUsuario=document.getElementById("nombreUsuario")
let contraseñaUsuario=document.getElementById("contraseñaUsuario")
let botonFormulario=document.getElementById("botonFormulario")

//Necesito activar el control segun las interacciones del usuario
botonFormulario.addEventListener("click",function(evento){
    evento.preventDefault()
    //Capturar datos desde el formulario
    let nombreRecibido=nombreUsuario.value
    let contraseñaRecibida=contraseñaUsuario.value

    //validando los datos
    if(nombreRecibido==""||nombreRecibido=="juan"){
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Revisa el nombre ingresado",
        });
    }else if(contraseñaRecibida==""){
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Revisa la contraseña ingresado",
        });

    }
    //construyendo un JSON
    let envioDatos={
        nombre:nombreRecibido,
        contraseña:contraseñaRecibida
    }
})



