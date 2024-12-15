# TaskMaster Pro

A modern, responsive task management application with calendar integration, user profile management, and theme support. Built as a final project for the LIS 640 Web Development course at the University of Wisconsin-Madison.

## Key Features

### Task Management
- Create, edit, and delete tasks with real-time updates
- Priority levels (High, Medium, Low) with visual indicators
- Due date scheduling with time support
- Task completion tracking with visual feedback
- Drag-and-drop task reordering (desktop and mobile support)
- Advanced task filtering system:
  - Priority-based filtering
  - Status-based filtering (Pending/Completed)
  - Deadline-based filtering (Today/This Week/Overdue)
  - Full-text search across task titles and descriptions
- Pagination with configurable items per page
- Maximum task limit (100) with user warnings
- Character limit enforcement for task titles (50 characters)

### Calendar View
- Interactive monthly calendar visualization
- Dynamic task previews on calendar days
- Task overflow management with "more tasks" indicator
- Quick task preview modal with complete details
- Day preview modal for dates with multiple tasks
- Month navigation with smooth transitions
- Today highlighting and quick navigation
- Responsive design with mobile-optimized layout

### User Profile
- Editable user information (display name, email)
- Theme customization:
  - Light/Dark theme toggle
  - Smooth theme transitions
  - Cross-tab theme synchronization
- Comprehensive task statistics:
  - Total tasks counter
  - Pending tasks tracking
  - Completed tasks metrics
  - Overdue tasks monitoring
- Data management options:
  - Full data reset capability

### Performance Optimizations
- Debounced search
- Optimized paint performance
- Efficient DOM updates
- Smooth animations and transitions

## Project Structure
```
taskmaster-pro/
├── css/
│   ├── global.css      # Global styles, theme variables, and shared components
│   ├── tasklist.css    # Task list view styles
│   ├── calendar.css    # Calendar view styles
│   └── profile.css     # Profile page styles
├── js/
│   ├── tasklist.js     # Task management logic
│   ├── calendar.js     # Calendar view functionality
│   └── profile.js      # Profile management
└── html/
    ├── index.html      # Task list view
    ├── calendar.html   # Calendar view
    └── profile.html    # User profile

```

## Development
This project is developed as part of the LIS 640 Web Development course at the University of Wisconsin-Madison.

## Links
- [GitHub Repository](https://github.com/Yueqi-Z)

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/Yueqi-Z/TaskMasterPro)