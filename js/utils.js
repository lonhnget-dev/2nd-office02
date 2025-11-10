// Utility functions
class Utils {
    // Format date
    static formatDate(dateString) {
        if (!dateString) return '';
        return dateString.split('T')[0];
    }

    // Show message modal
    static showMessage(message, title = 'Information') {
        if (window.openMessageModal) {
            window.openMessageModal(title, message, 'info', () => {});
        } else {
            alert(`${title}: ${message}`);
        }
    }

    // Confirm dialog
    static confirm(message, title = 'Confirm', callback) {
        if (window.openMessageModal) {
            window.openMessageModal(title, message, 'confirm', callback);
        } else {
            const confirmed = confirm(`${title}: ${message}`);
            callback(confirmed);
        }
    }

    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Validate email
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate phone
    static validatePhone(phone) {
        const re = /^[0-9+\-\s()]+$/;
        return re.test(phone);
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Get role display name
    static getRoleDisplayName(role) {
        switch(role) {
            case 'admin': return 'អ្នកគ្រប់គ្រង';
            case 'officer': return 'មន្ត្រី';
            default: return role;
        }
    }

    // Get role badge class
    static getRoleBadgeClass(role) {
        switch(role) {
            case 'admin': return 'role-badge-admin';
            case 'officer': return 'role-badge-officer';
            default: return 'role-badge-officer';
        }
    }
}

// Modal utility functions
const ModalUtils = {
    openModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.show();
        }
    },

    closeModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        }
    },

    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    }
};