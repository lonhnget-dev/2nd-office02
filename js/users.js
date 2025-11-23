// Users management functionality
class UsersManager {
    constructor() {
        this.allUsers = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.fetchUsers();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#openUserForm')) {
                this.openUserForm();
            }
            if (e.target.closest('#exportUserExcel')) {
                this.exportToExcel();
            }
            if (e.target.closest('[data-action="view-user"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.viewUser(id);
            }
            if (e.target.closest('[data-action="edit-user"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.editUser(id);
            }
            if (e.target.closest('[data-action="delete-user"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.deleteUserConfirm(id);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.searchUsers(searchInput.value);
            }, 300));
        }

        // Form submission
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    async fetchUsers() {
        try {
            const res = await fetch(CONFIG.USER_API);
            const data = await res.json();
            this.allUsers = data.data || [];
            this.renderUsers(this.allUsers);
        } catch (error) {
            console.error("User fetch error:", error);
            Utils.showMessage("Failed to fetch users from server.", "Error");
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr data-id="${user.id}">
                <td>${user.name || ''}</td>
                <td>${user.phone || ''}</td>
                <td>${user.email || ''}</td>
                <td>
                    <span class="role-badge ${Utils.getRoleBadgeClass(user.role)}">
                        ${Utils.getRoleDisplayName(user.role)}
                    </span>
                </td>
                <td>${user.function || ''}</td>
                <td>${user.sangkat || ''}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" data-action="view-user">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" data-action="edit-user">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" data-action="delete-user">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    searchUsers(query) {
        if (!query.trim()) {
            this.renderUsers(this.allUsers);
            return;
        }

        const filteredUsers = this.allUsers.filter(user =>
            Object.values(user).some(value =>
                value && value.toString().toLowerCase().includes(query.toLowerCase())
            )
        );
        this.renderUsers(filteredUsers);
    }

    openUserForm(editId = null) {
        STATE.currentEditingId = editId;
        const modalTitle = document.getElementById('userModalTitle');
        const form = document.getElementById('userForm');

        if (modalTitle) {
            modalTitle.textContent = editId ? 'កែសម្រួលអ្នកប្រើប្រាស់' : 'បញ្ចូលអ្នកប្រើប្រាស់ថ្មី';
        }

        if (form) {
            form.reset();
            if (editId) {
                this.populateForm(editId);
            }
        }

        ModalUtils.openModal('userModal');
    }

    populateForm(id) {
        const user = this.allUsers.find(u => u.id.toString() === id.toString());
        if (!user) return;

        const form = document.getElementById('userForm');
        if (!form) return;

        form.elements['name'].value = user.name || '';
        form.elements['phone'].value = user.phone || '';
        form.elements['email'].value = user.email || '';
        form.elements['password'].value = ''; // Don't populate password for security
        form.elements['role'].value = user.role || '';
        form.elements['function'].value = user.function || '';
        form.elements['sangkat'].value = user.sangkat || '';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Validation
        if (!data.name || !data.phone || !data.email || !data.password || !data.role) {
            Utils.showMessage('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់', 'Error');
            return;
        }

        if (!Utils.validateEmail(data.email)) {
            Utils.showMessage('សូមបញ្ចូលអ៊ីមែលដែលត្រឹមត្រូវ', 'Error');
            return;
        }

        if (!Utils.validatePhone(data.phone)) {
            Utils.showMessage('សូមបញ្ចូលលេខទូរស័ព្ទដែលត្រឹមត្រូវ', 'Error');
            return;
        }
        
        const submitBtn = document.getElementById('userSubmitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> កំពុងរក្សាទុក...';
        submitBtn.disabled = true;
        
        try {
            if (STATE.currentEditingId) {
                const index = this.allUsers.findIndex(u => u.id.toString() === STATE.currentEditingId.toString());
                if (index !== -1) {
                    this.allUsers[index] = { ...this.allUsers[index], ...data, id: STATE.currentEditingId };
                }
                Utils.showMessage('User updated successfully', 'Success');
            } else {
                const newUser = {
                    id: Date.now(),
                    ...data,
                    created_at: new Date().toISOString()
                };
                this.allUsers.push(newUser);
                Utils.showMessage('User created successfully', 'Success');
            }
            
            ModalUtils.closeModal('userModal');
            this.renderUsers(this.allUsers);
        } catch (error) {
            console.error('Save error:', error);
            Utils.showMessage('Failed to save user', 'Error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    viewUser(id) {
        const user = this.allUsers.find(u => u.id.toString() === id.toString());
        if (!user) {
            Utils.showMessage('User not found', 'Error');
            return;
        }
        
        const detailDiv = document.getElementById('userDetail');
        if (detailDiv) {
            detailDiv.innerHTML = `
                <p><strong>ឈ្មោះ:</strong> <span>${user.name || ''}</span></p>
                <p><strong>ទូរស័ព្ទ:</strong> <span>${user.phone || ''}</span></p>
                <p><strong>អ៊ីមែល:</strong> <span>${user.email || ''}</span></p>
                <p><strong>តួនាទី:</strong> <span>${Utils.getRoleDisplayName(user.role)}</span></p>
                <p><strong>មុខងារ:</strong> <span>${user.function || ''}</span></p>
                <p><strong>សង្កាត់:</strong> <span>${user.sangkat || ''}</span></p>
            `;
        }
        
        ModalUtils.openModal('viewUserModal');
    }

    editUser(id) {
        this.openUserForm(id);
    }

    deleteUserConfirm(id) {
        Utils.confirm(
            'តើអ្នកប្រាកដថាចង់លុបអ្នកប្រើប្រាស់នេះមែនទេ?',
            'លុបអ្នកប្រើប្រាស់',
            (confirmed) => {
                if (confirmed) {
                    this.deleteUser(id);
                }
            }
        );
    }

    deleteUser(id) {
        try {
            this.allUsers = this.allUsers.filter(u => u.id.toString() !== id.toString());
            this.renderUsers(this.allUsers);
            Utils.showMessage('User deleted successfully', 'Success');
        } catch (error) {
            console.error('Delete error:', error);
            Utils.showMessage('Failed to delete user', 'Error');
        }
    }

    exportToExcel() {
        try {
            // Prepare data for export
            const exportData = this.allUsers.map(user => ({
                'ឈ្មោះ': user.name,
                'ទូរស័ព្ទ': user.phone,
                'អ៊ីមែល': user.email,
                'តួនាទី': Utils.getRoleDisplayName(user.role),
                'មុខងារ': user.function,
                'សង្កាត់': user.sangkat
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Users");
            XLSX.writeFile(wb, "users.xlsx");
            Utils.showMessage('Excel file downloaded successfully', 'Success');
        } catch (error) {
            console.error('Export error:', error);
            Utils.showMessage('Failed to export to Excel', 'Error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.usersManager = new UsersManager();
});