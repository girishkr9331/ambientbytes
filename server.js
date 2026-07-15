const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3050;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions for file operations
async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Return empty array if file does not exist
      return [];
    }
    throw error;
  }
}

async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// Generate unique custom ID
function generateId() {
  return 'task-' + Math.random().toString(36).substr(2, 9);
}

// REST API Endpoints

// 1. GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    // Sort by createdAt descending so newest are on top
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(tasks);
  } catch (error) {
    console.error('Error reading tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// 2. GET a single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to retrieve task' });
  }
});

// 3. POST - Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, category, priority, dueDate } = req.body;

    // Simple validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const tasks = await readTasks();

    const newTask = {
      id: generateId(),
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim() : 'General',
      priority: priority || 'medium', // low, medium, high
      dueDate: dueDate || null,
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    await writeTasks(tasks);

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// 4. PUT - Update a task (handles full updates or single field toggles like completion)
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, completed } = req.body;
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Merge changes
    const existingTask = tasks[taskIndex];
    const updatedTask = {
      ...existingTask,
      title: title !== undefined ? title.trim() : existingTask.title,
      description: description !== undefined ? description.trim() : existingTask.description,
      category: category !== undefined ? category.trim() : existingTask.category,
      priority: priority !== undefined ? priority : existingTask.priority,
      dueDate: dueDate !== undefined ? dueDate : existingTask.dueDate,
      completed: completed !== undefined ? !!completed : existingTask.completed,
      updatedAt: new Date().toISOString()
    };

    // Validation check on title if it is being updated
    if (title !== undefined && updatedTask.title === '') {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }

    tasks[taskIndex] = updatedTask;
    await writeTasks(tasks);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// 5. DELETE - Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await readTasks();
    const initialLength = tasks.length;
    const filteredTasks = tasks.filter(t => t.id !== req.params.id);

    if (filteredTasks.length === initialLength) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await writeTasks(filteredTasks);
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Redirect root to public index.html (express.static handles this, but adding a fallback)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`* Taskly Backend running at: http://localhost:${PORT}`);
  console.log(`* Static files served from public directory`);
  console.log(`* Database persistence: ${DATA_FILE}`);
  console.log(`==================================================`);
});
