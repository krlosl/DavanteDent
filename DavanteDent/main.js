//  CLASE CITA 
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

//  VARIABLES 
const formulario = document.getElementById("cita-form");
const tablaCitas = document.getElementById("tabla-citas").querySelector("tbody");
let citas = []; // variable donde almacenaremos las citas
let citaEditando = null; // variable null por defecto, cambiará cuando estemos editando una cita

//  FUNCIONES 
// elimina los bordes rojos de los campos con errores y evita que se acumulen entre si
function limpiarErrores() {
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    document.querySelectorAll(".mensaje-error").forEach(el => el.remove());
}

// cogemos el id de un campo
function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;
    campo.classList.add("input-error"); // ponemos un borde rojo al campo input-error

    if (!campo.nextElementSibling || !campo.nextElementSibling.classList.contains("mensaje-error")) {
        const span = document.createElement("div"); // creamos un div con un mensaje de error debajo si no está creado ya
        span.classList.add("mensaje-error");
        span.textContent = mensaje;
        campo.insertAdjacentElement("afterend", span);
    }
}

// validamos el formulario comprobando que todos los campos tienen datos, si alguno falla, muestra un mensaje de error y devuevle false
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

// convierte el array de las citas en JSON y lo guarda en el navegador, permitiendo que se mantenga aunque el navegador se cierre
function guardarEnLocalStorage() {
    localStorage.setItem("citas", JSON.stringify(citas));
}

// recupera los datos del JSON y los guarda en un array
function cargarDesdeLocalStorage() {
    const citasGuardadas = JSON.parse(localStorage.getItem("citas"));
    citas = Array.isArray(citasGuardadas) ? citasGuardadas : [];
}

// MODAL

// abre la ventana emergente con el texto de las observaciones completo, si se clica en la X o fuera del cuadro, la ventana se cierra
const modal = document.getElementById("modal-observaciones");
const modalTexto = document.getElementById("modal-texto");
const spanCerrar = document.querySelector(".close-modal");

function abrirModal(texto) {
    modalTexto.textContent = texto;
    modal.style.display = "block";
}
// oculta el cuadrado si se clica
spanCerrar.onclick = () => modal.style.display = "none";
window.onclick = event => { if(event.target === modal) modal.style.display = "none"; };

// MOSTRAR CITAS

// limpiamos la tabla de citas
function mostrarCitas() {
    tablaCitas.innerHTML = "";

    if(citas.length === 0) {
        const filaVacia = document.createElement("tr");
        filaVacia.id = "dato-vacio";
        filaVacia.innerHTML = `<td colspan="10">Dato vacío</td>`;
        tablaCitas.appendChild(filaVacia);
        return;
    }

    // para cada elemento de la cita creamos un tr
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

        // evento modal, si clicamos, se abre la ventana modal
        const celdaObs = fila.querySelector(".observaciones");
        celdaObs.addEventListener("click", () => abrirModal(cita.observaciones));
    });
}

// GUARDAR CITAS
function guardarCita(event) {
    event.preventDefault();

    // tomamos los datos del formulario y lo validamos
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

    // si estmaos editando se actualiza la cita existente y si es nueva, crea un id
    if(citaEditando) {
        const index = citas.findIndex(c => c.id === citaEditando);
        if(index !== -1) citas[index] = { ...citas[index], ...datos };
        citaEditando = null;
        alert("Cita modificada correctamente");
    } else {
        const id = Date.now().toString();
        const nuevaCita = new Cita(id, datos.fecha, datos.hora, datos.nombre, datos.apellidos, datos.dni, datos.telefono, datos.fechaNacimiento, datos.observaciones);
        citas.push(nuevaCita);
        alert("Cita creada correctamente");
    }

    // guardamos la cita en LocalStorage y la mostramos en la tabla
    guardarEnLocalStorage();
    mostrarCitas();
    formulario.reset();
}

// ELIMINAR / EDITAR
// recorremos el array y eliminamos la cita que coincida 
function eliminarCita(id) {
    if(confirm("¿Seguro que quieres eliminar esta cita?")) {
        citas = citas.filter(c => c.id !== id);
        guardarEnLocalStorage();
        mostrarCitas();
    }
}

// editamos la cita cogiendo los datos de cada campo
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

    // subimos el formulario a la parte superior de la pantalla
    citaEditando = id;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// al enviar el formulario se ejecuta guardar cita, la cargamos desde el localStorage y la mostramoss
formulario.addEventListener("submit", guardarCita);
window.addEventListener("DOMContentLoaded", () => {
    cargarDesdeLocalStorage();
    mostrarCitas();
});