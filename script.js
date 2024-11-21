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

// Render tasks dynamically
function renderTasks() {
  const taskList = document.querySelector(".task-list");
  taskList.innerHTML = ""; // Clear previous content

  tasks.forEach(task => {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");

    taskItem.innerHTML = `
      <span class="${task.completed ? "completed" : ""}">${task.description}</span>
      <button onclick="toggleComplete(${task.id})">Complete</button>
      <button onclick="deleteTask(${task.id})">Delete</button>
    `;

    taskList.appendChild(taskItem);
  });
}

// Initial rendering on page load
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();

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
