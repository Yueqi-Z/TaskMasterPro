# TaskMaster Pro

A modern task management application with calendar integration, user profile management, and theme support.

## Features

### Task Management
- Create, edit, and delete tasks
- Priority levels (High, Medium, Low)
- Due date scheduling
- Task completion tracking
- Drag-and-drop task reordering
- Task filtering and search capabilities
- Cross-tab task counter synchronization
- Maximum task limit handling (100 tasks)

### Calendar View
- Monthly calendar visualization
- Task preview on calendar days
- Quick task viewing
- Navigate between months
- Today highlighting
- Responsive task overflow handling

### User Profile
- Customizable user information
- Dark/Light theme switching with global synchronization
- Comprehensive task statistics dashboard:
  - Total tasks counter
  - Pending tasks tracking
  - Completed tasks metrics
  - Overdue tasks monitoring
- Granular data management options

### Developer Information
- Quick access to developer information via logo click
- Direct links to:
  - GitHub Profile
  - Project Demo
- Integrated with both light and dark themes
- Responsive design for all devices

## Technical Implementation

### CSS Architecture
- CSS custom properties for theming
- Responsive design with mobile-first approach
- Modular component styling
- Integrated dark theme support
- Consistent spacing and color systems

### JavaScript Components
- `TaskManager`: Core task CRUD operations
- `CalendarManager`: Calendar view and task visualization
- `ProfileManager`: User preferences and statistics management

### Data Management
- Local storage for persistence
- Version-controlled data structure
- Cross-tab state synchronization
- Theme preference persistence

## Project Structure
taskmaster-pro/
├── css/
│   ├── global.css      # Global styles and theme variables
│   ├── tasklist.css    # Task list specific styles
│   ├── calendar.css    # Calendar view styles
│   └── profile.css     # Profile page styles
├── js/
│   ├── tasklist.js     # Task management logic
│   ├── calendar.js     # Calendar view functionality
│   └── profile.js      # Profile management
└── pages/
├── index.html      # Task list view
├── calendar.html   # Calendar view
└── profile.html    # User profile




[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/Yueqi-Z/TaskMasterPro)