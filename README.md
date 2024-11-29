# TaskMasterPro

## 1. Design Principles

- **Simplicity First**: Focus on essential features without overwhelming users
- **Desktop-Optimized**: Primary focus on web browser experience
- **No Redundancy**: Each page serves a distinct purpose
- **Responsive Support**: Maintains functionality on mobile while optimizing for desktop

## 2. Page Structure and Core Features

folder structure:
/
├── index.html
├── calendar.html
├── profile.html
├── css/
│   ├── global.css
│   ├── tasklist.css
│   ├── calendar.css
│   └── profile.css
└── js/
    ├── tasklist.js
    ├── calendar.js
    └── profile.js

### 2.1 Main Task List Page (index.html)

**Primary Purpose**: Daily task management and organization

**Core Features**:

1. Task Management
   - Create, edit, delete tasks
   - Mark tasks as complete（improve the visual feedback for completed tasks）
   - Drag-and-drop reordering
   - Pagination implementation
   - Task limit handling 
   - empty state handling for task list

2. Task Organization
   - Search functionality
   - Essential filters:
     * Priority (High/Medium/Low)
     * Status (Pending/Completed)
     * Deadline (Today/Week/Overdue)
   - Sort options (Deadline/Priority/Title)

3. Task Information
   - Title and description
   - Due date and time
   - Priority level
   - Completion status

4. Status Overview
   - Current date
   - Tasks due today count
   - Upcoming tasks count

### 2.2 Calendar Page (calendar.html)

**Primary Purpose**: Timeline visualization and date-based task planning

**Core Features**:

1. Calendar Navigation
   - Monthly view
   - Previous/Next month navigation
   - "Today" quick access
   - the calendar page itself does not provide functionality for creating and editing tasks. 
2. Task Visualization
   - Date-based task display
   - Implementing task preview functionality（Adding expandable day cells for multiple tasks）
   - Visual priority indicators
   - Ensuring proper date navigation and today's date highlighting

### 2.3 Profile Page (profile.html)

**Primary Purpose**: User settings and task statistics

**Core Features**:

1. User Identity
   - Display name
   - Display Account information(mailbox)
   - Modify mailbox, prompt will reset data
2. Task Statistics
   - Total tasks
   - Pending tasks
   - Upcoming deadlines
3. Essential Settings
   - Theme preference (Consider simplifying the design: e.g. theme switching only works on the navigation bar, etc.)
   - Reset：  Clears all tasks(Resets statistics automatically since they're derived from tasks) 
   - Use folding design if necessary considering pc screen size

## 3. Simplified Navigation

```
Global Header (All Pages):
- Logo
- Main Navigation (Tasks/Calendar/Profile)
- Current User Display
- Logout Option
```

## 4. Key Design Decisions

### 4.1 Feature Distribution

- No duplicate task creation across pages
- Calendar view is read-only
- Settings consolidated in profile page

### 4.2 Priority Desktop Features

- Larger click/touch targets
- Hover states for interactive elements
- Full-width layout utilization
- Keyboard shortcuts support

### 4.3 Mobile Adaptations

- Collapsible filters
- Simplified calendar view
- Stack layouts for forms
- Touch-friendly tap targets



[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/Yueqi-Z/TaskMasterPro)