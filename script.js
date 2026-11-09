const TASKS_KEY = "tasks";
const THEME_KEY = "theme";

const addTaskBtn = document.querySelector("#addTaskBtn");
const taskCategories = document.querySelector("#taskCategories");
const darkModeToggle = document.querySelector("#darkModeToggle");
const searchTasks = document.querySelector("#searchTasks");
const sortByDate = document.querySelector("#sortByDate");
const filterPriority = document.querySelector("#filterPriority");
const exportTasksBtn = document.querySelector("#exportTasksBtn");

let editingTask = null;
let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(TASKS_KEY));
    if (!Array.isArray(saved)) return [];
    return saved.filter((task) => task && typeof task.title === "string");
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    console.warn("Could not save tasks");
  }
}

function loadTheme() {
  try {
    if (localStorage.getItem(THEME_KEY) === "dark") {
      document.body.classList.add("dark-mode");
    }
  } catch {
    console.warn("Could not read theme");
  }
}

function saveTheme(isDark) {
  try {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  } catch {
    console.warn("Could not save theme");
  }
}

addTaskBtn.addEventListener("click", () => {
  const title = document.querySelector("#taskTitle").value.trim();
  const due = document.querySelector("#taskDueDate").value;
  const priority = document.querySelector("#taskPriority").value;
  const notes = document.querySelector("#taskNotes").value;

  if (title === "") return;

  if (editingTask) {
    Object.assign(editingTask, { title, due, priority, notes });
    editingTask = null;
    addTaskBtn.textContent = "Add Task";
  } else {
    tasks.push({ title, due, priority, notes, completed: false });
  }

  saveTasks();
  clearForm();
  applyFilters();
});

const clearForm = () => {
  document.querySelector("#taskTitle").value = "";
  document.querySelector("#taskDueDate").value = "";
  document.querySelector("#taskPriority").value = "low";
  document.querySelector("#taskNotes").value = "";
};

function applyFilters() {
  const query = searchTasks.value.toLowerCase();
  const sortDue = sortByDate.value;
  const selectedPriority = filterPriority.value;

  const filtered = tasks.filter((task) => {
    const matchesTitle = task.title.toLowerCase().includes(query);
    const matchesPriority =
      selectedPriority === "" || task.priority === selectedPriority;
    return matchesTitle && matchesPriority;
  });

  if (sortDue === "asc") {
    filtered.sort((a, b) => new Date(a.due) - new Date(b.due));
  } else if (sortDue === "desc") {
    filtered.sort((a, b) => new Date(b.due) - new Date(a.due));
  }

  taskCategories.innerHTML = "";

  filtered.forEach((task) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = `task ${task.priority}`;
    if (task.completed) taskDiv.classList.add("completed");

    const title = document.createElement("p");
    title.textContent = task.due ? `${task.title} - ${task.due}` : task.title;

    const actions = document.createElement("div");
    actions.innerHTML = `
      <button class="complete-btn">${task.completed ? "Completed" : "Complete"}</button>
      <button class="delete-btn">Delete</button>
      <button class="edit-btn">Edit</button>
    `;

    actions.querySelector(".complete-btn").addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      applyFilters();
    });

    actions.querySelector(".delete-btn").addEventListener("click", () => {
      tasks = tasks.filter((t) => t !== task);
      if (editingTask === task) {
        editingTask = null;
        addTaskBtn.textContent = "Add Task";
        clearForm();
      }
      saveTasks();
      applyFilters();
    });

    actions.querySelector(".edit-btn").addEventListener("click", () => {
      document.querySelector("#taskTitle").value = task.title;
      document.querySelector("#taskDueDate").value = task.due;
      document.querySelector("#taskPriority").value = task.priority;
      document.querySelector("#taskNotes").value = task.notes;
      editingTask = task;
      addTaskBtn.textContent = "Save Changes";
    });

    taskDiv.append(title, actions);
    taskCategories.appendChild(taskDiv);
  });
}

searchTasks.addEventListener("input", applyFilters);
sortByDate.addEventListener("change", applyFilters);
filterPriority.addEventListener("change", applyFilters);

darkModeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  saveTheme(isDark);
});

exportTasksBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  tasks.forEach((task) => {
    doc.text(`${task.title} ${task.due} ${task.priority}`, 10, y);
    y += 10;
  });
  doc.save("tasks.pdf");
});

loadTheme();
applyFilters();