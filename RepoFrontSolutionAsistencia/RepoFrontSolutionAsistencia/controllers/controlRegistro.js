
//Local storage
let currentSessionData = null;

function checkSession() {
  const session = localStorage.getItem('currentSession');
  if (!session) {
    alert('Debes iniciar sesión para acceder a esta página');
    window.location.href = './logIn.html';
    return false;
  }
  
  currentSessionData = JSON.parse(session);
  console.log('Usuario actual:', currentSessionData.username, 'Rol:', currentSessionData.role);
  return true;
}

// Verificar sesión al inicio
if (!checkSession()) {
  throw new Error('Sesión no es válida');
}

// Cargar TODOS los usuarios desde localStorage como la única fuente de verdad.
let allUsers = JSON.parse(localStorage.getItem("users") || "[]");

// Filtrar para obtener solo los estudiantes. Esta será nuestra lista de trabajo.
// Mapeamos para que coincida con la estructura anterior (name, group, etc.)
let students = allUsers
  .filter(user => user.role === 'Estudiante')
  .map(user => ({ ...user, name: user.username, group: user.group || 'Sin Grupo' }));

// Manejo del local Store para asistencia
let hasUnsavedChanges = false; // Cambios sin guardar

// Obtener la clave de localStorage 

function getStorageKey() {
  const materia = document.getElementById('materiaSelect').value;
  const grupo = document.getElementById('grupoSelect').value;
  const fecha = document.getElementById('fechaInput').value || 'sin-fecha';
  return `attendance ${materia},${grupo},${fecha}`;
}

// Cargar estados de asistencia desde localStorage
function loadAttendanceFromStorage() {
  const key = getStorageKey();
  const saved = localStorage.getItem(key);
  if (saved) {
    const data = JSON.parse(saved);
    console.log('Asistencia cargada correctamente', key);
    return data;
  }
  return {};
}

// Guardar estados de asistencia en localStorage
function saveAttendanceToStorage(attendanceStates) {
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(attendanceStates));
  console.log('Asistencia guardada', key);
  hasUnsavedChanges = false;
  updateActionButtons();
}

// Borrar asistencia del localStorage
function deleteAttendanceFromStorage() {
  const key = getStorageKey();
  localStorage.removeItem(key);
  console.log('Asistencia eliminada', key);
}

// Estado de asistencia desde localStorage
let attendanceStates = loadAttendanceFromStorage();

// Inicializar estados para estudiantes sin registro
students.forEach(s => {
  if (!attendanceStates[s.id]) {
    attendanceStates[s.id] = 'No registrado';
  }
});

// DOM
const tbody = document.getElementById('studentsTbody');
const searchInput = document.getElementById('searchInput');
const filterForm = document.getElementById('filterForm');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');

// Crear Actualizar, Deshacer, eliminar)
function createActionButtons() {
  const filterBox = document.querySelector('.filter-box');
  
  const actionContainer = document.createElement('div');
  actionContainer.style.cssText = `
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  `;
  
  //Actualizar
  const saveButton = document.createElement('button');
  saveButton.id = 'saveButton';
  saveButton.type = 'button';
  saveButton.innerHTML = 'Actualizar';
  saveButton.style.cssText = `
    background-color: #10b981;
    color: white;
    padding: 0.7rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  
  //Botón ndeshacer
  const undoButton = document.createElement('button');
  undoButton.id = 'undoButton';
  undoButton.type = 'button';
  undoButton.innerHTML = 'Deshacer Cambios';
  undoButton.style.cssText = `
    background-color: #f59e0b;
    color: white;
    padding: 0.7rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  
  // Botón borrar registro
  const deleteButton = document.createElement('button');
  deleteButton.id = 'deleteButton';
  deleteButton.type = 'button';
  deleteButton.innerHTML = 'Eliminar Registro';
  deleteButton.style.cssText = `
    background-color: #ef4444;
    color: white;
    padding: 0.7rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  

  // Mensajes de los estados
  const statusMessage = document.createElement('span');
  statusMessage.id = 'statusMessage';
  statusMessage.style.cssText = `
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  `;
  
  // Eventos de escuchar
  saveButton.addEventListener('click', handleSaveChanges);
  undoButton.addEventListener('click', handleUndoChanges);
  deleteButton.addEventListener('click', handleDeleteRecord);
  
  // eveftos hover
  [saveButton, undoButton, deleteButton].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (!btn.disabled) {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });
  });
  
  actionContainer.appendChild(saveButton);
  actionContainer.appendChild(undoButton);
  actionContainer.appendChild(deleteButton);
  actionContainer.appendChild(statusMessage);
  filterBox.appendChild(actionContainer);
}

// Actualizar el estado de los botones
function updateActionButtons() {
  const saveButton = document.getElementById('saveButton');
  const undoButton = document.getElementById('undoButton');
  const deleteButton = document.getElementById('deleteButton');
  const statusMessage = document.getElementById('statusMessage');
  
  if (!saveButton) return;
  
  // Estado del botón Gactualizar
  if (hasUnsavedChanges) {
    saveButton.style.backgroundColor = '#10b981';
    saveButton.disabled = false;
    saveButton.style.opacity = '1';
    undoButton.style.backgroundColor = '#f59e0b';
    undoButton.disabled = false;
    undoButton.style.opacity = '1';
    statusMessage.textContent = 'Hay cambios sin guardar';
    statusMessage.style.color = '#f59e0b';
  } else {
    saveButton.style.backgroundColor = '#9ca3af';
    saveButton.disabled = true;
    saveButton.style.opacity = '0.6';
    undoButton.style.backgroundColor = '#9ca3af';
    undoButton.disabled = true;
    undoButton.style.opacity = '0.6';
    statusMessage.textContent = 'Cambios guardados';
    statusMessage.style.color = '#10b981';
  }
  
  // Estado del botón eliminar
  const hasStoredData = localStorage.getItem(getStorageKey()) !== null;
  if (hasStoredData) {
    deleteButton.style.backgroundColor = '#ef4444';
    deleteButton.disabled = false;
    deleteButton.style.opacity = '1';
  } else {
    deleteButton.style.backgroundColor = '#9ca3af';
    deleteButton.disabled = true;
    deleteButton.style.opacity = '0.6';
  }
}

// Guardar cambios
function handleSaveChanges() {
  const saveButton = document.getElementById('saveButton');
  const statusMessage = document.getElementById('statusMessage');
  
  saveButton.innerHTML = 'Guardando...';
  saveButton.disabled = true;
  
  setTimeout(() => {
    saveAttendanceToStorage(attendanceStates);
    
    saveButton.innerHTML = 'Guardado';
    saveButton.style.backgroundColor = '#059669';
    statusMessage.textContent = 'Cambios guardados';
    statusMessage.style.color = '#10b981';
    
    setTimeout(() => {
      saveButton.innerHTML = 'Guardar Cambios';
      updateActionButtons();
    }, 2000);
  }, 500);
}

// Deshacer cambios

function handleUndoChanges() {
  if (!confirm('¿Deseas deshacer todos los cambios no guardados? Esta acción restaurará los datos del último guardado.')) {
    return;
  }
  
  const undoButton = document.getElementById('undoButton');
  const statusMessage = document.getElementById('statusMessage');
  
  undoButton.innerHTML = 'Restaurando...';
  undoButton.disabled = true;
  
  setTimeout(() => {
    // Recargar desde localStorage
    attendanceStates = loadAttendanceFromStorage();
    
    // Reinicializar estados
    students.forEach(s => {
      if (!attendanceStates[s.id]) {
        attendanceStates[s.id] = 'No registrado';
      }
    });
    
    hasUnsavedChanges = false;
    renderTable(getCurrentFilters());
    
    undoButton.innerHTML = '✓ Restaurado';
    undoButton.style.backgroundColor = '#059669';
    statusMessage.textContent = 'Cambios restaurados';
    statusMessage.style.color = '#10b981';
    
    setTimeout(() => {
      undoButton.innerHTML = 'Deshacer Cambios';
      updateActionButtons();
    }, 2000);
  }, 500);
}

// Borrar registro
function handleDeleteRecord() {
  const materia = document.getElementById('materiaSelect').value;
  const grupo = document.getElementById('grupoSelect').value;
  const fecha = document.getElementById('fechaInput').value || 'sin-fecha';
  
  if (!confirm(`¿Estás seguro?\n\nEsto eliminará permanentemente el registro de asistencia de:\n• Materia: ${materia}\n• Grupo: ${grupo}\n• Fecha: ${fecha}\n\nEsta acción NO se puede deshacer.`)) {
    return;
  }
  
  const deleteButton = document.getElementById('deleteButton');
  const statusMessage = document.getElementById('statusMessage');
  
  deleteButton.innerHTML = 'Eliminando...';
  deleteButton.disabled = true;
  
  setTimeout(() => {
    // Borrar del localStorage
    deleteAttendanceFromStorage();
    
    // Reiniciar estados a "No registrado"
    students.forEach(s => {
      attendanceStates[s.id] = 'No registrado';
    });
    
    hasUnsavedChanges = false;
    renderTable(getCurrentFilters());
    
    deleteButton.innerHTML = '✓ Eliminado';
    deleteButton.style.backgroundColor = '#7f1d1d';
    statusMessage.textContent = 'Registro eliminado permanentemente';
    statusMessage.style.color = '#ef4444';
    
    setTimeout(() => {
      deleteButton.innerHTML = 'Borrar Registro';
      updateActionButtons();
    }, 2000);
  }, 500);
}

// Crear vaina alfabética

const filterRow = filterForm.querySelector('.filter-row');
const filterAlphaDiv = document.createElement('div');
filterAlphaDiv.className = 'filter-field';

const labelAlpha = document.createElement('label');
labelAlpha.setAttribute('for', 'alphaSelect');
labelAlpha.textContent = 'Inicial';

const selectAlpha = document.createElement('select');
selectAlpha.id = 'alphaSelect';
selectAlpha.name = 'alpha';

const alphaOptions = ['Todos', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

alphaOptions.forEach(letter => {
  const option = document.createElement('option');
  option.value = letter === 'Todos' ? '' : letter;
  option.textContent = letter;
  selectAlpha.appendChild(option);
});

filterAlphaDiv.appendChild(labelAlpha);
filterAlphaDiv.appendChild(selectAlpha);
filterRow.insertBefore(filterAlphaDiv, filterRow.lastElementChild);

// Configurar la fecha máxima-hoy

const fechaInput = document.getElementById('fechaInput');
function disableFutureDates() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const maxDate = `${yyyy}-${mm}-${dd}`;
  fechaInput.setAttribute('max', maxDate);
  
  if (!fechaInput.value) {
    fechaInput.value = maxDate;
  }
}
disableFutureDates();

// Función principal--- renderizar la tabla

function renderTable(filter = {}) {
  selectAllCheckbox.checked = false;
  selectAllCheckbox.indeterminate = false;
  tbody.innerHTML = '';

  const searchText = (filter.search || '').toLowerCase();
  const selectedMateria = filter.materia || 'Matemáticas';
  const selectedGrupo = filter.grupo || 'Grupo A';
  const selectedAlpha = (filter.alpha || '').toUpperCase();

  let filteredStudents = students.filter(student => {
    const matchesSearch = student.username.toLowerCase().includes(searchText) || 
                         student.email.toLowerCase().includes(searchText);
    const matchesGroup = student.group === selectedGrupo;
    const matchesAlpha = selectedAlpha === '' || 
                        student.name.toUpperCase().startsWith(selectedAlpha);

    if (currentSessionData.role === 'Estudiante' && student.name !== currentSessionData.username) {
      return false;
    }

    return matchesSearch && matchesGroup && matchesAlpha;
  });

  filteredStudents.forEach(student => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', student.id);

    const studentStatus = attendanceStates[student.id];
    
    if (studentStatus === "Ausente") {
      tr.classList.add("table-danger");
    } else if (studentStatus === "Justificado") {
      tr.classList.add("table-warning");
    }

    const tdCheckbox = document.createElement('td');
    tdCheckbox.className = 'checkbox-cell';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'student-checkbox';
    checkbox.setAttribute('aria-label', `Seleccionar a ${student.name}`);
    checkbox.addEventListener('change', () => {
      tr.classList.toggle('selected', checkbox.checked);
      updateSelectAllCheckboxState();
    });
    tdCheckbox.appendChild(checkbox);

    const tdName = document.createElement('td');
    const divStudentInfo = document.createElement('div');
    divStudentInfo.className = "student-info";
    const spanName = document.createElement('span');
    spanName.className = 'student-name';
    spanName.textContent = student.username;
    const spanEmail = document.createElement('span');
    spanEmail.className = 'student-email';
    spanEmail.textContent = student.email;
    divStudentInfo.appendChild(spanName);
    divStudentInfo.appendChild(spanEmail);
    tdName.appendChild(divStudentInfo);

    const tdGroup = document.createElement('td');
    tdGroup.className = 'student-group';
    const [grpText, grpLetter] = student.group.split(' ');
    tdGroup.innerHTML = `${grpText} <strong>${grpLetter}</strong>`;

    const tdStatus = document.createElement('td');
    const statusText = attendanceStates[student.id] || "No registrado";

    if (statusText === "No registrado") {
      const spanStatus = document.createElement('span');
      spanStatus.className = 'status-unregistered';
      spanStatus.textContent = "No registrado";
      spanStatus.setAttribute('aria-label', 'Estado de asistencia no registrado');
      tdStatus.appendChild(spanStatus);
    } else {
      const spanStatus = document.createElement('span');
      spanStatus.textContent = statusText;
      spanStatus.className = {
        'Presente': 'btn-present',
        'Ausente': 'btn-absent',
        'Justificado': 'btn-justified'
      }[statusText] || '';
      tdStatus.appendChild(spanStatus);
    }

    const tdActions = document.createElement('td');
    tdActions.className = 'actions-cell';

    const btnPresent = document.createElement('button');
    btnPresent.className = 'btn-status btn-present';
    btnPresent.type = 'button';
    btnPresent.textContent = 'Presente';
    btnPresent.setAttribute('aria-pressed', attendanceStates[student.id] === 'Presente' ? 'true' : 'false');
    btnPresent.setAttribute('aria-label', `Marcar ${student.name} como presente`);

    const btnAbsent = document.createElement('button');
    btnAbsent.className = 'btn-status btn-absent';
    btnAbsent.type = 'button';
    btnAbsent.textContent = 'Ausente';
    btnAbsent.setAttribute('aria-pressed', attendanceStates[student.id] === 'Ausente' ? 'true' : 'false');
    btnAbsent.setAttribute('aria-label', `Marcar ${student.name} como ausente`);

    const btnJustified = document.createElement('button');
    btnJustified.className = 'btn-status btn-justified';
    btnJustified.type = 'button';
    btnJustified.textContent = 'Justificado';
    btnJustified.setAttribute('aria-pressed', attendanceStates[student.id] === 'Justificado' ? 'true' : 'false');
    btnJustified.setAttribute('aria-label', `Marcar ${student.name} como justificado`);

    btnPresent.addEventListener('click', () => {
      updateAttendance(student.id, 'Presente');
    });
    btnAbsent.addEventListener('click', () => {
      updateAttendance(student.id, 'Ausente');
    });
    btnJustified.addEventListener('click', () => {
      updateAttendance(student.id, 'Justificado');
    });

    tdActions.appendChild(btnPresent);
    tdActions.appendChild(btnAbsent);
    tdActions.appendChild(btnJustified);

    tr.appendChild(tdCheckbox);
    tr.appendChild(tdName);
    tr.appendChild(tdGroup);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });

  if (filteredStudents.length === 0) {
    const trEmpty = document.createElement('tr');
    const tdEmpty = document.createElement('td');
    tdEmpty.colSpan = 5;
    tdEmpty.style.textAlign = 'center';
    tdEmpty.style.padding = '1.2rem';
    tdEmpty.style.color = '#666';
    tdEmpty.textContent = 'No se encontraron estudiantes.';
    trEmpty.appendChild(tdEmpty);
    tbody.appendChild(trEmpty);
  }
}

// Actualizar asistencia
function updateAttendance(studentId, status) {
  attendanceStates[studentId] = status;
  hasUnsavedChanges = true;
  updateActionButtons();
  renderTable(getCurrentFilters());
  
  const studentName = students.find(s => s.id === studentId).name;
  console.log(`✓ ${studentName} marcado como: ${status} (sin guardar)`);
}

// Obtener filtros actuales
function getCurrentFilters() {
  return {
    search: searchInput.value.trim(),
    materia: document.getElementById('materiaSelect').value,
    grupo: document.getElementById('grupoSelect').value,
    fecha: document.getElementById('fechaInput').value,
    alpha: document.getElementById('alphaSelect').value,
  };
}

// Función para renderizar el dashboard del estudiante
function renderStudentDashboard() {
  // 1. Ocultar todos los controles de profesor
  document.querySelector('.addEst')?.remove();
  document.querySelector('.filter-box')?.remove();
  document.querySelector('.alpha-filter')?.remove();
  document.getElementById('searchInput').style.display = 'none';

  // Cambiar el título principal de la sección
  const mainTitle = document.querySelector('main.content h2');
  if(mainTitle) {
    mainTitle.textContent = 'Mi Historial de Asistencia';
  }

  // 2. Encontrar el ID del estudiante actual
  const studentId = currentSessionData.id;
  const studentHistory = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('attendance ')) {
      const attendanceData = JSON.parse(localStorage.getItem(key));
      if (attendanceData[studentId] && attendanceData[studentId] !== 'No registrado') {
        // Parsear la clave para obtener materia, grupo y fecha
        const parts = key.replace('attendance ', '').split(',');
        studentHistory.push({
          materia: parts[0],
          grupo: parts[1],
          fecha: parts[2],
          status: attendanceData[studentId]
        });
      }
    }
  }

  // 4. Modificar la cabecera de la tabla
  const thead = document.querySelector('.attendance-table thead tr');
  thead.innerHTML = `
    <th scope="col">Fecha</th>
    <th scope="col">Materia</th>
    <th scope="col">Grupo</th>
    <th scope="col">Estado</th>
  `;

  // 5. Renderizar el historial en la tabla
  tbody.innerHTML = '';
  if (studentHistory.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 1rem;">Aún no tienes registros de asistencia.</td></tr>`;
    return;
  }

  studentHistory.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordenar por fecha más reciente

  studentHistory.forEach(record => {
    const statusClass = record.status === 'Ausente' ? 'table-danger' : (record.status === 'Justificado' ? 'table-warning' : '');
    tbody.innerHTML += `
      <tr class="${statusClass}">
        <td>${record.fecha}</td>
        <td>${record.materia}</td>
        <td>${record.grupo}</td>
        <td>${record.status}</td>
      </tr>
    `;
  });
}

// Aplicar permisos según el rol del usuario
function applyRolePermissions() {
  if (!currentSessionData) return;

  const role = currentSessionData.role;

  if (role === 'Estudiante') {
    renderStudentDashboard();
    return; // Detenemos la ejecución para no renderizar la tabla de profesor
  }
}
// CSeleccionar todos
function updateSelectAllCheckboxState() {
  const studentCheckboxes = document.querySelectorAll('.student-checkbox');
  const total = studentCheckboxes.length;
  const checkedCount = document.querySelectorAll('.student-checkbox:checked').length;

  if (total === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCount === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCount === total) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  }
}

selectAllCheckbox.addEventListener('change', () => {
  const studentCheckboxes = document.querySelectorAll('.student-checkbox');
  studentCheckboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
    checkbox.closest('tr').classList.toggle('selected', selectAllCheckbox.checked);
  });
});

// Eventos de filtros
filterForm.addEventListener('submit', e => {
  e.preventDefault();
  renderTable(getCurrentFilters());
});

searchInput.addEventListener('input', () => {
  renderTable(getCurrentFilters());
});

document.getElementById('grupoSelect').addEventListener('change', () => {
  if (hasUnsavedChanges) {
    if (!confirm('Tienes cambios sin guardar. ¿Deseas continuar sin guardar?')) {
      return;
    }
  }
  searchInput.value = '';
  selectAlpha.value = '';
  attendanceStates = loadAttendanceFromStorage();
  students.forEach(s => {
    if (!attendanceStates[s.id]) {
      attendanceStates[s.id] = 'No registrado';
    }
  });
  hasUnsavedChanges = false;
  updateActionButtons();
  renderTable(getCurrentFilters());
});

document.getElementById('materiaSelect').addEventListener('change', () => {
  if (hasUnsavedChanges) {
    if (!confirm('Tienes cambios sin guardar. ¿Deseas continuar sin guardar?')) {
      return;
    }
  }
  attendanceStates = loadAttendanceFromStorage();
  students.forEach(s => {
    if (!attendanceStates[s.id]) {
      attendanceStates[s.id] = 'No registrado';
    }
  });
  hasUnsavedChanges = false;
  updateActionButtons();
  renderTable(getCurrentFilters());
});

document.getElementById('fechaInput').addEventListener('change', () => {
  if (hasUnsavedChanges) {
    if (!confirm('Tienes cambios sin guardar. ¿Deseas continuar sin guardar?')) {
      return;
    }
  }
  attendanceStates = loadAttendanceFromStorage();
  students.forEach(s => {
    if (!attendanceStates[s.id]) {
      attendanceStates[s.id] = 'No registrado';
    }
  });
  hasUnsavedChanges = false;
  updateActionButtons();
  renderTable(getCurrentFilters());
});

selectAlpha.addEventListener('change', () => {
  renderTable(getCurrentFilters());
});

// Cerrar sesión

const logoutLink = document.querySelector('.bottom-logout');
if (logoutLink) {
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (hasUnsavedChanges) {
      if (!confirm('⚠️ Tienes cambios sin guardar. ¿Deseas cerrar sesión de todas formas?')) {
        return;
      }
    }
    if (confirm('¿Deseas cerrar sesión?')) {
      localStorage.removeItem('currentSession');
      window.location.href = './logIn.html';
    }
  });
}
// Inicializar

// Lógica para añadir estudiante existente por ID
const addStudentByIdBtn = document.getElementById('addStudentByIdBtn');
if (addStudentByIdBtn) {
  addStudentByIdBtn.addEventListener('click', () => {
    const studentIdInput = document.getElementById('addStudentByIdInput');
    const studentId = parseInt(studentIdInput.value, 10);

    if (isNaN(studentId)) {
      alert('Por favor, introduce un ID de estudiante válido.');
      return;
    }

    // Verificar si el estudiante ya está en la tabla actual
    const currentFilters = getCurrentFilters();
    const studentsInCurrentGroup = students.filter(s => s.group === currentFilters.grupo);
    if (studentsInCurrentGroup.some(s => s.id === studentId)) {
      alert('Este estudiante ya pertenece al grupo actual.');
      studentIdInput.value = '';
      return;
    }

    // Buscar al estudiante en la lista maestra
    const studentToAdd = students.find(s => s.id === studentId);

    if (studentToAdd) {
      // Añadir el estudiante al grupo actual de forma temporal para esta sesión
      studentToAdd.group = currentFilters.grupo;
      renderTable(currentFilters);
      alert(`Estudiante "${studentToAdd.name}" añadido a la lista de asistencia actual.`);
      studentIdInput.value = '';
    } else {
      alert('No se encontró ningún estudiante con ese ID.');
    }
  });
}

// Aplicar permisos ANTES de cualquier otra renderización
applyRolePermissions();
if (currentSessionData.role !== 'Estudiante') {
  createActionButtons();
  renderTable(getCurrentFilters());
  updateActionButtons();
}

// Este es el CRUD para registrar un estudiante

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formEst");
  const tabla = document.getElementById("studentsTbody");
  let estudiantes = JSON.parse(localStorage.getItem("estudiantes")) || [];
  let editIndex = null;

  // Mostrar estudiantes en la tabla creada
  const mostrarEstudiantes = () => {
    tabla.innerHTML = "";
    estudiantes.forEach((est, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td><input type="checkbox" disabled></td>
        <td>${est.nombre}</td>
        <td>${est.grupo}</td>
        <td>—</td>
        <td>
          <button class="btn-editar" data-index="${index}" title="Editar"></button>
          <button class="btn-eliminar" data-index="${index}" title="Eliminar"></button>
        </td>
      `;
      tabla.appendChild(fila);
    });
  };

  // Evento del form (Agregar o Editar) submit

  form.addEventListener("submit", (e) => {
  e.preventDefault();



  const nombre = document.getElementById("nombre").value.trim();
  const grupo = document.getElementById("materiaN").value;
  const materia = document.getElementById("materia").value; // Capturamos la materia

  if (!nombre || !grupo || !materia) { // Validamos la materia
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor llena toda la información requerida.",
    });
    return;
  }

  const nuevoEstudiante = { nombre, grupo, materia };

  if (editIndex !== null) {
    // Editar estudiante existente
    estudiantes[editIndex] = nuevoEstudiante;
    Swal.fire({
      icon: "success",
      title: "Actualizado",
      text: "El registro del estudiante se ha actualizado correctamente.",
    });
    editIndex = null;
  } else {
    // Agregar estudiante nuevo
    // Crear un nuevo usuario completo y agregarlo a la lista principal de 'allUsers'
    const nuevoId = Date.now();
    const correo = document.getElementById("correo").value.trim() || `${nombre.toLowerCase().replace(/\s+/g, '.')}@ejemplo.com`;
    const nuevoUsuarioCompleto = {
      id: nuevoId,
      username: nombre,
      email: correo,
      password: 'password123', // Asignar una contraseña por defecto
      role: 'Estudiante',
      group: grupo,
      materia: materia // Guardamos la materia
    };

    allUsers.push(nuevoUsuarioCompleto);
    localStorage.setItem("users", JSON.stringify(allUsers));

    // Actualizar la lista de estudiantes en memoria para reflejar el cambio inmediatamente
    students = allUsers
      .filter(user => user.role === 'Estudiante')
      .map(user => ({ ...user, name: user.username, group: user.group || 'Sin Grupo' }));

    // Inicializar su estado de asistencia
    attendanceStates[nuevoId] = 'No registrado';

   
    Swal.fire({
      icon: "success",
      title: "Agregado",
      text: "El nuevo estudiante se ha registrado correctamente.",
    });
  }

  // Limpiar formulario
  form.reset();

  // Actualizar la tabla de asistencia
  location.reload(); // Recargar la página para asegurar que todos los datos se sincronicen
  });

  // Eventos para editar/eliminar registros
  tabla.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-eliminar")) {
      const index = e.target.dataset.index;
      Swal.fire({
        title: "¿Deseas eliminar estudiante?",
        text: "Recuerd que esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          estudiantes.splice(index, 1);
          localStorage.setItem("estudiantes", JSON.stringify(estudiantes));
          mostrarEstudiantes();
          Swal.fire("Eliminado", "El estudiante ha sido eliminado.");
        }
      });
    }

    if (e.target.classList.contains("btn-editar")) {
      const index = e.target.dataset.index;
      const estudiante = estudiantes[index];
      document.getElementById("nombre").value = estudiante.nombre;
      document.getElementById("materiaN").value = estudiante.grupo;
      editIndex = index;
    }
  });

  mostrarEstudiantes();
});
