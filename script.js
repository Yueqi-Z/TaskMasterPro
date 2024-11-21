// Task Data: Initial sample data
let tasks = [
  { id: 1, description: "Finish project proposal", dueDate: "2024-11-20", priority: "High", completed: false },
  { id: 2, description: "Buy groceries", dueDate: "2024-11-21", priority: "Low", completed: false }
];

// Add a new task
function addTask(description, dueDate, priority) {
  const newTask = {
    id: tasks.length + 1,
    description,
    dueDate,
    priority,
    completed: false
  };
  tasks.push(newTask);
  renderTasks();
}

// Delete a task
function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  renderTasks();
}

// Toggle task completion
function toggleComplete(taskId) {
  tasks = tasks.map(task =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  renderTasks();
}

// Edit a task
function editTask(taskId) {
  const task = tasks.find(task => task.id === taskId);
  if (!task) return;

  const newDescription = prompt("Edit Task Description", task.description);
  const newDueDate = prompt("Edit Due Date", task.dueDate);
  const newPriority = prompt("Edit Priority (High, Medium, Low)", task.priority);

  if (newDescription && newDueDate && newPriority) {
    task.description = newDescription;
    task.dueDate = newDueDate;
    task.priority = newPriority;
    renderTasks();
  }
}

// Filter Tasks by Priority
function filterTasks(priority) {
  let filteredTasks = tasks;

  if (priority !== "All") {
    filteredTasks = tasks.filter(task => task.priority === priority);
  }

  renderFilteredTasks(filteredTasks);
}

// Search Tasks by Description
function searchTasks(keyword) {
  const filteredTasks = tasks.filter(task =>
    task.description.toLowerCase().includes(keyword.toLowerCase())
  );

  renderFilteredTasks(filteredTasks);
}

// Render filtered tasks
function renderFilteredTasks(filteredTasks) {
  const taskList = document.querySelector(".task-list");
  taskList.innerHTML = ""; // Clear previous content

  filteredTasks.forEach(task => {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");

    taskItem.innerHTML = `
      <span class="${task.completed ? "completed" : ""}">
        [${task.priority}] ${task.description} (Due: ${task.dueDate})
      </span>
      <button class="toggle-complete" data-id="${task.id}">Complete</button>
      <button class="edit-task" data-id="${task.id}">Edit</button>
      <button class="delete-task" data-id="${task.id}">Delete</button>
    `;

    taskList.appendChild(taskItem);
  });

  rebindEventListeners(); // Rebind listeners for filtered tasks
}

// Enable Drag-and-Drop Reordering
function enableDragAndDrop() {
  const taskItems = document.querySelectorAll(".task-item");

  taskItems.forEach((taskItem, index) => {
    taskItem.draggable = true;

    // Drag Start
    taskItem.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", index); // Store the dragged item's index
    });

    // Drag Over
    taskItem.addEventListener("dragover", e => {
      e.preventDefault(); // Allow dropping
    });

    // Drop
    taskItem.addEventListener("drop", e => {
      e.preventDefault();
      const draggedIndex = e.dataTransfer.getData("text/plain");
      const targetIndex = index;

      // Reorder tasks in the array
      const draggedTask = tasks.splice(draggedIndex, 1)[0];
      tasks.splice(targetIndex, 0, draggedTask);

      renderTasks(); // Re-render tasks
    });
  });
}

// Rebind Event Listeners
function rebindEventListeners() {
  // Delete Task Button
  document.querySelectorAll(".delete-task").forEach(button => {
    button.addEventListener("click", () => {
      const taskId = parseInt(button.dataset.id, 10);
      deleteTask(taskId);
    });
  });

  // Toggle Complete Button
  document.querySelectorAll(".toggle-complete").forEach(button => {
    button.addEventListener("click", () => {
      const taskId = parseInt(button.dataset.id, 10);
      toggleComplete(taskId);
    });
  });

  // Edit Task Button
  document.querySelectorAll(".edit-task").forEach(button => {
    button.addEventListener("click", () => {
      const taskId = parseInt(button.dataset.id, 10);
      editTask(taskId);
    });
  });
}

// Render tasks dynamically
function renderTasks() {
  const taskList = document.querySelector(".task-list");
  taskList.innerHTML = ""; // Clear previous content

  tasks.forEach(task => {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");

    // Apply strikethrough styling if task is completed
    taskItem.innerHTML = `
      <span class="${task.completed ? "completed" : ""}">
        [${task.priority}] ${task.description} (Due: ${task.dueDate})
      </span>
      <button class="toggle-complete" data-id="${task.id}">Complete</button>
      <button class="edit-task" data-id="${task.id}">Edit</button>
      <button class="delete-task" data-id="${task.id}">Delete</button>
    `;

    taskList.appendChild(taskItem);
  });

  rebindEventListeners(); // Rebind listeners for rendered tasks
  enableDragAndDrop(); // Enable drag-and-drop
}

// Initial rendering on page load
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();

  // Filter Priority Event
  const filterPriority = document.querySelector("#filter-priority");
  filterPriority.addEventListener("change", e => {
    filterTasks(e.target.value);
  });

  // Search Tasks Event
  const searchTasksInput = document.querySelector("#search-tasks");
  searchTasksInput.addEventListener("input", e => {
    searchTasks(e.target.value);
  });

  // Add Task Form Event
  const addTaskForm = document.querySelector("#add-task-form");
  addTaskForm.addEventListener("submit", e => {
    e.preventDefault();
    const description = e.target.elements["description"].value;
    const dueDate = e.target.elements["dueDate"].value;
    const priority = e.target.elements["priority"].value;
    addTask(description, dueDate, priority);
    e.target.reset();
  });
});
