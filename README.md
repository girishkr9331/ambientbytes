# Taskly

## Key Features

- RESTful CRUD API for task management
- Persistent task storage using a local JSON file (`data/tasks.json`)
- Responsive frontend dashboard with:
  - Add, edit, and delete tasks
  - Search and filter by status and category
  - Automatic task completion toggle
  - Task statistics and progress tracking
- Clean UI inspired by Notion-style workspace layouts

## Project Structure

- `server.js` - Express backend server with API routes
- `package.json` - Project metadata and npm scripts
- `public/` - Frontend assets
  - `index.html` - Main task manager UI
  - `app.js` - Client-side logic for fetching and rendering tasks
  - `style.css` - UI styling
- `data/tasks.json` - Stored tasks data file (created automatically)

## Tech Stack

- Node.js
- Express
- CORS
- Vanilla JavaScript, HTML, and CSS

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open the app in your browser:

```text
http://localhost:3000
```

## API Endpoints

- `GET /api/tasks` - Retrieve all tasks
- `GET /api/tasks/:id` - Retrieve a single task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update an existing task
- `DELETE /api/tasks/:id` - Delete a task

## How It Works

- The frontend serves static assets from `public/`.
- Task data is loaded from `data/tasks.json` through the API.
- User actions on the UI call the API to create, update, or delete tasks.
- After each API action, the frontend refreshes the task list, filters, and statistics.

## Internship Presentation Highlights

- Demonstrates a complete full-stack CRUD workflow
- Shows integration between a REST API and a dynamic frontend
- Includes real-time task filtering and status tracking
- Uses a simple file-based persistence layer for quick prototyping

## Notes

- The project is ideal for learning how frontend and backend communicate in a full-stack JavaScript app.
- No database is required; tasks are saved locally in `data/tasks.json`. If the file is missing, the server initializes an empty task list automatically.

## Future Improvements

- Add user authentication
- Replace file storage with a database (MongoDB, SQLite, etc.)
- Improve mobile-specific responsiveness
- Add due date reminders and drag-and-drop task ordering
