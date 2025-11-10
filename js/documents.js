// Documents management functionality
class DocumentsManager {
    constructor() {
        this.allDocs = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.fetchDocuments();
    }

    bindEvents() {
        // Event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            if (e.target.closest('#openDocForm')) {
                this.openDocumentForm();
            }
            if (e.target.closest('#exportDocExcel')) {
                this.exportToExcel();
            }
            if (e.target.closest('[data-action="view-doc"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.viewDocument(id);
            }
            if (e.target.closest('[data-action="edit-doc"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.editDocument(id);
            }
            if (e.target.closest('[data-action="delete-doc"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.deleteDocumentConfirm(id);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('docSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.searchDocuments(searchInput.value);
            }, 300));
        }

        // Show count
        const showCount = document.getElementById('showCount');
        if (showCount) {
            showCount.addEventListener('change', () => {
                this.renderDocuments(this.allDocs);
            });
        }

        // Form submission
        const docForm = document.getElementById('docForm');
        if (docForm) {
            docForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    async fetchDocuments() {
        try {
            const res = await fetch(CONFIG.DOC_API);
            const data = await res.json();
            this.allDocs = data.date || [];
            this.renderDocuments(this.allDocs);
        } catch (error) {
            console.error("Document fetch error:", error);
            Utils.showMessage("Failed to fetch documents from server.", "Error");
        }
    }

    renderDocuments(docs) {
        const tbody = document.getElementById('docTableBody');
        if (!tbody) return;

        const showCount = document.getElementById('showCount');
        const count = showCount ? showCount.value : 'all';
        
        let displayDocs = docs;
        if (count !== 'all') {
            displayDocs = docs.slice(0, parseInt(count));
        }

        tbody.innerHTML = displayDocs.map(doc => `
            <tr data-id="${doc.id}">
                <td>${doc.no || ''}</td>
                <td>${doc.ir || ''}</td>
                <td>${doc.outNo || ''}</td>
                <td>${Utils.formatDate(doc.submitDate)}</td>
                <td>${doc.source || ''}</td>
                <td>${doc.doc || ''}</td>
                <td>${doc.officer || ''}</td>
                <td>
                    <span class="status-badge ${doc.progress === 'បានធ្វើចេញ' ? 'status-completed' : 'status-pending'}">
                        ${doc.progress || ''}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" data-action="view-doc">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" data-action="edit-doc">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" data-action="delete-doc">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    searchDocuments(query) {
        if (!query.trim()) {
            this.renderDocuments(this.allDocs);
            return;
        }

        const filteredDocs = this.allDocs.filter(doc =>
            Object.values(doc).some(value =>
                value && value.toString().toLowerCase().includes(query.toLowerCase())
            )
        );
        this.renderDocuments(filteredDocs);
    }

    openDocumentForm(editId = null) {
        STATE.currentEditingId = editId;
        const modalTitle = document.getElementById('docModalTitle');
        const form = document.getElementById('docForm');

        if (modalTitle) {
            modalTitle.textContent = editId ? 'កែសម្រួលឯកសារ' : 'បញ្ចូលឯកសារថ្មី';
        }

        if (form) {
            form.reset();
            if (editId) {
                this.populateForm(editId);
            }
        }

        ModalUtils.openModal('docModal');
    }

    populateForm(id) {
        const doc = this.allDocs.find(d => d.id.toString() === id.toString());
        if (!doc) return;

        const form = document.getElementById('docForm');
        if (!form) return;

        form.elements['no'].value = doc.no || '';
        form.elements['ir'].value = doc.ir || '';
        form.elements['outNo'].value = doc.outNo || '';
        form.elements['submitDate'].value = Utils.formatDate(doc.submitDate) || '';
        form.elements['source'].value = doc.source || '';
        form.elements['doc'].value = doc.doc || '';
        form.elements['officer'].value = doc.officer || '';
        form.elements['progress'].value = doc.progress || '';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (!data.no || !data.ir) {
            Utils.showMessage('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់', 'Error');
            return;
        }
        
        const submitBtn = document.getElementById('docSubmitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> កំពុងរក្សាទុក...';
        submitBtn.disabled = true;
        
        try {
            if (STATE.currentEditingId) {
                // Update existing document
                const index = this.allDocs.findIndex(d => d.id.toString() === STATE.currentEditingId.toString());
                if (index !== -1) {
                    this.allDocs[index] = { ...this.allDocs[index], ...data, id: STATE.currentEditingId };
                }
                Utils.showMessage('Document updated successfully', 'Success');
            } else {
                // Create new document
                const newDoc = {
                    id: Date.now(),
                    ...data,
                    created_at: new Date().toISOString()
                };
                this.allDocs.push(newDoc);
                Utils.showMessage('Document created successfully', 'Success');
            }
            
            ModalUtils.closeModal('docModal');
            this.renderDocuments(this.allDocs);
        } catch (error) {
            console.error('Save error:', error);
            Utils.showMessage('Failed to save document', 'Error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    viewDocument(id) {
        const doc = this.allDocs.find(d => d.id.toString() === id.toString());
        if (!doc) {
            Utils.showMessage('Document not found', 'Error');
            return;
        }
        
        const detailDiv = document.getElementById('docDetail');
        if (detailDiv) {
            detailDiv.innerHTML = `
                <p><strong>លេខចូល:</strong> <span>${doc.no || ''}</span></p>
                <p><strong>លេខលិខិត (IR):</strong> <span>${doc.ir || ''}</span></p>
                <p><strong>លេខចេញ:</strong> <span>${doc.outNo || ''}</span></p>
                <p><strong>ថ្ងៃខែលិខិត:</strong> <span>${Utils.formatDate(doc.submitDate)}</span></p>
                <p><strong>អង្គភាព:</strong> <span>${doc.source || ''}</span></p>
                <p><strong>ប្រភេទឯកសារ:</strong> <span>${doc.doc || ''}</span></p>
                <p><strong>មន្រ្តីទទួល:</strong> <span>${doc.officer || ''}</span></p>
                <p><strong>ស្ថានភាព:</strong> <span>${doc.progress || ''}</span></p>
            `;
        }
        
        ModalUtils.openModal('viewDocModal');
    }

    editDocument(id) {
        this.openDocumentForm(id);
    }

    deleteDocumentConfirm(id) {
        Utils.confirm(
            'តើអ្នកប្រាកដថាចង់លុបឯកសារនេះមែនទេ?',
            'លុបឯកសារ',
            (confirmed) => {
                if (confirmed) {
                    this.deleteDocument(id);
                }
            }
        );
    }

    deleteDocument(id) {
        try {
            this.allDocs = this.allDocs.filter(d => d.id.toString() !== id.toString());
            this.renderDocuments(this.allDocs);
            Utils.showMessage('Document deleted successfully', 'Success');
        } catch (error) {
            console.error('Delete error:', error);
            Utils.showMessage('Failed to delete document', 'Error');
        }
    }

    exportToExcel() {
        try {
            const ws = XLSX.utils.json_to_sheet(this.allDocs);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Documents");
            XLSX.writeFile(wb, "documents.xlsx");
            Utils.showMessage('Excel file downloaded successfully', 'Success');
        } catch (error) {
            console.error('Export error:', error);
            Utils.showMessage('Failed to export to Excel', 'Error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.documentsManager = new DocumentsManager();
});