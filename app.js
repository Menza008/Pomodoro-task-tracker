// This is the Pomodoro Timer and Task Manager Functionality wrapped in a class
class PomodoroApp {
  constructor() {
    // DOM elements
    this.timerIndicator = document.getElementById('timer-indicator');
    this.timerDisplay = document.getElementById('timer');
    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.resetBtn = document.getElementById('resetBtn');
    
    this.taskForm = document.getElementById('task-form');
    this.taskInput = document.getElementById('task-input');
    this.deadlineInput = document.getElementById('deadline-input'); // Added deadline input
    this.taskList = document.getElementById('task-list');

    // Create and insert task count display element
    this.taskCountDisplay = document.createElement('div');
    this.taskCountDisplay.id = 'task-count';
    this.taskCountDisplay.style.margin = '15px 0';
    this.taskCountDisplay.style.fontWeight = '600';
    this.taskCountDisplay.style.color = '#4caf50';
    this.taskList.parentNode.insertBefore(this.taskCountDisplay, this.taskList);

    // Pomodoro Timer variables
    this.WORK_TIME = 25 * 60; // seconds
    this.BREAK_TIME = 5 * 60; // seconds
    this.timeLeft = this.WORK_TIME;
    this.isWorkTime = true;
    this.timerInterval = null;

    // Tasks storage
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    this.init();
  }

  // This is where seconds is formatted to MM:SS
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  // This is where update timer is displayed
  updateTimerDisplay() {
    this.timerDisplay.textContent = this.formatTime(this.timeLeft);
    
  }

  // This is where Timer is started for work or break 
  startTimer() {
    if (this.timerInterval) return; // already running
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.isWorkTime = !this.isWorkTime;
        this.timeLeft = this.isWorkTime ? this.WORK_TIME : this.BREAK_TIME;
        this.updateTimerDisplay();
        this.notifyUser(this.isWorkTime ? 'Work session started!' : 'Break time started!');
        this.startTimer(); // auto start next session
      }
    }, 1000);
  }

  pauseTimer() {
    if (!this.timerInterval) return;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  resetTimer() {
    this.pauseTimer();
    this.isWorkTime = true;
    this.timeLeft = this.WORK_TIME;
    this.updateTimerDisplay();
  }

  // Notifications permission and sending
  notifyUser(message) {
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

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  // Update and display task counts
  updateTaskCount() {
    const completed = this.tasks.filter(t => t.done).length;
    const total = this.tasks.length;
    this.taskCountDisplay.textContent = `Tasks: ${total} | Completed: ${completed} | Incomplete: ${total - completed}`;
  }

  renderTasks() {
    this.taskList.innerHTML = '';
    this.tasks.forEach((task, index) => {
      const li = document.createElement('li');

      // Create checkbox for complete/incomplete
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.style.marginRight = '10px';

      checkbox.addEventListener('change', e => {
        this.tasks[index].done = e.target.checked;
        this.saveTasks();
        this.renderTasks();
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
          this.tasks[index].text = newText.trim();
        }

        const newDeadline = prompt('Edit deadline (YYYY-MM-DD):', task.deadline || '');
        if (newDeadline !== null) {
          this.tasks[index].deadline = newDeadline.trim();
        }

        this.saveTasks();
        this.renderTasks();
      });

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.classList.add('delete-btn');
      delBtn.style.marginLeft = '10px';
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.tasks.splice(index, 1);
        this.saveTasks();
        this.renderTasks();
      });

      li.appendChild(editBtn);
      li.appendChild(delBtn);
      this.taskList.appendChild(li);
    });

    this.updateTaskCount();
  }

  // Task submit form handler
  handleTaskSubmit(e) {
    e.preventDefault();
    const text = this.taskInput.value.trim();
    const deadline = this.deadlineInput.value; // Added deadline from input
    if (text.length === 0) return;
    this.tasks.push({ text, deadline, done: false }); // Save task with deadline
    this.saveTasks();
    this.renderTasks();
    this.taskInput.value = '';
    this.deadlineInput.value = ''; // Clear deadline input after submit
  }

  init() {
   

    // Initialize display
    this.updateTimerDisplay();
    this.renderTasks();

    // Button event listeners
    this.startBtn.addEventListener('click', () => this.startTimer());
    this.pauseBtn.addEventListener('click', () => this.pauseTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
    this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));

    // Dark Mode Toggle Logic
    document.getElementById("dark-mode-toggle").addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }
}

// Initialize the app once DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PomodoroApp();
});





