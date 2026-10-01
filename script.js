const STORAGE_KEY = "student-management-system-students";

let students = loadStudents();
let editingStudentId = null;

const form = document.querySelector("#studentForm");
const tableBody = document.querySelector("#studentTableBody");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const studentCount = document.querySelector("#studentCount");
const formTitle = document.querySelector("#form-title");
const formMode = document.querySelector("#formMode");
const saveButton = document.querySelector("#saveButton");
const cancelButton = document.querySelector("#cancelButton");
const message = document.querySelector("#message");

const fields = {
  studentId: document.querySelector("#studentId"),
  name: document.querySelector("#name"),
  age: document.querySelector("#age"),
  course: document.querySelector("#course"),
  email: document.querySelector("#email"),
  phone: document.querySelector("#phone")
};

function loadStudents() {
  try {
    const savedStudents = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedStudents) ? savedStudents : [];
  } catch (error) {
    return [];
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function clearMessage() {
  showMessage("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderStudents() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    const searchableText = `${student.studentId} ${student.name} ${student.course}`.toLowerCase();
    return searchableText.includes(searchTerm);
  });

  tableBody.innerHTML = filteredStudents.map((student) => `
    <tr>
      <td><strong>${escapeHtml(student.studentId)}</strong></td>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.age)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.phone)}</td>
      <td>
        <button class="action-button edit-button" type="button" data-action="edit" data-id="${escapeHtml(student.studentId)}">Edit</button>
        <button class="action-button delete-button" type="button" data-action="delete" data-id="${escapeHtml(student.studentId)}">Delete</button>
      </td>
    </tr>
  `).join("");

  studentCount.textContent = students.length;
  emptyState.classList.toggle("hidden", filteredStudents.length > 0);

  if (students.length > 0 && filteredStudents.length === 0) {
    emptyState.innerHTML = "<strong>No matching students</strong><span>Try a different search term.</span>";
  } else {
    emptyState.innerHTML = "<strong>No student records yet</strong><span>Add your first student using the form above.</span>";
  }
}

function getFormStudent() {
  return {
    studentId: fields.studentId.value.trim(),
    name: fields.name.value.trim(),
    age: Number(fields.age.value),
    course: fields.course.value.trim(),
    email: fields.email.value.trim(),
    phone: fields.phone.value.trim()
  };
}

function validateStudent(student) {
  if (!student.studentId || !student.name || !student.course || !student.email || !student.phone) {
    return "Please fill in all fields.";
  }

  if (!Number.isInteger(student.age) || student.age < 1 || student.age > 120) {
    return "Age must be a whole number between 1 and 120.";
  }

  if (!/^\S+@\S+\.\S+$/.test(student.email)) {
    return "Please enter a valid email address.";
  }

  if (!/^[0-9+\-() ]{7,20}$/.test(student.phone)) {
    return "Please enter a valid phone number.";
  }

  return "";
}

function resetForm() {
  form.reset();
  editingStudentId = null;
  formTitle.textContent = "Add student";
  formMode.textContent = "New record";
  saveButton.textContent = "Add student";
  cancelButton.classList.add("hidden");
  clearMessage();
}

function startEditing(student) {
  editingStudentId = student.studentId;
  fields.studentId.value = student.studentId;
  fields.name.value = student.name;
  fields.age.value = student.age;
  fields.course.value = student.course;
  fields.email.value = student.email;
  fields.phone.value = student.phone;
  fields.studentId.readOnly = true;
  formTitle.textContent = "Update student";
  formMode.textContent = "Editing record";
  saveButton.textContent = "Update student";
  cancelButton.classList.remove("hidden");
  clearMessage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const student = getFormStudent();
  const validationError = validateStudent(student);

  if (validationError) {
    showMessage(validationError, true);
    return;
  }

  if (editingStudentId) {
    students = students.map((item) => (
      item.studentId === editingStudentId ? student : item
    ));
    showMessage("Student updated successfully.");
  } else {
    const duplicate = students.some(
      (item) => item.studentId.toLowerCase() === student.studentId.toLowerCase()
    );

    if (duplicate) {
      showMessage("That Student ID already exists.", true);
      return;
    }

    students.push(student);
    showMessage("Student added successfully.");
  }

  saveStudents();
  renderStudents();
  form.reset();
  fields.studentId.readOnly = false;
  editingStudentId = null;
  formTitle.textContent = "Add student";
  formMode.textContent = "New record";
  saveButton.textContent = "Add student";
  cancelButton.classList.add("hidden");
});

cancelButton.addEventListener("click", () => {
  fields.studentId.readOnly = false;
  resetForm();
});

searchInput.addEventListener("input", renderStudents);

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const student = students.find((item) => item.studentId === id);
  if (!student) return;

  if (button.dataset.action === "edit") {
    startEditing(student);
    return;
  }

  if (button.dataset.action === "delete") {
    const shouldDelete = window.confirm(`Delete student ${student.studentId}?`);
    if (!shouldDelete) return;

    students = students.filter((item) => item.studentId !== id);
    saveStudents();
    renderStudents();

    if (editingStudentId === id) {
      fields.studentId.readOnly = false;
      resetForm();
    }
  }
});

renderStudents();
