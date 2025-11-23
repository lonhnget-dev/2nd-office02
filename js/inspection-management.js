// Inspection management functionality
class InspectionManager {
    constructor() {
        this.allInspections = [];
        this.allFollowups = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSampleData();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            // Inspection buttons
            if (e.target.closest('#openInspectionForm')) {
                this.openInspectionForm();
            }
            if (e.target.closest('#exportInspectionExcel')) {
                this.exportInspectionsToExcel();
            }
            if (e.target.closest('[data-action="view-inspection"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.viewInspection(id);
            }
            if (e.target.closest('[data-action="edit-inspection"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.editInspection(id);
            }
            if (e.target.closest('[data-action="delete-inspection"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.deleteInspectionConfirm(id);
            }

            // Followup buttons
            if (e.target.closest('#openFollowupForm')) {
                this.openFollowupForm();
            }
            if (e.target.closest('#exportFollowupExcel')) {
                this.exportFollowupsToExcel();
            }
            if (e.target.closest('[data-action="view-followup"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.viewFollowup(id);
            }
            if (e.target.closest('[data-action="edit-followup"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.editFollowup(id);
            }
            if (e.target.closest('[data-action="delete-followup"]')) {
                const id = e.target.closest('[data-id]').getAttribute('data-id');
                this.deleteFollowupConfirm(id);
            }

            // Tab clicks
            if (e.target.closest('.inspection-tab')) {
                const tab = e.target.closest('.inspection-tab');
                const tabName = tab.getAttribute('data-tab');
                if (tabName) {
                    this.showInspectionTab(tabName);
                }
            }
        });

        // Search functionality
        const inspectionSearch = document.getElementById('inspectionSearch');
        if (inspectionSearch) {
            inspectionSearch.addEventListener('input', Utils.debounce(() => {
                this.searchInspections(inspectionSearch.value);
            }, 300));
        }

        const followupSearch = document.getElementById('followupSearch');
        if (followupSearch) {
            followupSearch.addEventListener('input', Utils.debounce(() => {
                this.searchFollowups(followupSearch.value);
            }, 300));
        }

        // Form submissions
        const inspectionForm = document.getElementById('inspectionForm');
        if (inspectionForm) {
            inspectionForm.addEventListener('submit', (e) => this.handleInspectionFormSubmit(e));
        }

        const followupForm = document.getElementById('followupForm');
        if (followupForm) {
            followupForm.addEventListener('submit', (e) => this.handleFollowupFormSubmit(e));
        }

        // Factory selection change
        const factorySelect = document.querySelector('select[name="factory_name"]');
        if (factorySelect) {
            factorySelect.addEventListener('change', () => this.updateFactoryInfo());
        }

        // Original inspection selection change
        const originalInspectionSelect = document.getElementById('originalInspectionSelect');
        if (originalInspectionSelect) {
            originalInspectionSelect.addEventListener('change', () => this.loadOriginalInspectionData());
        }
    }

    loadSampleData() {
        // Sample inspection data
        this.allInspections = [
            {
                id: 1,
                no: 'INS001',
                factory_name: 'រោងចក្រ ក',
                sector: 'វិស័យ ក',
                case_subject: 'ការបំពានលើស្តង់ដារសុវត្ថិភាព',
                group: 'ក្រុម ក',
                inspection_date: '2024-01-15',
                village: 'ភូមិ ក',
                commune: 'ឃុំ ក',
                district: 'ស្រុក ក',
                province: 'ខេត្ត ក',
                has_penalty: 'មាន',
                penalty_format: 'ត្រូវកែលម្អប្រព័ន្ធអគ្គិសនី',
                penalty_condition: 'មិនបំពេញស្តង់ដារសុវត្ថិភាព',
                penalty_health: 'ខ្សែភ្លើងមិនមានសុវត្ថិភាព',
                penalty_professional: 'បុគ្គលិកគ្មានការបណ្តុះបណ្តាល',
                has_fine: 'គ្មាន',
                remarks: 'ត្រូវកែលម្អក្នុងរយៈពេល ៣០ថ្ងៃ'
            }
        ];
        
        // Sample followup data
        this.allFollowups = [
            {
                id: 1,
                no: 'FLW001',
                original_inspection: '1',
                original_inspection_data: this.allInspections[0],
                followup_date: '2024-02-15',
                penalty_implemented: 'អនុវត្ត',
                conclusion: 'រោងចក្របានកែលម្អតាមតម្រូវការគ្រប់ចំនុច'
            }
        ];
        
        this.renderInspections();
        this.renderFollowups();
        this.populateOriginalInspections();
    }

    showInspectionTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.inspection-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.inspection-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab content
        const contentElement = document.getElementById(`${tabName}-inspection`);
        if (contentElement) {
            contentElement.classList.add('active');
        }
        
        // Activate selected tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Load appropriate data
        if (tabName === 'initial') {
            this.renderInspections();
        } else if (tabName === 'followup') {
            this.renderFollowups();
        }
    }

    renderInspections() {
        const tbody = document.getElementById('inspectionTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.allInspections.map(inspection => `
            <tr data-id="${inspection.id}">
                <td>${inspection.no || ''}</td>
                <td>
                    <div>
                        <strong>${inspection.factory_name || ''}</strong>
                        <div class="text-muted small">
                            <div>វិស័យ: ${inspection.sector || ''}</div>
                            <div>ប្រធានបទ: ${inspection.case_subject || ''}</div>
                        </div>
                    </div>
                </td>
                <td>${inspection.inspection_date || ''}</td>
                <td>
                    <span class="status-badge ${inspection.has_penalty === 'មាន' ? 'status-pending' : 'status-completed'}">
                        ${inspection.has_penalty || 'គ្មាន'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${inspection.has_fine === 'មាន' ? 'status-pending' : 'status-completed'}">
                        ${inspection.has_fine || 'គ្មាន'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${inspection.has_penalty === 'មាន' ? 'status-pending' : 'status-completed'}">
                        ${inspection.has_penalty === 'មាន' ? 'ត្រូវតាមដាន' : 'បានបញ្ចប់'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" data-action="view-inspection">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" data-action="edit-inspection">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" data-action="delete-inspection">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderFollowups() {
        const tbody = document.getElementById('followupTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.allFollowups.map(followup => {
            const original = followup.original_inspection_data || {};
            return `
            <tr data-id="${followup.id}">
                <td>${followup.no || ''}</td>
                <td>${original.factory_name || ''}</td>
                <td>${followup.followup_date || ''}</td>
                <td>${original.inspection_date || ''}</td>
                <td>
                    <span class="status-badge ${followup.penalty_implemented === 'អនុវត្ត' ? 'status-completed' : 'status-pending'}">
                        ${followup.penalty_implemented || 'N/A'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" data-action="view-followup">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" data-action="edit-followup">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" data-action="delete-followup">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `}).join('');
    }

    searchInspections(query) {
        if (!query.trim()) {
            this.renderInspections();
            return;
        }

        const filteredInspections = this.allInspections.filter(inspection =>
            Object.values(inspection).some(value =>
                value && value.toString().toLowerCase().includes(query.toLowerCase())
            )
        );
        this.renderInspections(filteredInspections);
    }

    searchFollowups(query) {
        if (!query.trim()) {
            this.renderFollowups();
            return;
        }

        const filteredFollowups = this.allFollowups.filter(followup =>
            Object.values(followup).some(value =>
                value && value.toString().toLowerCase().includes(query.toLowerCase())
            )
        );
        this.renderFollowups(filteredFollowups);
    }

    // Penalty Management Functions
    togglePenaltyDetails(showDetails) {
        const detailsElement = document.getElementById('penalty_details');
        const yesOption = document.getElementById('penalty_yes_option');
        const noOption = document.getElementById('penalty_no_option');
        
        if (showDetails) {
            if (yesOption) yesOption.classList.add('selected');
            if (noOption) noOption.classList.remove('selected');
            if (detailsElement) detailsElement.classList.add('active');
        } else {
            if (yesOption) yesOption.classList.remove('selected');
            if (noOption) noOption.classList.add('selected');
            if (detailsElement) detailsElement.classList.remove('active');
            this.clearPenaltyDetails();
        }
    }
    
    toggleFineDetails(showDetails) {
        const detailsElement = document.getElementById('fine_details');
        const yesOption = document.getElementById('fine_yes_option');
        const noOption = document.getElementById('fine_no_option');
        
        if (showDetails) {
            if (yesOption) yesOption.classList.add('selected');
            if (noOption) noOption.classList.remove('selected');
            if (detailsElement) detailsElement.classList.add('active');
        } else {
            if (yesOption) yesOption.classList.remove('selected');
            if (noOption) noOption.classList.add('selected');
            if (detailsElement) detailsElement.classList.remove('active');
            this.clearFineDetails();
        }
    }
    
    toggleFollowupDetails(showDetails) {
        const detailsElement = document.getElementById('followup_details');
        const yesOption = document.getElementById('implemented_yes_option');
        const noOption = document.getElementById('implemented_no_option');
        
        if (showDetails) {
            if (yesOption) yesOption.classList.remove('selected');
            if (noOption) noOption.classList.add('selected');
            if (detailsElement) detailsElement.classList.add('active');
        } else {
            if (yesOption) yesOption.classList.add('selected');
            if (noOption) noOption.classList.remove('selected');
            if (detailsElement) detailsElement.classList.remove('active');
            this.clearFollowupDetails();
        }
    }
    
    clearPenaltyDetails() {
        const form = document.getElementById('inspectionForm');
        if (!form) return;
        
        const fields = ['penalty_format', 'penalty_condition', 'penalty_health', 'penalty_professional'];
        fields.forEach(field => {
            if (form.elements[field]) form.elements[field].value = '';
        });
    }
    
    clearFineDetails() {
        const form = document.getElementById('inspectionForm');
        if (!form) return;
        
        const fields = ['fine_amount', 'fine_type', 'fine_reason'];
        fields.forEach(field => {
            if (form.elements[field]) form.elements[field].value = '';
        });
    }
    
    clearFollowupDetails() {
        const form = document.getElementById('followupForm');
        if (!form) return;
        
        const fields = ['followup_format', 'followup_condition', 'followup_health', 'followup_professional'];
        fields.forEach(field => {
            if (form.elements[field]) form.elements[field].value = '';
        });
    }

    updateFactoryInfo() {
        const select = document.querySelector('select[name="factory_name"]');
        if (!select) return;
        
        const selectedOption = select.options[select.selectedIndex];
        
        if (selectedOption.value) {
            // Auto-fill the address fields from data attributes
            const sectorInput = document.querySelector('input[name="sector"]');
            const villageInput = document.querySelector('input[name="village"]');
            const communeInput = document.querySelector('input[name="commune"]');
            const districtInput = document.querySelector('input[name="district"]');
            const provinceInput = document.querySelector('input[name="province"]');
            
            if (sectorInput) sectorInput.value = selectedOption.getAttribute('data-sector') || '';
            if (villageInput) villageInput.value = selectedOption.getAttribute('data-village') || '';
            if (communeInput) communeInput.value = selectedOption.getAttribute('data-commune') || '';
            if (districtInput) districtInput.value = selectedOption.getAttribute('data-district') || '';
            if (provinceInput) provinceInput.value = selectedOption.getAttribute('data-province') || '';
        }
    }

    loadOriginalInspectionData() {
        const select = document.getElementById('originalInspectionSelect');
        if (!select) return;
        
        const inspectionId = select.value;
        const infoDiv = document.getElementById('originalPenaltyInfo');
        const companyInfoDiv = document.getElementById('companyInfoDisplay');
        const penaltyDisplay = document.getElementById('penaltyDisplay');
        
        if (inspectionId) {
            const inspection = this.allInspections.find(i => i.id.toString() === inspectionId);
            if (inspection) {
                // Display company information
                const displayFactoryName = document.getElementById('display_factory_name');
                const displaySector = document.getElementById('display_sector');
                const displayCaseSubject = document.getElementById('display_case_subject');
                const displayVillage = document.getElementById('display_village');
                const displayCommune = document.getElementById('display_commune');
                const displayDistrict = document.getElementById('display_district');
                const displayProvince = document.getElementById('display_province');
                
                if (displayFactoryName) displayFactoryName.value = inspection.factory_name || '';
                if (displaySector) displaySector.value = inspection.sector || '';
                if (displayCaseSubject) displayCaseSubject.value = inspection.case_subject || '';
                if (displayVillage) displayVillage.value = inspection.village || '';
                if (displayCommune) displayCommune.value = inspection.commune || '';
                if (displayDistrict) displayDistrict.value = inspection.district || '';
                if (displayProvince) displayProvince.value = inspection.province || '';
                
                if (companyInfoDiv) companyInfoDiv.classList.remove('d-none');
                
                // Display penalty information if exists
                if (inspection.has_penalty === 'មាន') {
                    if (penaltyDisplay) {
                        penaltyDisplay.innerHTML = `
                            <p><strong>បែបបទ:</strong> <span>${inspection.penalty_format || 'N/A'}</span></p>
                            <p><strong>លក្ខខណ្ឌ:</strong> <span>${inspection.penalty_condition || 'N/A'}</span></p>
                            <p><strong>សុខភាពនិងសុវត្ថភាព:</strong> <span>${inspection.penalty_health || 'N/A'}</span></p>
                            <p><strong>វិជ្ជាជីវៈ:</strong> <span>${inspection.penalty_professional || 'N/A'}</span></p>
                        `;
                    }
                    if (infoDiv) infoDiv.classList.remove('d-none');
                } else {
                    if (infoDiv) infoDiv.classList.add('d-none');
                    Utils.showMessage('ការត្រួតពិនិត្យដើមនេះមិនមានកំហិតទេ', 'Info');
                }
            }
        } else {
            if (companyInfoDiv) companyInfoDiv.classList.add('d-none');
            if (infoDiv) infoDiv.classList.add('d-none');
        }
    }

    populateOriginalInspections() {
        const select = document.getElementById('originalInspectionSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- ជ្រើសរើសការត្រួតពិនិត្យដើម --</option>';
        
        this.allInspections.filter(inspection => inspection.has_penalty === 'មាន').forEach(inspection => {
            const option = document.createElement('option');
            option.value = inspection.id;
            option.textContent = `${inspection.no} - ${inspection.factory_name} (${inspection.inspection_date})`;
            select.appendChild(option);
        });
    }

    openInspectionForm(editId = null) {
        STATE.currentEditingId = editId;
        const modalTitle = document.getElementById('inspectionModalTitle');
        const form = document.getElementById('inspectionForm');

        if (modalTitle) {
            modalTitle.textContent = editId ? 'កែសម្រួលការត្រួតពិនិត្យ' : 'ការត្រួតពិនិត្យថ្មី';
        }

        if (form) {
            form.reset();
            this.resetAllSelections();
            if (editId) {
                this.populateInspectionForm(editId);
            }
        }

        ModalUtils.openModal('inspectionModal');
    }

    populateInspectionForm(id) {
        const inspection = this.allInspections.find(i => i.id.toString() === id.toString());
        if (!inspection) return;

        const form = document.getElementById('inspectionForm');
        if (!form) return;

        form.elements['no'].value = inspection.no || '';
        form.elements['group'].value = inspection.group || '';
        form.elements['inspection_date'].value = inspection.inspection_date || '';
        form.elements['factory_name'].value = inspection.factory_name || '';
        form.elements['sector'].value = inspection.sector || '';
        form.elements['case_subject'].value = inspection.case_subject || '';
        form.elements['village'].value = inspection.village || '';
        form.elements['commune'].value = inspection.commune || '';
        form.elements['district'].value = inspection.district || '';
        form.elements['province'].value = inspection.province || '';
        form.elements['remarks'].value = inspection.remarks || '';
        
        // Handle penalty section
        if (inspection.has_penalty === 'មាន') {
            this.togglePenaltyDetails(true);
            form.elements['penalty_format'].value = inspection.penalty_format || '';
            form.elements['penalty_condition'].value = inspection.penalty_condition || '';
            form.elements['penalty_health'].value = inspection.penalty_health || '';
            form.elements['penalty_professional'].value = inspection.penalty_professional || '';
        } else {
            this.togglePenaltyDetails(false);
        }
        
        // Handle fine section
        if (inspection.has_fine === 'មាន') {
            this.toggleFineDetails(true);
            form.elements['fine_amount'].value = inspection.fine_amount || '';
            form.elements['fine_type'].value = inspection.fine_type || '';
            form.elements['fine_reason'].value = inspection.fine_reason || '';
        } else {
            this.toggleFineDetails(false);
        }
    }

    resetAllSelections() {
        document.querySelectorAll('.penalty-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelectorAll('.penalty-details').forEach(details => {
            details.classList.remove('active');
        });
    }

    async handleInspectionFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (!data.no || !data.factory_name || !data.group || !data.inspection_date || !data.sector || !data.case_subject) {
            Utils.showMessage('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់', 'Error');
            return;
        }
        
        const submitBtn = document.getElementById('inspectionSubmitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> កំពុងរក្សាទុក...';
        submitBtn.disabled = true;
        
        try {
            if (STATE.currentEditingId) {
                const index = this.allInspections.findIndex(i => i.id.toString() === STATE.currentEditingId.toString());
                if (index !== -1) {
                    this.allInspections[index] = { ...this.allInspections[index], ...data, id: STATE.currentEditingId };
                }
                Utils.showMessage('ការត្រួតពិនិត្យត្រូវបានកែសម្រួលដោយជោគជ័យ!', 'Success');
            } else {
                const newInspection = {
                    id: Date.now(),
                    ...data,
                    created_at: new Date().toISOString()
                };
                this.allInspections.push(newInspection);
                Utils.showMessage('ការត្រួតពិនិត្យត្រូវបានបង្កើតដោយជោគជ័យ!', 'Success');
            }
            
            ModalUtils.closeModal('inspectionModal');
            this.renderInspections();
            this.populateOriginalInspections();
        } catch (error) {
            console.error('Save error:', error);
            Utils.showMessage('មានបញ្ហាក្នុងការរក្សាទុកការត្រួតពិនិត្យ', 'Error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    openFollowupForm(editId = null) {
        STATE.currentEditingId = editId;
        const modalTitle = document.getElementById('followupModalTitle');
        const form = document.getElementById('followupForm');

        if (modalTitle) {
            modalTitle.textContent = editId ? 'កែសម្រួលតាមដានកំហិត' : 'តាមដានកំហិតថ្មី';
        }

        if (form) {
            form.reset();
            this.resetAllSelections();
            this.populateOriginalInspections();
            if (editId) {
                this.populateFollowupForm(editId);
            }
        }

        ModalUtils.openModal('followupModal');
    }

    populateFollowupForm(id) {
        const followup = this.allFollowups.find(f => f.id.toString() === id.toString());
        if (!followup) return;

        const form = document.getElementById('followupForm');
        if (!form) return;

        form.elements['no'].value = followup.no || '';
        form.elements['original_inspection'].value = followup.original_inspection || '';
        form.elements['followup_date'].value = followup.followup_date || '';
        form.elements['conclusion'].value = followup.conclusion || '';
        
        // Handle follow-up result section
        if (followup.penalty_implemented === 'មិនអនុវត្ត') {
            this.toggleFollowupDetails(true);
            form.elements['followup_format'].value = followup.followup_format || '';
            form.elements['followup_condition'].value = followup.followup_condition || '';
            form.elements['followup_health'].value = followup.followup_health || '';
            form.elements['followup_professional'].value = followup.followup_professional || '';
        } else {
            this.toggleFollowupDetails(false);
        }
        
        // Load original inspection data
        this.loadOriginalInspectionData();
    }

    async handleFollowupFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (!data.no || !data.original_inspection || !data.followup_date) {
            Utils.showMessage('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់', 'Error');
            return;
        }
        
        const submitBtn = document.getElementById('followupSubmitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> កំពុងរក្សាទុក...';
        submitBtn.disabled = true;
        
        try {
            if (STATE.currentEditingId) {
                const index = this.allFollowups.findIndex(i => i.id.toString() === STATE.currentEditingId.toString());
                if (index !== -1) {
                    this.allFollowups[index] = { ...this.allFollowups[index], ...data, id: STATE.currentEditingId };
                }
                Utils.showMessage('ការតាមដានត្រូវបានកែសម្រួលដោយជោគជ័យ!', 'Success');
            } else {
                const originalInspection = this.allInspections.find(i => i.id.toString() === data.original_inspection);
                const newFollowup = {
                    id: Date.now(),
                    ...data,
                    original_inspection_data: originalInspection,
                    created_at: new Date().toISOString()
                };
                this.allFollowups.push(newFollowup);
                Utils.showMessage('ការតាមដានត្រូវបានបង្កើតដោយជោគជ័យ!', 'Success');
            }
            
            ModalUtils.closeModal('followupModal');
            this.renderFollowups();
        } catch (error) {
            console.error('Save error:', error);
            Utils.showMessage('មានបញ្ហាក្នុងការរក្សាទុកការតាមដាន', 'Error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // View functions
    viewInspection(id) {
        const inspection = this.allInspections.find(i => i.id.toString() === id.toString());
        if (!inspection) {
            Utils.showMessage('Inspection not found', 'Error');
            return;
        }
        
        const detailDiv = document.getElementById('inspectionDetail');
        if (detailDiv) {
            detailDiv.innerHTML = `
                <p><strong>លេខចូល:</strong> <span>${inspection.no || ''}</span></p>
                <p><strong>ក្រុម:</strong> <span>${inspection.group || ''}</span></p>
                <p><strong>កាលបរិច្ឆេទត្រួតពិនិត្យ:</strong> <span>${inspection.inspection_date || ''}</span></p>
                <p><strong>ឈ្មោះរោងចក្រ:</strong> <span>${inspection.factory_name || ''}</span></p>
                <p><strong>វិស័យ:</strong> <span>${inspection.sector || ''}</span></p>
                <p><strong>ប្រធានបទ:</strong> <span>${inspection.case_subject || ''}</span></p>
                <p><strong>ភូមិ:</strong> <span>${inspection.village || ''}</span></p>
                <p><strong>ឃុំ:</strong> <span>${inspection.commune || ''}</span></p>
                <p><strong>ស្រុក:</strong> <span>${inspection.district || ''}</span></p>
                <p><strong>ខេត្ត:</strong> <span>${inspection.province || ''}</span></p>
                <p><strong>កំហិត:</strong> <span>${inspection.has_penalty || ''}</span></p>
                ${inspection.has_penalty === 'មាន' ? `
                    <p><strong>បែបបទ:</strong> <span>${inspection.penalty_format || ''}</span></p>
                    <p><strong>លក្ខខណ្ឌ:</strong> <span>${inspection.penalty_condition || ''}</span></p>
                    <p><strong>សុខភាពនិងសុវត្ថភាព:</strong> <span>${inspection.penalty_health || ''}</span></p>
                    <p><strong>វិជ្ជាជីវៈ:</strong> <span>${inspection.penalty_professional || ''}</span></p>
                ` : ''}
                <p><strong>ផាក:</strong> <span>${inspection.has_fine || ''}</span></p>
                ${inspection.has_fine === 'មាន' ? `
                    <p><strong>ចំនួនទឹកប្រាក់:</strong> <span>${inspection.fine_amount || ''}</span></p>
                    <p><strong>ប្រភេទផាក:</strong> <span>${inspection.fine_type || ''}</span></p>
                    <p><strong>ហេតុផល:</strong> <span>${inspection.fine_reason || ''}</span></p>
                ` : ''}
                <p><strong>ផ្សេងៗ:</strong> <span>${inspection.remarks || ''}</span></p>
            `;
        }
        
        ModalUtils.openModal('viewInspectionModal');
    }

    viewFollowup(id) {
        const followup = this.allFollowups.find(f => f.id.toString() === id.toString());
        if (!followup) {
            Utils.showMessage('Follow-up not found', 'Error');
            return;
        }
        
        const original = followup.original_inspection_data || {};
        const detailDiv = document.getElementById('followupDetail');
        if (detailDiv) {
            detailDiv.innerHTML = `
                <p><strong>លេខចូល:</strong> <span>${followup.no || ''}</span></p>
                <p><strong>កាលបរិច្ឆេទតាមដាន:</strong> <span>${followup.followup_date || ''}</span></p>
                <p><strong>ការត្រួតពិនិត្យដើម:</strong> <span>${original.no || ''} - ${original.factory_name || ''}</span></p>
                <p><strong>លទ្ធផលតាមដាន:</strong> <span>${followup.penalty_implemented || ''}</span></p>
                ${followup.penalty_implemented === 'មិនអនុវត្ត' ? `
                    <p><strong>បែបបទ:</strong> <span>${followup.followup_format || ''}</span></p>
                    <p><strong>លក្ខខណ្ឌ:</strong> <span>${followup.followup_condition || ''}</span></p>
                    <p><strong>សុខភាពនិងសុវត្ថភាព:</strong> <span>${followup.followup_health || ''}</span></p>
                    <p><strong>វិជ្ជាជីវៈ:</strong> <span>${followup.followup_professional || ''}</span></p>
                ` : ''}
                <p><strong>សេចក្តីសន្និដ្ឋាន:</strong> <span>${followup.conclusion || ''}</span></p>
            `;
        }
        
        ModalUtils.openModal('viewFollowupModal');
    }

    // Delete functions
    deleteInspectionConfirm(id) {
        Utils.confirm(
            'តើអ្នកប្រាកដថាចង់លុបការត្រួតពិនិត្យនេះមែនទេ?',
            'លុបការត្រួតពិនិត្យ',
            (confirmed) => {
                if (confirmed) {
                    this.deleteInspection(id);
                }
            }
        );
    }

    deleteInspection(id) {
        try {
            this.allInspections = this.allInspections.filter(i => i.id.toString() !== id.toString());
            this.renderInspections();
            this.populateOriginalInspections();
            Utils.showMessage('Inspection deleted successfully', 'Success');
        } catch (error) {
            console.error('Delete error:', error);
            Utils.showMessage('Failed to delete inspection', 'Error');
        }
    }

    deleteFollowupConfirm(id) {
        Utils.confirm(
            'តើអ្នកប្រាកដថាចង់លុបតាមដានកំហិតនេះមែនទេ?',
            'លុបតាមដានកំហិត',
            (confirmed) => {
                if (confirmed) {
                    this.deleteFollowup(id);
                }
            }
        );
    }

    deleteFollowup(id) {
        try {
            this.allFollowups = this.allFollowups.filter(f => f.id.toString() !== id.toString());
            this.renderFollowups();
            Utils.showMessage('Follow-up deleted successfully', 'Success');
        } catch (error) {
            console.error('Delete error:', error);
            Utils.showMessage('Failed to delete follow-up', 'Error');
        }
    }

    // Export functions
    exportInspectionsToExcel() {
        try {
            const ws = XLSX.utils.json_to_sheet(this.allInspections);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Inspections");
            XLSX.writeFile(wb, "inspections.xlsx");
            Utils.showMessage('Excel file downloaded successfully', 'Success');
        } catch (error) {
            console.error('Export error:', error);
            Utils.showMessage('Failed to export to Excel', 'Error');
        }
    }

    exportFollowupsToExcel() {
        try {
            const exportData = this.allFollowups.map(followup => ({
                'លេខចូល': followup.no,
                'រោងចក្រ': followup.original_inspection_data?.factory_name || '',
                'កាលបរិច្ឆេទតាមដាន': followup.followup_date,
                'កាលបរិច្ឆេទកំហិតដើម': followup.original_inspection_data?.inspection_date || '',
                'ស្ថានភាពតាមដាន': followup.penalty_implemented,
                'សេចក្តីសន្និដ្ឋាន': followup.conclusion
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Followups");
            XLSX.writeFile(wb, "followups.xlsx");
            Utils.showMessage('Excel file downloaded successfully', 'Success');
        } catch (error) {
            console.error('Export error:', error);
            Utils.showMessage('Failed to export to Excel', 'Error');
        }
    }
}

// Global functions for HTML onclick attributes
window.showInspectionTab = function(tabName) {
    if (window.inspectionManager) {
        window.inspectionManager.showInspectionTab(tabName);
    }
};

window.togglePenaltyDetails = function(showDetails) {
    if (window.inspectionManager) {
        window.inspectionManager.togglePenaltyDetails(showDetails);
    }
};

window.toggleFineDetails = function(showDetails) {
    if (window.inspectionManager) {
        window.inspectionManager.toggleFineDetails(showDetails);
    }
};

window.toggleFollowupDetails = function(showDetails) {
    if (window.inspectionManager) {
        window.inspectionManager.toggleFollowupDetails(showDetails);
    }
};

window.updateFactoryInfo = function() {
    if (window.inspectionManager) {
        window.inspectionManager.updateFactoryInfo();
    }
};

window.loadOriginalInspectionData = function() {
    if (window.inspectionManager) {
        window.inspectionManager.loadOriginalInspectionData();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.inspectionManager = new InspectionManager();
});