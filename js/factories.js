// Factories management functionality
class FactoriesManager {
    constructor() {
        this.allFactories = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.fetchFactories();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#openFactoryForm')) {
                this.openFactoryForm();
            }
            if (e.target.closest('#exportFactoryExcel')) {
                this.exportToExcel();
            }
            if (e.target.closest('#selectFileBtn')) {
                this.selectFile();
            }
            if (e.target.closest('#downloadTemplateBtn')) {
                this.downloadTemplate();
            }
            if (e.target.closest('#importBtn')) {
                this.importData();
            }
            if (e.target.closest('[data-action="view-factory"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.viewFactory(id);
            }
            if (e.target.closest('[data-action="edit-factory"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.editFactory(id);
            }
            if (e.target.closest('[data-action="delete-factory"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.deleteFactoryConfirm(id);
            }
        });

        // File input change
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Search functionality
        const searchInput = document.getElementById('factorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.searchFactories(searchInput.value);
            }, 300));
        }

        // Form submission
        const factoryForm = document.getElementById('factoryForm');
        if (factoryForm) {
            factoryForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    async fetchFactories() {
        try {
            const res = await fetch(CONFIG.FACTORY_API);
            const data = await res.json();
            this.allFactories = data.data || [];
            this.renderFactories(this.allFactories);
        } catch (error) {
            console.error("Factory fetch error:", error);
            Utils.showMessage("Failed to fetch factories from server.", "Error");
        }
    }

    renderFactories(factories) {
        const tbody = document.getElementById('factoryTableBody');
        if (!tbody) return;

        tbody.innerHTML = factories.map(factory => `
            <tr data-id="${factory.id}">
                <td>${factory.no || ''}</td>
                <td>${factory.factoryname || ''}</td>
                <td>${factory.factoryname_en || ''}</td>
                <td>${factory.sector || ''}</td>
                <td>${factory.village || ''}</td>
                <td>${factory.commune || ''}</td>
                <td>${factory.district || ''}</td>
                <td>${factory.province || ''}</td>
                <td>${factory.total_workers || ''}</td>
                <td>${factory.female_workers || ''}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" data-action="view-factory">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" data-action="edit-factory">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" data-action="delete-factory">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    searchFactories(query) {
        if (!query.trim()) {
            this.renderFactories(this.allFactories);
            return;
        }

        const filteredFactories = this.allFactories.filter(factory =>
            Object.values(factory).some(value =>
                value && value.toString().toLowerCase().includes(query.toLowerCase())
            )
        );
        this.renderFactories(filteredFactories);
    }

    openFactoryForm(editId = null) {
        STATE.currentEditingId = editId;
        const modalTitle = document.getElementById('factoryModalTitle');
        const form = document.getElementById('factoryForm');

        if (modalTitle) {
            modalTitle.textContent = editId ? 'កែសម្រួលរោងចក្រ' : 'បញ្ចូលរោងចក្រថ្មី';
        }

        if (form) {
            form.reset();
            if (editId) {
                this.populateForm(editId);
            }
        }

        ModalUtils.openModal('factoryModal');
    }

    populateForm(id) {
        const factory = this.allFactories.find(f => f.id.toString() === id.toString());
        if (!factory) return;

        const form = document.getElementById('factoryForm');
        if (!form) return;

        form.elements['no'].value = factory.no || '';
        form.elements['factoryname'].value = factory.factoryname || '';
        form.elements['factoryname_en'].value = factory.factoryname_en || '';
        form.elements['sector'].value = factory.sector || '';
        form.elements['village'].value = factory.village || '';
        form.elements['commune'].value = factory.commune || '';
        form.elements['district'].value = factory.district || '';
        form.elements['province'].value = factory.province || '';
        form.elements['address'].value = factory.address || '';
        form.elements['total_workers'].value = factory.total_workers || '';
        form.elements['female_workers'].value = factory.female_workers || '';
        form.elements['admin_name'].value = factory.admin_name || '';
        form.elements['admin_phone'].value = factory.admin_phone || '';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (!data.no || !data.factoryname || !data.factoryname_en || !data.sector) {
            Utils.showMessage('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់', 'Error');
            return;
        }
        
        const submitBtn = document.getElementById('factorySubmitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> កំពុងរក្សាទុក...';
        submitBtn.disabled = true;
        
        try {
            if (STATE.currentEditingId) {
                const index = this.allFactories.findIndex(f => f.id.toString() === STATE.currentEditingId.toString());
                if (index !== -1) {
                    this.allFactories[index] = { ...this.allFactories[index], ...data, id: STATE.currentEditingId };
                }
                Utils.showMessage('Factory updated successfully', 'Success');
            } else {
                const newFactory = {
                    id: Date.now(),
                    ...data,
                    created_at: new Date().toISOString()
                };
                this.allFactories.push(newFactory);
                Utils.showMessage('Factory created successfully', 'Success');
            }
            
            ModalUtils.closeModal('factoryModal');
            this.renderFactories(this.allFactories);
        } catch (error) {
            console.error('Save error:', error);
            Utils.showMessage('Failed to save factory', 'Error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    viewFactory(id) {
        const factory = this.allFactories.find(f => f.id.toString() === id.toString());
        if (!factory) {
            Utils.showMessage('Factory not found', 'Error');
            return;
        }
        
        const detailDiv = document.getElementById('factoryDetail');
        if (detailDiv) {
            detailDiv.innerHTML = `
                <p><strong>លេខចូល:</strong> <span>${factory.no || ''}</span></p>
                <p><strong>ឈ្មោះរោងចក្រ:</strong> <span>${factory.factoryname || ''}</span></p>
                <p><strong>ឈ្មោះរោងចក្រ (EN):</strong> <span>${factory.factoryname_en || ''}</span></p>
                <p><strong>Sector:</strong> <span>${factory.sector || ''}</span></p>
                <p><strong>ភូមិ:</strong> <span>${factory.village || ''}</span></p>
                <p><strong>ឃុំ:</strong> <span>${factory.commune || ''}</span></p>
                <p><strong>ស្រុក:</strong> <span>${factory.district || ''}</span></p>
                <p><strong>ខេត្ត:</strong> <span>${factory.province || ''}</span></p>
                <p><strong>អាសយដ្ឋាន:</strong> <span>${factory.address || ''}</span></p>
                <p><strong>កម្មករសរុប:</strong> <span>${factory.total_workers || ''}</span></p>
                <p><strong>កម្មករស្រី:</strong> <span>${factory.female_workers || ''}</span></p>
                <p><strong>ឈ្មោះអ្នកគ្រប់គ្រង:</strong> <span>${factory.admin_name || ''}</span></p>
                <p><strong>លេខទូរស័ព្ទ:</strong> <span>${factory.admin_phone || ''}</span></p>
            `;
        }
        
        ModalUtils.openModal('viewFactoryModal');
    }

    editFactory(id) {
        this.openFactoryForm(id);
    }

    deleteFactoryConfirm(id) {
        Utils.confirm(
            'តើអ្នកប្រាកដថាចង់លុបរោងចក្រនេះមែនទេ?',
            'លុបរោងចក្រ',
            (confirmed) => {
                if (confirmed) {
                    this.deleteFactory(id);
                }
            }
        );
    }

    deleteFactory(id) {
        try {
            this.allFactories = this.allFactories.filter(f => f.id.toString() !== id.toString());
            this.renderFactories(this.allFactories);
            Utils.showMessage('Factory deleted successfully', 'Success');
        } catch (error) {
            console.error('Delete error:', error);
            Utils.showMessage('Failed to delete factory', 'Error');
        }
    }

    selectFile() {
        document.getElementById('fileInput').click();
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            STATE.selectedFile = file;
            this.updateFileInfo(file);
            document.getElementById('importBtn').disabled = false;
        }
    }

    updateFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

        if (fileInfo && fileName && fileSize) {
            fileName.textContent = file.name;
            fileSize.textContent = Utils.formatFileSize(file.size);
            fileInfo.classList.remove('d-none');
        }
    }

    downloadTemplate() {
        // Create template data
        const templateData = [{
            'លេខចូល': 'EXAMPLE001',
            'ឈ្មោះរោងចក្រ': 'រោងចក្រគំរូ',
            'ឈ្មោះរោងចក្រ (EN)': 'Sample Factory',
            'Sector': 'វិស័យឧស្សាហកម្ម',
            'ភូមិ': 'ភូមិគំរូ',
            'ឃុំ': 'ឃុំគំរូ',
            'ស្រុក': 'ស្រុកគំរូ',
            'ខេត្ត': 'ខេត្តគំរូ',
            'កម្មករសរុប': '100',
            'កម្មករស្រី': '50'
        }];

        try {
            const ws = XLSX.utils.json_to_sheet(templateData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Template");
            XLSX.writeFile(wb, "factory_template.xlsx");
            Utils.showMessage('Template downloaded successfully', 'Success');
        } catch (error) {
            console.error('Template download error:', error);
            Utils.showMessage('Failed to download template', 'Error');
        }
    }

    importData() {
        if (!STATE.selectedFile) {
            Utils.showMessage('Please select a file first', 'Error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Process imported data
                this.processImportedData(jsonData);
            } catch (error) {
                console.error('Import error:', error);
                Utils.showMessage('Failed to import data from file', 'Error');
            }
        };
        reader.readAsArrayBuffer(STATE.selectedFile);
    }

    processImportedData(data) {
        // Add imported data to factories
        const newFactories = data.map((item, index) => ({
            id: Date.now() + index,
            no: item['លេខចូល'] || '',
            factoryname: item['ឈ្មោះរោងចក្រ'] || '',
            factoryname_en: item['ឈ្មោះរោងចក្រ (EN)'] || '',
            sector: item['Sector'] || '',
            village: item['ភូមិ'] || '',
            commune: item['ឃុំ'] || '',
            district: item['ស្រុក'] || '',
            province: item['ខេត្ត'] || '',
            total_workers: item['កម្មករសរុប'] || '',
            female_workers: item['កម្មករស្រី'] || '',
            created_at: new Date().toISOString()
        }));

        this.allFactories = [...this.allFactories, ...newFactories];
        this.renderFactories(this.allFactories);
        Utils.showMessage(`Successfully imported ${newFactories.length} factories`, 'Success');

        // Reset file input
        document.getElementById('fileInput').value = '';
        document.getElementById('importBtn').disabled = true;
        document.getElementById('fileInfo').classList.add('d-none');
        STATE.selectedFile = null;
    }

    exportToExcel() {
        try {
            const ws = XLSX.utils.json_to_sheet(this.allFactories);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Factories");
            XLSX.writeFile(wb, "factories.xlsx");
            Utils.showMessage('Excel file downloaded successfully', 'Success');
        } catch (error) {
            console.error('Export error:', error);
            Utils.showMessage('Failed to export to Excel', 'Error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.factoriesManager = new FactoriesManager();
});