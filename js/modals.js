// Modals Management
function initModals() {
    console.log('🔧 Initializing modals...');
    // Modal-specific initialization can go here
    console.log('✅ Modals initialized');
}

// Factory information update
function updateFactoryInfo() {
    const select = document.querySelector('select[name="factory_name"]');
    if (!select) return;
    
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.value) {
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

// Load original inspection data for follow-up
function loadOriginalInspectionData() {
    const select = document.getElementById('originalInspectionSelect');
    if (!select) return;
    
    const inspectionId = select.value;
    const infoDiv = document.getElementById('originalPenaltyInfo');
    const companyInfoDiv = document.getElementById('companyInfoDisplay');
    const penaltyDisplay = document.getElementById('penaltyDisplay');
    
    if (inspectionId) {
        const inspection = APP_STATE.data.inspections.find(i => i.id.toString() === inspectionId);
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
                showMessage('ការត្រួតពិនិត្យដើមនេះមិនមានកំហិតទេ', 'Info');
            }
        }
    } else {
        if (companyInfoDiv) companyInfoDiv.classList.add('d-none');
        if (infoDiv) infoDiv.classList.add('d-none');
    }
}

// Form submission handlers for inspection management
async function handleInspectionSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (!data.no || !data.factory_name || !data.group || !data.inspection_date || !data.sector || !data.case_subject) {
        showMessage('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់', 'Error');
        return;
    }
    
    const submitBtn = document.getElementById('inspectionSubmitBtn');
    setLoadingState(submitBtn, true);
    
    try {
        if (APP_STATE.currentEditingId) {
            const index = APP_STATE.data.inspections.findIndex(i => i.id.toString() === APP_STATE.currentEditingId.toString());
            if (index !== -1) {
                APP_STATE.data.inspections[index] = { ...APP_STATE.data.inspections[index], ...data, id: APP_STATE.currentEditingId };
            }
            showMessage('ការត្រួតពិនិត្យត្រូវបានកែសម្រួលដោយជោគជ័យ!', 'Success');
        } else {
            const newInspection = {
                id: generateId(),
                ...data,
                created_at: new Date().toISOString()
            };
            APP_STATE.data.inspections.push(newInspection);
            showMessage('ការត្រួតពិនិត្យត្រូវបានបង្កើតដោយជោគជ័យ!', 'Success');
        }
        
        closeModal('inspectionModal');
        renderInspections();
        populateOriginalInspections();
    } catch (error) {
        console.error('Save error:', error);
        showMessage('មានបញ្ហាក្នុងការរក្សាទុកការត្រួតពិនិត្យ', 'Error');
    } finally {
        setLoadingState(submitBtn, false);
    }
}

async function handleFollowupSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (!data.no || !data.original_inspection || !data.followup_date) {
        showMessage('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់', 'Error');
        return;
    }
    
    const submitBtn = document.getElementById('followupSubmitBtn');
    setLoadingState(submitBtn, true);
    
    try {
        if (APP_STATE.currentEditingId) {
            const index = APP_STATE.data.followups.findIndex(i => i.id.toString() === APP_STATE.currentEditingId.toString());
            if (index !== -1) {
                APP_STATE.data.followups[index] = { ...APP_STATE.data.followups[index], ...data, id: APP_STATE.currentEditingId };
            }
            showMessage('ការតាមដានត្រូវបានកែសម្រួលដោយជោគជ័យ!', 'Success');
        } else {
            const originalInspection = APP_STATE.data.inspections.find(i => i.id.toString() === data.original_inspection);
            const newFollowup = {
                id: generateId(),
                ...data,
                original_inspection_data: originalInspection,
                created_at: new Date().toISOString()
            };
            APP_STATE.data.followups.push(newFollowup);
            showMessage('ការតាមដានត្រូវបានបង្កើតដោយជោគជ័យ!', 'Success');
        }
        
        closeModal('followupModal');
        renderFollowups();
    } catch (error) {
        console.error('Save error:', error);
        showMessage('មានបញ្ហាក្នុងការរក្សាទុកការតាមដាន', 'Error');
    } finally {
        setLoadingState(submitBtn, false);
    }
}