loadSection(section) {
    const sectionElement = document.getElementById(`${section}-section`);
    
    if (!sectionElement) return;
    
    // Define section templates
    const sectionTemplates = {
        documents: `
            <section id="documents-section">
                <header class="page-header">
                    <h1 class="mb-2"><i class="bi bi-folder"></i> ប្រព័ន្ធគ្រប់គ្រងឯកសារ</h1>
                    <p class="text-muted mb-0">Document Management System</p>
                </header>

                <div class="control-section d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <button class="btn btn-primary" id="openDocForm">
                        <i class="bi bi-plus-circle"></i> បញ្ចូលឯកសារថ្មី
                    </button>
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                        <select class="form-select" id="showCount" style="width: auto;">
                            <option value="15">15</option>
                            <option value="30">30</option>
                            <option value="60">60</option>
                            <option value="100">100</option>
                            <option value="all">All</option>
                        </select>
                        <input type="search" class="form-control" id="docSearch" placeholder="ស្វែងរកឯកសារ..." style="width: auto;">
                        <button class="btn btn-outline-secondary" id="exportDocExcel">
                            <i class="bi bi-download"></i> ទាញយក Excel
                        </button>
                    </div>
                </div>

                <div class="table-container">
                    <div class="table-wrapper">
                        <table class="table table-hover mb-0" id="documentTable">
                            <thead class="table-light">
                                <tr>
                                    <th>លេខចូល</th>
                                    <th>លេខលិខិត (IR)</th>
                                    <th>លេខចេញ</th>
                                    <th>ថ្ងៃខែលិខិត</th>
                                    <th>អង្គភាព</th>
                                    <th>ប្រភេទឯកសារ</th>
                                    <th>មន្រ្តីទទួល</th>
                                    <th>ស្ថានភាព</th>
                                    <th>សកម្មភាព</th>
                                </tr>
                            </thead>
                            <tbody id="docTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </section>
        `,
        // Add other sections here...
        factories: `
            <!-- Factory section HTML here -->
        `,
        users: `
            <!-- Users section HTML here -->
        `,
        inspectionmanagement: `
            <!-- Inspection section HTML here -->
        `
    };
    
    if (sectionTemplates[section]) {
        sectionElement.innerHTML = sectionTemplates[section];
        sectionElement.style.display = 'block';
        this.initializeSection(section);
    }
}