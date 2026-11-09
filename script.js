const addTaskBtn = document.querySelector("#addTaskBtn");
const taskCategories = document.querySelector("#taskCategories");
const darkModeToggle = document.querySelector("#darkModeToggle");
const searchTasks = document.querySelector("#searchTasks");
const sortByDate = document.querySelector("#sortByDate");
const filterPriority = document.querySelector("#filterPriority");
const exportTasksBtn = document.querySelector("#exportTasksBtn");
let editTitle = null;

let tasks = [];
addTaskBtn.addEventListener("click", () => {
  const taskTitle = document.querySelector("#taskTitle").value;
  const taskDueDate = document.querySelector("#taskDueDate").value;
  const taskPriority = document.querySelector("#taskPriority").value;
  const taskNotes = document.querySelector("#taskNotes").value;
  let task = {
    title: taskTitle,
    due: taskDueDate,
    priority: taskPriority,
    notes: taskNotes,
    complate: false,
  };
  if (taskTitle === "") return;
  if (!editTitle) {
    tasks.push(task);
  } else {
    editTitle.title = taskTitle;
    editTitle = null;
    addTaskBtn.textContent = "Add book";
  }
  renderTask();
  applyFilters();
  saveTask()
  clearForm();

});
const clearForm = () => {
  document.querySelector("#taskTitle").value = "";
  document.querySelector("#taskDueDate").value = "";
  document.querySelector("#taskPriority").value = "low";
  document.querySelector("#taskNotes").value = "";
};
const renderTask = () => {
  taskCategories.innerHTML = "";
  tasks.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = `task ${task.priority}`;
    taskDiv.setAttribute("data-index", index);
    if (task.complate) taskDiv.classList.add("completed");
    taskDiv.innerHTML = `<p>${task.title}- ${task.due}</p>
  
    <div>
    <button class="complete-btn">${task.complate ? "complated" : "complate"}></button>
     <button class="delete-btn">delete</button>
     <button class="edit-btn">edit</button>
     </div>`;

    taskDiv.querySelector(".complete-btn").addEventListener("click", () => {
      tasks[index].complate = !tasks[index].complate;
      renderTask();
      saveTAsk();
    });
    taskDiv.querySelector(".delete-btn").addEventListener("click", () => {
      tasks.splice(index, 1);
      renderTask();
      saveTAsk();
    });
    taskDiv.querySelector(".edit-btn").addEventListener("click", () => {
      document.querySelector("#taskTitle").value = tasks[index].title;

      editTitle = tasks[index];
      addTaskBtn.textContent = "ذخیره ویرایش";
    });

    taskCategories.appendChild(taskDiv);
  });
};
function saveTask(){
  localStorage.setItem("tasks",JSON.stringify(tasks))
}
function loadTask(){
const storedTask=  localStorage.getItem("tasks")
tasks=JSON.parse(storedTask)
renderTask()
}

function saveDarkMode(isdarkMode) {
  localStorage.setItem("darkMode", isdarkMode ? "enable" : "disable");
}
saveDarkMode(true);

function loadDarkMode() {
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enable") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadDarkMode();
  loadTask()
});
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode=document.body.classList.contains("dark-mode")
  saveDarkMode(isDarkMode)
});

searchTasks.addEventListener("input", applyFilters);
sortByDate.addEventListener("change", applyFilters);
filterPriority.addEventListener("change", applyFilters);

function applyFilters() {
  const query = searchTasks.value.toLowerCase();
  const sortDue = sortByDate.value;
  const selectPrority = filterPriority.value;

  const machedFilter = tasks.filter((task) => {
    const machedTask = task.title.toLowerCase().includes(query);
    const machedPririty =
      task.priority === selectPrority || selectPrority === "";

    return machedTask && machedPririty;
  });
  if (sortDue === "asc") {
    machedFilter.sort((a, b) => new Date(a.due) - new Date(b.due));
  } else if (sortDue === "desc") {
    machedFilter.sort((a, b) => new Date(b.due) - new Date(a.due));
  }
  taskCategories.innerHTML = "";
  machedFilter.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = `task ${task.priority}`;
    taskDiv.setAttribute("data-index", index);
    if (task.complate) taskDiv.classList.add("completed");
    taskDiv.innerHTML = `<p>${task.title}- ${task.due}</p>
  
    <div>
    <button class="complete-btn">${task.complate ? "complated" : "complate"}></button>
     <button class="delete-btn">delete</button>
     <button class="edit-btn">edit</button>
     </div>`;

    taskDiv.querySelector(".complete-btn").addEventListener("click", () => {
      tasks[index].complate = !tasks[index].complate;
      applyFilters();
      saveTask();
    });
    taskDiv.querySelector(".delete-btn").addEventListener("click", () => {
      tasks.splice(index, 1);
      applyFilters();
      saveTask();
    });
    taskDiv.querySelector(".edit-btn").addEventListener("click", () => {
      document.querySelector("#taskTitle").value = tasks[index].title;

      editTitle = tasks[index];
      addTaskBtn.textContent = "ذخیره ویرایش";
    });

    taskCategories.appendChild(taskDiv);
  });
}
exportTasksBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let yOfsset = 10;
  tasks.forEach((task) => {
    const taksContent = `${task.title} ${task.due} ${task.priority}`;
    doc.text(taksContent, 10, yOfsset);
    yOfsset += 10;
  });
  doc.save("task");
});
