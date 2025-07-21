// This is the Pomodoro Timer Functionality
const timerLabel = document.getElementById('timer-label');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const deadlineInput = document.getElementById('deadline-input'); // Added deadline input
const taskList = document.getElementById('task-list');

// Create and insert task count display element
const taskCountDisplay = document.createElement('div');
taskCountDisplay.id = 'task-count';
taskCountDisplay.style.margin = '15px 0';
taskCountDisplay.style.fontWeight = '600';
taskCountDisplay.style.color = '#4caf50';
taskList.parentNode.insertBefore(taskCountDisplay, taskList);

// Pomodoro Timer variables
const WORK_TIME = 25 * 60; // seconds
const BREAK_TIME = 5 * 60; // seconds
let timeLeft = WORK_TIME;
let isWorkTime = true;
let timerInterval = null;

// This is where seconds is formatted to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// This is where update timer is displayed
function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
  timerLabel.textContent = isWorkTime ? 'Work Time' : 'Break Time';
}

// This is where Timer is started for work or break 
function startTimer() {
  if (timerInterval) return; // already running
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      isWorkTime = !isWorkTime;
      timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
      updateTimerDisplay();
      notifyUser(isWorkTime ? 'Work session started!' : 'Break time started!');
      startTimer(); // auto start next session
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerInterval) return;
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  isWorkTime = true;
  timeLeft = WORK_TIME;
  updateTimerDisplay();
}

// Notifications permission and sending
function notifyUser(message) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification('Pomodoro Tracker', { body: message, icon: 'pwa version tracker/icons/icon-192.png' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('Pomodoro Tracker', { body: message, icon: 'pwa version tracker/icons/icon-192.png' });
      }
    });
  }
}

// Task List functions
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update and display task counts
function updateTaskCount() {
  const completed = tasks.filter(t => t.done).length;
  const total = tasks.length;
  taskCountDisplay.textContent = `Tasks: ${total} | Completed: ${completed} | Incomplete: ${total - completed}`;
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');

    // Create checkbox for complete/incomplete
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.style.marginRight = '10px';

    checkbox.addEventListener('change', e => {
      tasks[index].done = e.target.checked;
      saveTasks();
      renderTasks();
    });

    li.appendChild(checkbox);

    const taskText = document.createElement('span');
    taskText.textContent = task.text;
    if (task.done) {
      taskText.style.textDecoration = 'line-through';
      taskText.style.color = '#777';
    }
    li.appendChild(taskText);

    // Show deadline if it exists
    if (task.deadline) {
      const deadlineSpan = document.createElement('span');
      deadlineSpan.textContent = ` (Due: ${task.deadline})`;
      deadlineSpan.style.marginLeft = '10px';
      deadlineSpan.style.fontStyle = 'italic';
      deadlineSpan.style.color = 'red';
      li.appendChild(deadlineSpan);
    }

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('edit-btn');
    editBtn.style.marginLeft = '10px';
    editBtn.addEventListener('click', e => {
      e.stopPropagation();

      const newText = prompt('Edit task:', task.text);
      if (newText !== null && newText.trim() !== '') {
        tasks[index].text = newText.trim();
      }

      const newDeadline = prompt('Edit deadline (YYYY-MM-DD):', task.deadline || '');
      if (newDeadline !== null) {
        tasks[index].deadline = newDeadline.trim();
      }

      saveTasks();
      renderTasks();
    });

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.classList.add('delete-btn');
    delBtn.style.marginLeft = '10px';
    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(editBtn);
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });

  updateTaskCount();
}

// Task submit form handler
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const deadline = deadlineInput.value; // Added deadline from input
  if (text.length === 0) return;
  tasks.push({ text, deadline, done: false }); // Save task with deadline
  saveTasks();
  renderTasks();
  taskInput.value = '';
  deadlineInput.value = ''; // Clear deadline input after submit
});

// Initialize
updateTimerDisplay();
renderTasks();

// Button event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Dark Mode Toggle Logic
document.getElementById("dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});



