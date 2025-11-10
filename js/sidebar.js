loadSidebar() {
    // Instead of fetching from file, use template literal
    const sidebarHTML = `
        <nav class="sidebar" id="sidebar">
            <div class="navbar-header">
                <div class="navbar-brand fw-bold fs-5">
                    <i class="bi bi-folder"></i> ប្រព័ន្ធគ្រប់គ្រង
                </div>
                <button class="btn btn-sm btn-outline-secondary" id="hideSidebar" title="Hide Sidebar">
                    <i class="bi bi-chevron-left"></i>
                </button>
            </div>
            <div class="navbar-links">
                <a href="#" class="active" data-section="documents">
                    <i class="bi bi-file-earmark"></i>
                    <span>ឯកសារ</span>
                </a>
                <a href="#" data-section="inspectionmanagement">
                    <i class="bi bi-search"></i>
                    <span>គ្រប់គ្រងអធិការកិច្ច</span>
                </a>
                <a href="#" data-section="factories">
                    <i class="bi bi-building"></i>
                    <span>រោងចក្រ</span>
                </a>
                <a href="#" data-section="users">
                    <i class="bi bi-people"></i>
                    <span>អ្នកប្រើប្រាស់</span>
                </a>
            </div>
        </nav>
    `;
    
    document.getElementById('sidebar-container').innerHTML = sidebarHTML;
    this.initializeSidebarLinks();
}