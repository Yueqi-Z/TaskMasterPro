/**
 * tasklist.js - TaskMaster Pro Task Management Implementation
 * Version: 1.5.2
 * 
 * Change Log:
 * 1.5.2 - Improved task counter logic and added auto-update
 * 1.5.1 - Added smooth theme transition and improved synchronization
 * 1.5.0 - Added theme support and synchronization
 * 1.4.0 - Added task counter persistence
 * 1.3.0 - Added task limit and warnings
 */

// Global Constants
const APP_VERSION = '1.5.2';
const LOCAL_STORAGE_KEY = 'taskmaster_tasks_v1_3';
const COUNTER_STORAGE_KEY = 'taskmaster_counters_v1_0';
const THEME_STORAGE_KEY = 'taskmaster_theme';
const MAX_TASKS = 100;
const USER_STORAGE_KEY = 'taskmaster_user_v1_0';

class TaskManager {
    constructor() {
        // Core properties
        this.tasks = [];
        this.draggedTask = null;
        
        // Pagination properties
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
		this.TITLE_MAX_LENGTH = 50;
		
		// Counter update timer
        this.counterUpdateTimer = null;

        // Initialize the application
        this.loadTasks();
        this.initializeTheme();
        this.initializeEventListeners();
        this.initializeTaskCounters();
		this.initializeFormHandlers();
        this.initializeUserSync();
		this.initializeDevModal();
		this.addUpdateTriggers();
    }
	
	/**
	 * Initialize developer introduction modal
	 */
	initializeDevModal() {
		const logo = document.querySelector('.logo');
		const devModal = document.getElementById('devModal');
		
		if (logo && devModal) {
			logo.addEventListener('click', () => {
				devModal.removeAttribute('hidden');
			});
			
			const closeBtn = devModal.querySelector('.modal-close');
			const overlay = devModal.querySelector('.modal-overlay');
			
			const closeModal = () => {
				devModal.setAttribute('hidden', '');
			};
			
			closeBtn?.addEventListener('click', closeModal);
			overlay?.addEventListener('click', closeModal);
			
			document.addEventListener('keydown', (e) => {
				if (e.key === 'Escape' && !devModal.hasAttribute('hidden')) {
					closeModal();
				}
			});
		}
	}

    /**
     * Initialize user synchronization across tabs
     */
    initializeUserSync() {
        // Initial load
        this.updateUserDisplay();
        
        // Listen for storage events
        window.addEventListener('storage', (e) => {
            console.log('Storage event:', e.key, e.newValue);
            if (e.key === USER_STORAGE_KEY || e.key === 'lastUserUpdate') {
                this.updateUserDisplay();
            }
        });

        // Listen for direct events
        window.addEventListener('usernameUpdated', () => {
            console.log('Username updated event received');
            this.updateUserDisplay();
        });
    }

    /**
     * Update user display across all elements
     */
    updateUserDisplay() {
        try {
            const userData = localStorage.getItem(USER_STORAGE_KEY);
            console.log('Updating user display with stored data:', userData);
            
            if (userData) {
                const user = JSON.parse(userData);
                const userNameElements = document.querySelectorAll('.user-name');
                
                userNameElements.forEach(element => {
                    if (element) {
                        element.textContent = user.displayName;
                        console.log('Updated element:', element);
                    }
                });
            }
        } catch (error) {
            console.error('Error updating user display:', error);
        }
    }

	/**
	 * Initialize theme settings with smooth transition support
	 */
	initializeTheme() {
		// Set initial theme without transition
		const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
		
		// Apply initial theme without transition
		document.body.classList.add('theme-transitioning');
		document.body.classList.remove('theme-light', 'theme-dark');
		document.body.classList.add(`theme-${savedTheme}`);
		
		// Remove transitioning class after a brief delay
		requestAnimationFrame(() => {
			document.body.classList.remove('theme-transitioning');
		});

		// Listen for theme changes from other pages
		window.addEventListener('themeChanged', (e) => {
			// Add transitioning class
			document.body.classList.add('theme-transitioning');
			
			requestAnimationFrame(() => {
				// Apply new theme
				document.body.classList.remove('theme-light', 'theme-dark');
				document.body.classList.add(`theme-${e.detail.theme}`);
				
				// Remove transitioning class after transition completes
				setTimeout(() => {
					document.body.classList.remove('theme-transitioning');
				}, 200); // Match this with your CSS transition duration
			});
		});
	}

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Modal controls
        this.setupModalControls();
        
        // Pagination controls
        this.setupPaginationControls();

        // Add visibility change listener for counter updates
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.updateTaskCounts();
            }
        });

        // Add storage event listener for cross-tab synchronization
        window.addEventListener('storage', (e) => {
            if (e.key === LOCAL_STORAGE_KEY) {
                this.loadTasks();
                this.updateTaskCounts();
                this.renderTasks();
            }
        });

        // Setup filters
        this.setupFilters();

        // Initialize date display and render tasks
        this.updateDateDisplay();
        this.renderTasks();
        this.initializeDragAndDrop();
    }

    /**
     * Setup modal control event listeners
     */
    setupModalControls() {
        const addTaskBtn = document.querySelector('.add-task-btn');
        const modalCloseBtns = document.querySelectorAll('.modal-close');
        const cancelBtns = document.querySelectorAll('.cancel-btn');
        const taskModal = document.getElementById('taskModal');
        const taskForm = document.getElementById('taskForm');
        const editTaskForm = document.getElementById('editTaskForm');
        const modalOverlays = document.querySelectorAll('.modal-overlay');

        // Add task button event
        addTaskBtn?.addEventListener('click', () => {
            if (this.tasks.length >= MAX_TASKS) {
                this.showTaskLimitWarning();
                return;
            }
            this.openModal('taskModal');
        });

        // Modal close events
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal').id));
        });

        cancelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal').id));
        });

        modalOverlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal').id));
        });

        // Form submissions
        taskForm?.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        editTaskForm?.addEventListener('submit', (e) => this.handleEditTaskSubmit(e));
    }

    /**
     * Setup pagination control event listeners
     */
    setupPaginationControls() {
        const itemsPerPageSelect = document.getElementById('itemsPerPage');
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');

        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderTasks();
            });
        }

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderTasks();
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.renderTasks();
                }
            });
        }
    }

    /**
     * Setup filter event listeners
     */
    setupFilters() {
        const priorityFilter = document.querySelector('.priority-filter');
        const statusFilter = document.querySelector('.status-filter');
        const deadlineFilter = document.querySelector('.deadline-filter');
        const searchInput = document.querySelector('.search-bar input');

        priorityFilter?.addEventListener('change', () => this.applyFilters());
        statusFilter?.addEventListener('change', () => this.applyFilters());
        deadlineFilter?.addEventListener('change', () => this.applyFilters());
        searchInput?.addEventListener('input', () => this.applyFilters());
    }

    /**
     * Initialize task counters
     */
    initializeTaskCounters() {
        const savedCounters = localStorage.getItem(COUNTER_STORAGE_KEY);
        if (savedCounters) {
            const counters = JSON.parse(savedCounters);
            const lastUpdate = new Date(counters.lastUpdate);
            const now = new Date();
            
            if (lastUpdate.toDateString() === now.toDateString()) {
                this.updateCounterDisplay(counters);
            } else {
                this.updateTaskCounts();
            }
        } else {
            this.updateTaskCounts();
        }
    }

    /**
     * Update task counts and store in localStorage
     */
    updateTaskCounts() {
        const todayCount = document.querySelector('.task-counts .count-item:first-child strong');
        const upcomingCount = document.querySelector('.task-counts .count-item:last-child strong');

        if (todayCount && upcomingCount) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const counts = this.tasks.reduce((acc, task) => {
                if (task.completed) return acc;
                
                const taskDate = new Date(task.dueDate);
                const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
                
                if (taskDay.getTime() === today.getTime()) {
                    acc.today++;
                } else if (taskDay.getTime() > today.getTime()) {
                    acc.upcoming++;
                }
                
                return acc;
            }, { today: 0, upcoming: 0 });

            const counters = {
                ...counts,
                lastUpdate: now.toISOString()
            };

            this.updateCounterDisplay(counters);
            localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(counters));
            this.scheduleNextUpdate();
        }
    }
	
	/**
     * Schedule next counter update at midnight
     */
    scheduleNextUpdate() {
        if (this.counterUpdateTimer) {
            clearTimeout(this.counterUpdateTimer);
        }

        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const timeUntilMidnight = tomorrow - now;

        this.counterUpdateTimer = setTimeout(() => {
            this.updateTaskCounts();
        }, timeUntilMidnight);
    }
	
	/**
     * Add update triggers for task counters
     */
    addUpdateTriggers() {
        // Task completion status change
        document.addEventListener('taskStatusChanged', () => {
            this.updateTaskCounts();
        });

        // New task added
        document.addEventListener('taskAdded', () => {
            this.updateTaskCounts();
        });

        // Task deleted
        document.addEventListener('taskDeleted', () => {
            this.updateTaskCounts();
        });

        // Task edited
        document.addEventListener('taskEdited', () => {
            this.updateTaskCounts();
        });
    }

    /**
     * Update counter display in UI
     * @param {Object} counters - Counter values object
     */
    updateCounterDisplay(counters) {
        const todayCount = document.querySelector('.task-counts .count-item:first-child strong');
        const upcomingCount = document.querySelector('.task-counts .count-item:last-child strong');

        if (todayCount && upcomingCount) {
            todayCount.textContent = counters.today;
            upcomingCount.textContent = counters.upcoming;
        }
    }

    /**
     * Show task limit warning message
     */
    showTaskLimitWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'task-limit-warning';
        warningDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Maximum task limit (${MAX_TASKS}) reached. Please complete or remove existing tasks.</span>
        `;
        
        const taskControls = document.querySelector('.task-controls');
        const existingWarning = document.querySelector('.task-limit-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        taskControls.insertAdjacentElement('beforebegin', warningDiv);
        
        setTimeout(() => warningDiv.remove(), 5000);
    }


	/**
	 * Initialize form handlers for character counting
	 */
	initializeFormHandlers() {
		const taskTitle = document.getElementById('taskTitle');
		const editTaskTitle = document.getElementById('editTaskTitle');
		
		if (taskTitle) {
			taskTitle.addEventListener('input', (e) => this.updateCharCount(e.target));
		}
		if (editTaskTitle) {
			editTaskTitle.addEventListener('input', (e) => this.updateCharCount(e.target));
		}
	}

	/**
	 * Update character count display
	 * @param {HTMLInputElement} input - Input element to count characters
	 */
	updateCharCount(input) {
		const counter = input.parentElement.querySelector('.char-count');
		if (!counter) return;

		const length = input.value.length;
		counter.textContent = `${length}/${this.TITLE_MAX_LENGTH}`;

		counter.classList.remove('near-limit', 'at-limit');
		if (length >= this.TITLE_MAX_LENGTH) {
			counter.classList.add('at-limit');
		} else if (length >= this.TITLE_MAX_LENGTH * 0.8) {
			counter.classList.add('near-limit');
		}
	}

	/**
	 * Handle new task submission
	 * @param {Event} e - Form submit event
	 */
	handleTaskSubmit(e) {
		e.preventDefault();
		
		if (this.tasks.length >= MAX_TASKS) {
			this.showTaskLimitWarning();
			return;
		}
		
		const formData = new FormData(e.target);
		const title = formData.get('taskTitle').trim();
		
		// Validate title length
		if (title.length === 0 || title.length > this.TITLE_MAX_LENGTH) {
			return;
		}

		const task = {
			id: Date.now().toString(),
			title: title,
			description: formData.get('taskDesc'),
			dueDate: formData.get('taskDue'),
			priority: formData.get('taskPriority'),
			completed: false,
			createdAt: new Date().toISOString()
		};

		this.addTask(task);
		this.closeModal('taskModal');
		e.target.reset();
	}

    /**
     * Handle edit task submission
     * @param {Event} e - Form submit event
     */
    handleEditTaskSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const title = formData.get('taskTitle').trim();
        
        if (title.length === 0 || title.length > this.TITLE_MAX_LENGTH) {
            return;
        }
        
        const taskId = formData.get('taskId');
        const task = this.tasks.find(t => t.id === taskId);
        
        if (task) {
            task.title = title;
            task.description = formData.get('taskDesc');
            task.dueDate = formData.get('taskDue');
            task.priority = formData.get('taskPriority');
            
            this.saveTasks();
            this.renderTasks();
            this.closeModal('editTaskModal');
            // Dispatch task edited event
            document.dispatchEvent(new Event('taskEdited'));
        }
    }


    /**
     * Add a new task
     * @param {Object} task - Task object to add
     */
    addTask(task) {
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
        // Dispatch task added event
        document.dispatchEvent(new Event('taskAdded'));
    }

    /**
     * Delete a task
     * @param {string} taskId - ID of task to delete
     */
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
        // Dispatch task deleted event
        document.dispatchEvent(new Event('taskDeleted'));
    }

    /**
     * Toggle task completion status
     * @param {string} taskId - ID of task to toggle
     */
    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                if (task.completed) {
                    taskElement.classList.add('completed', 'just-completed');
                    setTimeout(() => taskElement.classList.remove('just-completed'), 300);
                } else {
                    taskElement.classList.remove('completed');
                }
            }
            
            this.saveTasks();
            this.updateTaskCounts();
            // Dispatch task status change event
            document.dispatchEvent(new Event('taskStatusChanged'));
        }
    }

    /**
     * Edit a task
     * @param {string} taskId - ID of task to edit
     */
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const editForm = document.getElementById('editTaskForm');
        editForm.elements['taskId'].value = task.id;
        editForm.elements['taskTitle'].value = task.title;
        editForm.elements['taskDesc'].value = task.description;
        editForm.elements['taskDue'].value = task.dueDate;
        editForm.elements['taskPriority'].value = task.priority;

        this.openModal('editTaskModal');
    }

	/**
     * Render tasks to the UI
     */
    renderTasks() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;

        const filteredTasks = this.getFilteredTasks();
        const paginatedTasks = this.getPaginatedTasks(filteredTasks);
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <h3>No Tasks Found</h3>
                    <p>${this.getEmptyStateMessage()}</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = paginatedTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" 
                 draggable="true" 
                 data-task-id="${task.id}">
                <div class="task-drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="12" r="1"/>
                        <circle cx="9" cy="5" r="1"/>
                        <circle cx="9" cy="19" r="1"/>
                        <circle cx="15" cy="12" r="1"/>
                        <circle cx="15" cy="5" r="1"/>
                        <circle cx="15" cy="19" r="1"/>
                    </svg>
                </div>
                <div class="task-content">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${task.completed ? 'checked' : ''}>
                    <div class="task-details">
                        <h3>${this.escapeHtml(task.title)}</h3>
                        <p>${this.escapeHtml(task.description || '')}</p>
                    </div>
                </div>
                <div class="task-meta">
                    <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>
                    <span class="due-date">${this.formatDate(task.dueDate)}</span>
                    <div class="task-actions">
                        <button class="btn btn-edit btn-icon" aria-label="Edit task">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-danger-text btn-icon" aria-label="Delete task">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.addTaskEventListeners();
        this.initializeDragAndDrop();
        this.updatePaginationControls();
    }

    /**
     * Get empty state message based on current filters
     * @returns {string} Empty state message
     */
    getEmptyStateMessage() {
        const priorityFilter = document.querySelector('.priority-filter').value;
        const statusFilter = document.querySelector('.status-filter').value;
        const searchText = document.querySelector('.search-bar input').value;

        if (searchText) {
            return `No tasks found matching "${searchText}"`;
        } else if (priorityFilter !== 'all' || statusFilter !== 'all') {
            return 'No tasks match the selected filters';
        }
        return 'Create your first task to get started!';
    }

    /**
     * Get paginated tasks
     * @param {Array} tasks - Array of tasks to paginate
     * @returns {Array} Paginated tasks
     */
    getPaginatedTasks(tasks) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.totalPages = Math.ceil(tasks.length / this.itemsPerPage);
        
        return tasks.slice(startIndex, endIndex);
    }

    /**
     * Update pagination controls state
     */
    updatePaginationControls() {
        const currentPageSpan = document.getElementById('currentPage');
        const totalPagesSpan = document.getElementById('totalPages');
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');

        if (currentPageSpan) currentPageSpan.textContent = this.currentPage;
        if (totalPagesSpan) totalPagesSpan.textContent = this.totalPages;
        
        if (prevPageBtn) prevPageBtn.disabled = this.currentPage <= 1;
        if (nextPageBtn) nextPageBtn.disabled = this.currentPage >= this.totalPages;
    }

    /**
     * Add event listeners to task items
     */
    addTaskEventListeners() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            const taskId = item.dataset.taskId;
            const checkbox = item.querySelector('.task-checkbox');
            const deleteBtn = item.querySelector('.btn-danger-text');
            const editBtn = item.querySelector('.btn-edit');

            checkbox?.addEventListener('change', () => this.toggleTaskComplete(taskId));
            deleteBtn?.addEventListener('click', () => this.deleteTask(taskId));
            editBtn?.addEventListener('click', () => this.editTask(taskId));
        });
    }

    /**
     * Get filtered tasks based on current filters
     * @returns {Array} Filtered tasks
     */
    getFilteredTasks() {
        const priorityFilter = document.querySelector('.priority-filter').value;
        const statusFilter = document.querySelector('.status-filter').value;
        const deadlineFilter = document.querySelector('.deadline-filter').value;
        const searchText = document.querySelector('.search-bar input').value.toLowerCase();

        return this.tasks.filter(task => {
            const matchesPriority = priorityFilter === 'all' || task.priority.toLowerCase() === priorityFilter;
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'completed' && task.completed) || 
                (statusFilter === 'pending' && !task.completed);
            const matchesSearch = task.title.toLowerCase().includes(searchText) || 
                                task.description?.toLowerCase().includes(searchText);
            const matchesDeadline = this.checkDeadlineFilter(task, deadlineFilter);

            return matchesPriority && matchesStatus && matchesSearch && matchesDeadline;
        });
    }

    /**
     * Check if task matches deadline filter
     * @param {Object} task - Task to check
     * @param {string} filter - Deadline filter value
     * @returns {boolean} Whether task matches filter
     */
    checkDeadlineFilter(task, filter) {
        if (filter === 'all') return true;
        
        const today = new Date();
        const taskDate = new Date(task.dueDate);
        const diffDays = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));

        switch (filter) {
            case 'today':
                return diffDays === 0;
            case 'week':
                return diffDays >= 0 && diffDays <= 7;
            case 'overdue':
                return diffDays < 0;
            default:
                return true;
        }
    }

    /**
     * Apply filters and reset pagination
     */
    applyFilters() {
        this.currentPage = 1; // Reset to first page when filters change
        this.renderTasks();
    }

    /**
     * Update current date display
     */
    updateDateDisplay() {
        const dateDisplay = document.querySelector('.current-date');
        if (dateDisplay) {
            dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    /**
     * Format date for display
     * @param {string} dateString - Date string to format
     * @returns {string} Formatted date string
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    /**
     * Escape HTML special characters
     * @param {string} unsafe - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Open modal dialog
     * @param {string} modalId - ID of modal to open
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.removeAttribute('hidden');
        }
    }

    /**
     * Close modal dialog
     * @param {string} modalId - ID of modal to close
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.setAttribute('hidden', '');
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

	/**
	 * Initialize drag and drop functionality with mobile support
	 */
	initializeDragAndDrop() {
		const taskList = document.getElementById('taskList');
		if (!taskList) return;

		let touchStartY, initialY;
		let activeItem = null;
		let initialOrder = [];

		taskList.addEventListener('touchstart', (e) => {
			if (e.target.closest('.task-actions') || e.target.closest('.task-checkbox')) {
				return;
			}

			const item = e.target.closest('.task-item');
			if (!item) return;

			touchStartY = e.touches[0].clientY;
			initialY = item.offsetTop;
			
			// Delay drag activation to distinguish between tap and drag
			setTimeout(() => {
				if (Math.abs(e.touches[0].clientY - touchStartY) > 5) {
					activeItem = item;
					item.classList.add('dragging');
					item.style.zIndex = '1000';
					
					// Save initial order
					initialOrder = Array.from(taskList.querySelectorAll('.task-item'));
				}
			}, 100);
		});

		taskList.addEventListener('touchmove', (e) => {
			if (!activeItem) return;

			e.preventDefault();
			const currentY = e.touches[0].clientY;
			const deltaY = currentY - touchStartY;
			
			activeItem.style.transform = `translateY(${deltaY}px)`;
			
			// Update other items position
			const siblings = Array.from(taskList.querySelectorAll('.task-item:not(.dragging)'));
			siblings.forEach(sibling => {
				const rect = sibling.getBoundingClientRect();
				if (currentY < rect.top + rect.height / 2) {
					taskList.insertBefore(activeItem, sibling);
				}
			});
		});

		taskList.addEventListener('touchend', () => {
			if (!activeItem) return;
			
			activeItem.classList.remove('dragging');
			activeItem.style.transform = '';
			activeItem.style.zIndex = '';
			
			this.updateTaskOrder();
			activeItem = null;
		});

		// Keep desktop drag and drop functionality
		const taskItems = taskList.querySelectorAll('.task-item');
		taskItems.forEach(item => {
			this.addDragListeners(item);
		});
	}

    /**
     * Add drag event listeners to task item
     * @param {HTMLElement} item - Task item element
     */
    addDragListeners(item) {
        item.addEventListener('dragstart', (e) => {
            item.classList.add('dragging');
            this.draggedTask = item.dataset.taskId;
            
            requestAnimationFrame(() => {
                item.style.opacity = '0.5';
                document.querySelectorAll('.task-item').forEach(task => {
                    if (task !== item) {
                        task.style.transform = 'scale(1)';
                        task.style.transition = 'transform 0.2s ease';
                    }
                });
            });
        });

        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
            item.style.opacity = '1';
            
            document.querySelectorAll('.task-item').forEach(task => {
                task.style.transform = '';
                task.style.transition = '';
            });

            this.updateTaskOrder();
        });

        item.addEventListener('dragenter', (e) => {
            if (item !== document.querySelector('.dragging')) {
                item.style.transform = 'scale(1.02)';
            }
        });

        item.addEventListener('dragleave', (e) => {
            if (item !== document.querySelector('.dragging')) {
                item.style.transform = 'scale(1)';
            }
        });
    }

    /**
     * Get element after dragged position
     * @param {HTMLElement} container - Container element
     * @param {number} y - Mouse Y position
     * @returns {HTMLElement|null} Element to insert after
     */
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    /**
     * Update task order after drag and drop
     */
    updateTaskOrder() {
        const taskElements = document.querySelectorAll('.task-item');
        const newTasksOrder = [];
        
        taskElements.forEach(element => {
            const taskId = element.dataset.taskId;
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                newTasksOrder.push(task);
            }
        });

        this.tasks = newTasksOrder;
        this.saveTasks();
    }

    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.tasks));
            this.updateTaskCounts();
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

/**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
            this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
    window.taskManager.initializeUserSync(); // Explicitly call after initialization
    console.log(`TaskMaster Pro v${APP_VERSION} initialized`);
});