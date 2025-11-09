// CLASE CITA
class Cita {
    constructor(id, fecha, hora, nombre, apellidos, dni, telefono, fechaNacimiento, observaciones) {
        this.id = id;
        this.fecha = fecha;
        this.hora = hora;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dni = dni;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.observaciones = observaciones;
    }
}

// VARIABLES
const formulario = document.getElementById("cita-form");
const tablaCitas = document.getElementById("tabla-citas").querySelector("tbody");
let citas = []; // array de citas donde se almacenarán
let citaEditando = null; // mientras no editemos ninguna cita, esta variable se mantiene null

// FUNCIONES
function limpiarErrores() {
    // elimina los bordes rojos de los errores y los limpa antes de validar de nuevo para que no se acumulen
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    document.querySelectorAll(".mensaje-error").forEach(el => el.remove());
}

// añade el borde rojo a modo de error
function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;
    campo.classList.add("input-error");

    if (!campo.nextElementSibling || !campo.nextElementSibling.classList.contains("mensaje-error")) {
        const span = document.createElement("div"); // crea un div con un mensaje si no lo ha creado ya así evita que se dupliquen
        span.classList.add("mensaje-error");
        span.textContent = mensaje;
        campo.insertAdjacentElement("afterend", span);
    }
}

// limpiamos todos los errores primero
// se recibe "datos" con la información del formulario, si alguno falla llama a mostrarError
function validarFormulario(datos) {
    let esValido = true;
    limpiarErrores();

    if (!datos.fecha) { mostrarError("fecha", "Debe seleccionar una fecha."); esValido = false; }
    if (!datos.hora) { mostrarError("Hora", "Debe seleccionar una hora."); esValido = false; }
    if (datos.nombre.length < 2) { mostrarError("nombre", "El nombre debe tener al menos 2 caracteres."); esValido = false; }
    if (datos.apellidos.length < 2) { mostrarError("apellidos", "Los apellidos deben tener al menos 2 caracteres."); esValido = false; }

    const dniRegex = /^[0-9]{8}[A-Za-z]$/;
    if (!dniRegex.test(datos.dni)) { mostrarError("dni", "El DNI debe tener 8 números y una letra."); esValido = false; }

    const telRegex = /^[0-9]{9}$/;
    if (!telRegex.test(datos.telefono)) { mostrarError("tel", "El teléfono debe tener 9 dígitos."); esValido = false; }

    if (!datos.fechaNacimiento) { mostrarError("fecha-nacimiento", "Debe seleccionar la fecha de nacimiento."); esValido = false; }

    return esValido;
}

// LOCALSTORAGE
function guardarEnLocalStorage() {
    localStorage.setItem("citas", JSON.stringify(citas)); // convierte el array citas a un JSON y lo guarda en el navegador aunque este se cierre
}

// recupera los datos del JSON y los vuelve a transformar en un array
function cargarDesdeLocalStorage() {
    const citasGuardadas = JSON.parse(localStorage.getItem("citas")); 
    citas = Array.isArray(citasGuardadas) ? citasGuardadas : [];
}

// Ventana emergente de observaciones
const modal = document.getElementById("modal-observaciones");
const modalTexto = document.getElementById("modal-texto");
const cerrarModal = document.getElementById("cerrar-modal");

// abre la ventana emergente con el texto completo
function abrirModal(texto) {
    modalTexto.textContent = texto;
    modal.hidden = false;
}

// si se clica en cualquier parte hidden se vuelve true y se oculta
cerrarModal.onclick = () => modal.hidden = true;
window.onclick = (event) => { if(event.target === modal) modal.hidden = true; };


// MOSTRAR CITAS
function mostrarCitas() {
    // limpa la tabla antes de mostrar la cita
    tablaCitas.innerHTML = "";

    // si no hay citas muestra "Dato vacío"
    if(citas.length === 0) {
        const filaVacia = document.createElement("tr");
        filaVacia.id = "dato-vacio";
        filaVacia.innerHTML = `<td colspan="10">Dato vacío</td>`;
        tablaCitas.appendChild(filaVacia);
        return;
    }

    // por cada cita crea un tr con los datos
    citas.forEach((cita,index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${cita.nombre}</td>
            <td>${cita.apellidos}</td>
            <td>${cita.dni}</td>
            <td>${cita.telefono}</td>
            <td>${cita.fecha}</td>
            <td>${cita.hora}</td>
            <td>${cita.fechaNacimiento}</td>
            <td class="observaciones">${cita.observaciones}</td>
            <td>
                <button class="btn-action btn-editar" onclick="editarCita('${cita.id}')">Editar</button>
                <button class="btn-action btn-eliminar" onclick="eliminarCita('${cita.id}')">Eliminar</button>
            </td>
            <td style="display:none;">${cita.id}</td>
        `;
        tablaCitas.appendChild(fila);

        // Mostrar observaciones completas al clicar
        const celdaObs = fila.querySelector(".observaciones");
        celdaObs.addEventListener("click", () => abrirModal(cita.observaciones));
    });
}

// GUARDAR O ACTUALIZAR CITAS
function guardarCita(event) {
    // previene que el formulario recargue la página
    event.preventDefault();

    // asignamos los valores a los campos, los validamos, y eliminamos espacios al principio y final con trim()
    const datos = {
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("Hora").value,
        nombre: document.getElementById("nombre").value.trim(),
        apellidos: document.getElementById("apellidos").value.trim(),
        dni: document.getElementById("dni").value.trim(),
        telefono: document.getElementById("tel").value.trim(),
        fechaNacimiento: document.getElementById("fecha-nacimiento").value,
        observaciones: document.getElementById("Obvservaciones").value.trim()
    };

    if(!validarFormulario(datos)) return;

    // si estamos editando, la cita existente se actualiza
    if(citaEditando) {
        const index = citas.findIndex(c => c.id === citaEditando);
        if(index !== -1) citas[index] = { ...citas[index], ...datos };
        citaEditando = null;
        alert("Cita modificada correctamente");
    } else {
        // si no, crea un objeto cita y le asigna un ID nuevo
        const id = Date.now().toString();
        const nuevaCita = new Cita(id, datos.fecha, datos.hora, datos.nombre, datos.apellidos, datos.dni, datos.telefono, datos.fechaNacimiento, datos.observaciones);
        citas.push(nuevaCita);
        alert("Cita creada correctamente");
    }

    // lo guardamos en LocalStorage, la mostramos y borramos el formulario
    guardarEnLocalStorage();
    mostrarCitas();
    formulario.reset();
}

// ELIMINAR / EDITAR
function eliminarCita(id) {
    if(confirm("¿Seguro que quieres eliminar esta cita?")) {
        citas = citas.filter(c => c.id !== id);
        guardarEnLocalStorage();
        mostrarCitas();
    }
}

// carga los datos en el formulario para editarlos
function editarCita(id) {
    const cita = citas.find(c => c.id === id);
    if(!cita) return alert("Cita no encontrada");

    document.getElementById("fecha").value = cita.fecha;
    document.getElementById("Hora").value = cita.hora;
    document.getElementById("nombre").value = cita.nombre;
    document.getElementById("apellidos").value = cita.apellidos;
    document.getElementById("dni").value = cita.dni;
    document.getElementById("tel").value = cita.telefono;
    document.getElementById("fecha-nacimiento").value = cita.fechaNacimiento;
    document.getElementById("Obvservaciones").value = cita.observaciones;

    citaEditando = id;
    window.scrollTo({ top: 0, behavior: "smooth" }); // lleva el scroll a la parte superior de la pantalla
}

// EVENTOS
formulario.addEventListener("submit", guardarCita);
window.addEventListener("DOMContentLoaded", () => {
    cargarDesdeLocalStorage();
    mostrarCitas();
});
