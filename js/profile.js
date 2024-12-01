/**
 * profile.js - TaskMaster Pro Profile Implementation
 * Version: 1.2.0
 * 
 * Change Log:
 * 1.2.0 - Added global theme management
 * 1.1.0 - Modified email update to preserve task data
 *       - Updated statistics to show overdue tasks
 *       - Separated data reset functionality
 */

const APP_VERSION = '1.2.0';
const LOCAL_STORAGE_KEY = 'taskmaster_tasks_v1_3'; // Shared with other components
const USER_STORAGE_KEY = 'taskmaster_user_v1_0';
const THEME_STORAGE_KEY = 'taskmaster_theme';

class ProfileManager {
    constructor() {
        // Core properties
        this.user = {
            displayName: 'John Doe',
            email: 'john.doe@example.com',
            theme: localStorage.getItem(THEME_STORAGE_KEY) || 'light'
        };
        
        // Initialize the application
        this.loadUserData();
        this.initializeEventListeners();
        this.updateStatistics();
        this.initializeTheme();
    }

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

        // Modal handlers
        this.initializeModalHandlers();

        // Reset data button
        const resetDataBtn = document.querySelector('.reset-data-btn');
        resetDataBtn?.addEventListener('click', () => this.openModal('resetModal'));
    }

    initializeTheme() {
        const savedTheme = this.user.theme;
        this.applyTheme(savedTheme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.value = savedTheme;
        }
    }

    applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
        this.user.theme = theme;
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    handleThemeChange(e) {
        const newTheme = e.target.value;
        this.applyTheme(newTheme);
        this.saveUserData();
    }

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

    toggleSettingsSection(section) {
        if (!section) return;
        section.classList.toggle('collapsed');
    }

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

    finishEditing(input, field) {
        const newValue = input.value.trim();
        if (!newValue) return;

        const span = document.createElement('span');
        span.className = field === 'name' ? 'profile-name' : 'profile-email';
        span.textContent = newValue;

        input.replaceWith(span);

        if (field === 'name') {
            this.user.displayName = newValue;
            this.updateUserDisplay();
            this.saveUserData();
            this.showMessage('Name updated successfully', 'success');
        }
    }

    handleEmailChange() {
        const newEmail = document.getElementById('newEmail')?.value.trim();
        if (!newEmail) return;

        this.user.email = newEmail;
        this.saveUserData();
        
        this.showMessage('Email updated successfully', 'success');
        this.closeModal('emailModal');
        this.updateUserDisplay();
    }

    handleDataReset() {
        localStorage.clear();
        this.showMessage('All data has been reset. Refreshing page...', 'success');
        setTimeout(() => window.location.reload(), 1500);
    }

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

    calculateTaskStatistics(tasks) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            total: tasks.length,
            pending: tasks.filter(task => !task.completed).length,
            completed: tasks.filter(task => task.completed).length,
            overdue: tasks.filter(task => {
                if (task.completed) return false;
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate < today;
            }).length
        };
    }

    renderStatistics(stats) {
        const statElements = document.querySelectorAll('.stat-number');
        const statValues = [stats.total, stats.pending, stats.completed, stats.overdue];

        statElements.forEach((element, index) => {
            if (element && typeof statValues[index] !== 'undefined') {
                element.textContent = statValues[index];
            }
        });
    }

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
            return savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    loadUserData() {
        try {
            const savedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (savedUser) {
                this.user = { ...this.user, ...JSON.parse(savedUser) };
                this.updateUserDisplay();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    saveUserData() {
        try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.user));
        } catch (error) {
            console.error('Error saving user data:', error);
            this.showMessage('Error saving changes', 'error');
        }
    }

    updateUserDisplay() {
        document.querySelectorAll('.user-name').forEach(element => {
            element.textContent = this.user.displayName;
        });

        document.querySelector('.profile-name').textContent = this.user.displayName;
        document.querySelector('.profile-email').textContent = this.user.email;
    }

    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;

        const profileSection = document.querySelector('.profile-section');
        profileSection.insertBefore(messageDiv, profileSection.firstChild);

        setTimeout(() => messageDiv.remove(), 3000);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.removeAttribute('hidden');
        }
    }

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
    console.log(`Profile Manager v${APP_VERSION} initialized`);
});