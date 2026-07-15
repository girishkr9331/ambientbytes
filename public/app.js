/* -------------------------------------------------------------
 * Taskly Client - Notion-Style AJAX/Fetch REST CRUD Interactivity
 * Handles real-time search, filters, peek modal, and notifications
 * ------------------------------------------------------------- */

// State Management
const state = {
  tasks: [],
  filters: {
    search: '',
    status: 'all', // 'all', 'pending', 'completed'
    category: 'all'
  }
};

// API Endpoint configuration
const API_URL = '/api/tasks';

// DOM Elements
const tasksLoader = document.getElementById('tasks-loader');
const tasksGridContainer = document.getElementById('tasks-grid-container');
const tasksEmptyState = document.getElementById('tasks-empty-state');
const toastContainer = document.getElementById('toast-container');

// Stats Elements
const statsTotal = document.getElementById('stats-total');
const statsPending = document.getElementById('stats-pending');
const statsPercent = document.getElementById('stats-percent');

// Form & Modal Elements
const taskModal = document.getElementById('task-modal');
const modalTitle = document.getElementById('modal-title');
const taskForm = document.getElementById('task-form');
const formTaskId = document.getElementById('form-task-id');
const formTitle = document.getElementById('form-title');
const formDescription = document.getElementById('form-description');
const formCategory = document.getElementById('form-category');
const formDueDate = document.getElementById('form-due-date');

// Sidebar Filters
const searchInput = document.getElementById('search-input');
const categoryPillsList = document.getElementById('category-pills-list');

/* ==========================================
 * Toast Alerts System
 * ========================================== */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = `<svg class="toast-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2383e2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  if (type === 'success') {
    icon = `<svg class="toast-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    icon = `<svg class="toast-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-content">${message}</span>
    <button class="toast-close">&times;</button>
  `;

  // Close event
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  });

  toastContainer.appendChild(toast);

  // Auto-remove toast after 3s
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

/* ==========================================
 * Data Fetch & Save (API CRUD Calls)
 * ========================================== */

// GET - Read all tasks
async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network response not ok');
    state.tasks = await response.json();

    // Hide loader
    tasksLoader.style.display = 'none';

    updateStats();
    renderCategories();
    renderTasks();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    showToast('Failed to load tasks from server API.', 'error');
    tasksLoader.querySelector('p').textContent = 'Server Connection Offline';
    tasksLoader.querySelector('.spinner').style.borderTopColor = 'var(--priority-high)';
  }
}

// POST - Create a new task
async function createTask(taskData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create task');
    }
    const newTask = await response.json();

    // Add to local state
    state.tasks.unshift(newTask);

    showToast(`Created task: ${newTask.title}`, 'success');
    closeModal();
    updateStats();
    renderCategories();
    renderTasks();
  } catch (error) {
    console.error('Error creating task:', error);
    showToast(error.message || 'Failed to save task to server API.', 'error');
  }
}

// PUT - Update a task
async function updateTask(id, updatedFields, isSilent = false) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update task');
    }
    const updatedTask = await response.json();

    // Sync with local state
    const index = state.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      state.tasks[index] = updatedTask;
    }

    if (!isSilent) {
      showToast(`Updated task details.`, 'success');
      closeModal();
    }
    updateStats();
    renderCategories();
    renderTasks();
  } catch (error) {
    console.error('Error updating task:', error);
    showToast(error.message || 'Failed to update task on server API.', 'error');
    fetchTasks(); // Reload status on error
  }
}

// DELETE - Remove task
async function deleteTask(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete task');

    state.tasks = state.tasks.filter(t => t.id !== id);

    showToast('Deleted task.', 'success');
    updateStats();
    renderCategories();
    renderTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
    showToast('Failed to delete task from server API.', 'error');
  }
}

/* ==========================================
 * UI Rendering & Logic Helpers
 * ========================================== */

// Update Dashboard Stats badges
function updateStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  statsTotal.textContent = total;
  statsPending.textContent = pending;
  statsPercent.textContent = `${percent}%`;
}

// Render dynamic Category list sidebar items
function renderCategories() {
  const categories = state.tasks.reduce((acc, task) => {
    if (task.category && task.category.trim() !== '') {
      acc.add(task.category.trim());
    }
    return acc;
  }, new Set());

  const activeCat = state.filters.category;
  let html = `<button class="pill-btn ${activeCat === 'all' ? 'active' : ''}" data-category="all">All categories</button>`;

  Array.from(categories).sort().forEach(cat => {
    html += `<button class="pill-btn ${activeCat === cat ? 'active' : ''}" data-category="${cat}">${cat}</button>`;
  });

  categoryPillsList.innerHTML = html;

  // Add click filters
  categoryPillsList.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      categoryPillsList.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filters.category = btn.getAttribute('data-category');
      renderTasks();
    });
  });
}

// Filter tasks and render list rows
function renderTasks() {
  const filtered = state.tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(state.filters.search.toLowerCase());

    let matchesStatus = true;
    if (state.filters.status === 'pending') matchesStatus = !task.completed;
    if (state.filters.status === 'completed') matchesStatus = task.completed;

    let matchesCategory = true;
    if (state.filters.category !== 'all') {
      matchesCategory = task.category === state.filters.category;
    }

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (filtered.length === 0) {
    tasksGridContainer.style.display = 'none';
    tasksEmptyState.style.display = 'flex';
    return;
  }

  tasksEmptyState.style.display = 'none';
  tasksGridContainer.style.display = 'flex';
  tasksGridContainer.innerHTML = '';

  filtered.forEach(task => {
    const row = document.createElement('div');
    row.className = `task-row ${task.completed ? 'completed' : ''}`;
    row.setAttribute('data-id', task.id);

    // Format date
    let dateHTML = '';
    if (task.dueDate) {
      const parts = task.dueDate.split('-');
      const formattedDate = new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(parts[0], parts[1] - 1, parts[2]);
      const isOverdue = due < today && !task.completed;

      dateHTML = `
        <span class="task-date ${isOverdue ? 'overdue' : ''}">
           ${formattedDate}${isOverdue ? ' (Overdue)' : ''}
        </span>
      `;
    }

    // Row layout
    row.innerHTML = `
      <div class="task-left">
        <label class="task-chk-wrapper">
          <input type="checkbox" class="task-checkbox-input" ${task.completed ? 'checked' : ''}>
          <span class="task-custom-checkbox">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>
        <span class="task-title">${escapeHTML(task.title)}</span>
      </div>
      
      <div class="task-right">
        <div class="task-tags">
          <span class="badge badge-category">${escapeHTML(task.category)}</span>
          <span class="badge badge-priority priority-${task.priority}">${task.priority}</span>
        </div>
        ${dateHTML}
        
        <div class="task-actions">
          <button class="action-btn btn-edit" title="Open details">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="action-btn btn-delete" title="Delete task">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // 1. Checkbox toggle event
    const checkbox = row.querySelector('.task-checkbox-input');
    checkbox.addEventListener('change', (e) => {
      const isCompleted = e.target.checked;

      // Visual feedback
      if (isCompleted) {
        row.classList.add('completed');
      } else {
        row.classList.remove('completed');
      }

      updateTask(task.id, { completed: isCompleted }, true);
    });

    // Prevent checkbox wrapper click from opening the modal
    row.querySelector('.task-chk-wrapper').addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 2. Click left part (title/row) opens Peek View edit modal
    row.querySelector('.task-left').addEventListener('click', () => {
      openEditModal(task);
    });

    // 3. Edit button click
    row.querySelector('.btn-edit').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(task);
    });

    // 4. Delete task
    row.querySelector('.btn-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Delete task "${task.title}"?`)) {
        row.style.transition = 'all 0.2s';
        row.style.opacity = '0';
        row.style.transform = 'translateY(5px)';
        setTimeout(() => {
          deleteTask(task.id);
        }, 200);
      }
    });

    tasksGridContainer.appendChild(row);
  });
}

// Escapes special characters to prevent HTML injection
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================
 * Modal Open / Close Controllers
 * ========================================== */

function openCreateModal() {
  modalTitle.textContent = 'New Task';
  formTaskId.value = '';
  taskForm.reset();

  // Set default due date to today
  const today = new Date().toISOString().split('T')[0];
  formDueDate.value = today;

  taskForm.querySelector('input[name="priority"][value="medium"]').checked = true;

  taskModal.style.display = 'flex';
  formTitle.focus();
}

function openEditModal(task) {
  modalTitle.textContent = 'Task Details';
  formTaskId.value = task.id;
  formTitle.value = task.title;
  formDescription.value = task.description;
  formCategory.value = task.category;
  formDueDate.value = task.dueDate || '';

  const pInput = taskForm.querySelector(`input[name="priority"][value="${task.priority}"]`);
  if (pInput) pInput.checked = true;

  taskModal.style.display = 'flex';
  formTitle.focus();
}

function closeModal() {
  taskModal.style.display = 'none';
  taskForm.reset();
}

/* ==========================================
 * Event Listeners Registration
 * ========================================== */

// Triggers
document.getElementById('btn-open-create-modal').addEventListener('click', openCreateModal);
document.getElementById('btn-empty-create').addEventListener('click', openCreateModal);

// Closers
document.getElementById('btn-close-modal').addEventListener('click', closeModal);
document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
taskModal.addEventListener('click', (e) => {
  if (e.target === taskModal) closeModal();
});

// Form Submit
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = formTitle.value;
  const description = formDescription.value;
  const category = formCategory.value || 'General';
  const dueDate = formDueDate.value || null;
  const priority = taskForm.querySelector('input[name="priority"]:checked').value;

  const taskData = { title, description, category, dueDate, priority };
  const taskId = formTaskId.value;

  if (taskId) {
    updateTask(taskId, taskData);
  } else {
    createTask(taskData);
  }
});

// Real-time filters
searchInput.addEventListener('input', (e) => {
  state.filters.search = e.target.value;
  renderTasks();
});

// Status tabs sidebar click
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    state.filters.status = item.getAttribute('data-status');
    renderTasks();
  });
});

/* ==========================================
 * App Init Trigger
 * ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();
});
