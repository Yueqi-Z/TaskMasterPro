/**
 * profile.js - TaskMaster Pro Profile Implementation
 * Version: 1.2.3
 * 
 * Change Log:
 * 1.2.3 - Fixed overdue tasks calculation to include today's expired tasks
 * 1.2.2 - Fixed user data synchronization across pages and enhanced data validation
 * 1.2.1 - Added smooth theme transition handling
 * 1.2.0 - Added global theme management
 * 1.1.0 - Modified email update and statistics features
 */
// Global Constants
const APP_VERSION = '1.2.2';
const LOCAL_STORAGE_KEY = 'taskmaster_tasks_v1_3';     // Shared with task management
const USER_STORAGE_KEY = 'taskmaster_user_v1_0';       // User data storage key
const THEME_STORAGE_KEY = 'taskmaster_theme';          // Theme preference storage
const DEFAULT_USER = {
    displayName: 'John Doe',
    email: 'john.doe@example.com'
};

class ProfileManager {
    /**
     * Initialize ProfileManager with default settings and event listeners
     */
    constructor() {
        // Initialize core user properties with defaults
        this.user = {
            ...DEFAULT_USER,
            theme: localStorage.getItem(THEME_STORAGE_KEY) || 'light'
        };

        // Set up cross-tab synchronization
        window.addEventListener('storage', (e) => {
            if (e.key === USER_STORAGE_KEY) {
                this.loadUserData();
                this.updateUserDisplay();
                this.updateProfileFields();
            }
        });

        // Initialize all components
        this.loadUserData();
        this.initializeEventListeners();
        this.updateStatistics();
        this.initializeTheme();
        this.updateUserDisplay();
        this.updateProfileFields();
        this.initializeDevModal();
    }

    /**
     * Initialize developer introduction modal functionality
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
     * Initialize user synchronization across browser tabs
     */
    initializeUserSync() {
        this.updateUserDisplay();
        
        // Listen for storage events from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === USER_STORAGE_KEY || e.key === 'lastUserUpdate') {
                this.updateUserDisplay();
            }
        });

        // Listen for direct username update events
        window.addEventListener('usernameUpdated', () => {
            this.updateUserDisplay();
        });
    }

    /**
     * Update user display elements across the interface
     */
    updateUserDisplay() {
        try {
            const userData = localStorage.getItem(USER_STORAGE_KEY);
            if (userData) {
                const user = JSON.parse(userData);
                const userNameElements = document.querySelectorAll('[data-user-display="true"]');
                userNameElements.forEach(element => {
                    if (element) {
                        element.textContent = user.displayName;
                    }
                });
            }
        } catch (error) {
            console.error('Error updating user display:', error);
        }
    }

    /**
     * Update profile fields with current user data
     */
    updateProfileFields() {
        const nameField = document.querySelector('.profile-name');
        const emailField = document.querySelector('.profile-email');
        
        if (nameField) {
            nameField.textContent = this.user.displayName;
        }
        if (emailField) {
            emailField.textContent = this.user.email;
        }
    }

    /**
     * Initialize all event listeners for profile functionality
     */
    initializeEventListeners() {
        // Settings section toggle
        const settingsSection = document.querySelector('.settings-section');
        const toggleBtn = settingsSection?.querySelector('.section-toggle');
        toggleBtn?.addEventListener('click', () => this.toggleSettingsSection(settingsSection));

        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle?.addEventListener('change', (e) => this.handleThemeChange(e));

        // Profile editing
        const editBtns = document.querySelectorAll('.edit-btn');
        editBtns[0]?.addEventListener('click', () => this.startEditing('name'));
        editBtns[1]?.addEventListener('click', () => this.openModal('emailModal'));

        // Initialize modal handlers
        this.initializeModalHandlers();

        // Reset data button
        const resetDataBtn = document.querySelector('.reset-data-btn');
        resetDataBtn?.addEventListener('click', () => this.openModal('resetModal'));

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        logoutBtn?.addEventListener('click', () => this.handleLogout());
    }

	/**
	 * Initialize theme settings 
	 */
	initializeTheme() {
		const savedTheme = this.user.theme;
		
		// Apply initial theme without transition
		document.body.classList.add('theme-transitioning');
		document.body.classList.remove('theme-light', 'theme-dark');
		document.body.classList.add(`theme-${savedTheme}`);
		
		// Remove transitioning class after a brief delay
		requestAnimationFrame(() => {
			document.body.classList.remove('theme-transitioning');
		});
		
		const themeToggle = document.querySelector('.theme-toggle');
		if (themeToggle) {
			themeToggle.value = savedTheme;
		}
		
		// Listen for theme changes from other pages
		window.addEventListener('themeChanged', (e) => {
			this.handleThemeChange({ target: { value: e.detail.theme } });
		});
	}

	/**
	 * Handle theme change with improved transition
	 */
	handleThemeChange(e) {
		const newTheme = e.target.value;
		
		// Add transitioning class to prevent FOUC
		document.body.classList.add('theme-transitioning');
		
		// Short delay to ensure transitioning class is applied
		requestAnimationFrame(() => {
			// Apply new theme
			document.body.classList.remove('theme-light', 'theme-dark');
			document.body.classList.add(`theme-${newTheme}`);
			
			// Store the theme preference
			localStorage.setItem(THEME_STORAGE_KEY, newTheme);
			
			// Notify other tabs of theme change
			window.dispatchEvent(new CustomEvent('themeChanged', { 
				detail: { theme: newTheme }
			}));
			
			// Remove transitioning class after transition completes
			setTimeout(() => {
				document.body.classList.remove('theme-transitioning');
			}, 200); // Match this with your CSS transition duration
		});
	}

    /**
     * Apply theme to the application
     */
    applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
        this.user.theme = theme;
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        
        // Notify other tabs of theme change
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    /**
     * Initialize modal event handlers
     */
    initializeModalHandlers() {
        // Close buttons
        document.querySelectorAll('.modal-close, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });

        // Modal overlays
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });

        // Email change confirmation
        const confirmEmailBtn = document.querySelector('.confirm-email-btn');
        confirmEmailBtn?.addEventListener('click', () => this.handleEmailChange());

        // Reset confirmation
        const confirmResetBtn = document.querySelector('.confirm-reset-btn');
        confirmResetBtn?.addEventListener('click', () => this.handleDataReset());
    }

    /**
     * Toggle settings section visibility
     */
    toggleSettingsSection(section) {
        if (!section) return;
        section.classList.toggle('collapsed');
    }

    /**
     * Start editing a profile field
     */
    startEditing(field) {
        const fieldElement = field === 'name' ? 
            document.querySelector('.profile-name') : 
            document.querySelector('.profile-email');
        
        if (!fieldElement) return;

        const currentValue = fieldElement.textContent;
        const input = document.createElement('input');
        input.type = field === 'name' ? 'text' : 'email';
        input.className = 'edit-input';
        input.value = currentValue;

        fieldElement.replaceWith(input);
        input.focus();

        input.addEventListener('blur', () => this.finishEditing(input, field));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') input.blur();
        });
    }

    /**
     * Finish editing a profile field
     */
    finishEditing(input, field) {
        const newValue = input.value.trim();
        if (!newValue) return;

        const span = document.createElement('span');
        span.className = field === 'name' ? 'profile-name' : 'profile-email';
        span.textContent = newValue;

        input.replaceWith(span);

        if (field === 'name') {
            this.user.displayName = newValue;
            this.saveUserData();
            
            window.dispatchEvent(new Event('usernameUpdated'));
            this.showMessage('Name updated successfully', 'success');
        }
    }

    /**
     * Handle email change confirmation
     */
    handleEmailChange() {
        const newEmail = document.getElementById('newEmail')?.value.trim();
        if (!newEmail) return;

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(newEmail)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        this.user.email = newEmail;
        this.saveUserData();
        
        this.showMessage('Email updated successfully', 'success');
        this.closeModal('emailModal');
        this.updateUserDisplay();
        this.updateProfileFields();
    }

    /**
     * Handle data reset confirmation
     */
    handleDataReset() {
        localStorage.clear();
        this.showMessage('All data has been reset. Refreshing page...', 'success');
        setTimeout(() => window.location.reload(), 1500);
    }

    /**
     * Handle user logout
     */
    handleLogout() {
        // Clear user-specific data
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        
        // Redirect to login page (to be implemented)
        window.location.href = 'index.html';
    }

    /**
     * Load user data from localStorage
     */
    loadUserData() {
        try {
            const savedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                // Validate required fields
                if (parsedUser.displayName && parsedUser.email) {
                    this.user = { ...this.user, ...parsedUser };
                    this.updateUserDisplay();
                    this.updateProfileFields();
                } else {
                    console.warn('Incomplete user data found in storage');
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    /**
     * Save user data to localStorage
     */
    saveUserData() {
        try {
            if (!this.user.displayName || !this.user.email) {
                throw new Error('Invalid user data');
            }
            
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.user));
            localStorage.setItem('lastUserUpdate', new Date().toISOString());
            localStorage.removeItem('lastUserUpdate');
            
            this.updateUserDisplay();
            this.updateProfileFields();
        } catch (error) {
            console.error('Error saving user data:', error);
            this.showMessage('Error saving changes', 'error');
        }
    }

    /**
     * Update task statistics display
     */
    updateStatistics() {
        try {
            const tasks = this.loadTasks();
            const stats = this.calculateTaskStatistics(tasks);
            this.renderStatistics(stats);
        } catch (error) {
            console.error('Error updating statistics:', error);
            this.showMessage('Error loading statistics', 'error');
        }
    }

    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
            return savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    /**
     * Calculate task statistics
     */
    calculateTaskStatistics(tasks) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return {
            total: tasks.length,
            pending: tasks.filter(task => !task.completed).length,
            completed: tasks.filter(task => task.completed).length,
            overdue: tasks.filter(task => {
                // Skip completed tasks
                if (task.completed) return false;
                
                const dueDate = new Date(task.dueDate);
                
                // For today's tasks, check if the specific time has passed
                if (dueDate.getDate() === today.getDate() &&
                    dueDate.getMonth() === today.getMonth() &&
                    dueDate.getFullYear() === today.getFullYear()) {
                    return dueDate < now;  // Compare with current time
                }
                
                // For other days, compare just the dates
                const taskDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                return taskDay < today;
            }).length
        };
    }

    /**
     * Render statistics to the UI
     */
    renderStatistics(stats) {
        const statElements = document.querySelectorAll('.stat-number');
        const statValues = [stats.total, stats.pending, stats.completed, stats.overdue];

        statElements.forEach((element, index) => {
            if (element && typeof statValues[index] !== 'undefined') {
                element.textContent = statValues[index];
            }
        });
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;

        const profileSection = document.querySelector('.profile-section');
        profileSection.insertBefore(messageDiv, profileSection.firstChild);

        setTimeout(() => messageDiv.remove(), 3000);
    }

    /**
     * Open modal dialog
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.removeAttribute('hidden');
        }
    }

    /**
     * Close modal dialog
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.setAttribute('hidden', '');
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }
}

// Initialize the profile manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
    window.profileManager.initializeUserSync(); // Explicitly call after initialization
    console.log(`Profile Manager v${APP_VERSION} initialized`);
});