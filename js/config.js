// Configuration and constants
const CONFIG = {
    // API URLs
    API_BASE: 'https://uat-api-office2.thithabirdnest.com',
    DOC_API: 'https://uat-api-office2.thithabirdnest.com/doc',
    FACTORY_API: 'https://uat-api-office2.thithabirdnest.com/fac',
    USER_API: 'https://uat-api-office2.thithabirdnest.com/user',
    
    // App settings
    SIDEBAR_WIDTH: '260px',
    PRIMARY_COLOR: '#3498db',
    
    // Default values
    DEFAULT_PAGE_SIZE: 15,
    PAGE_SIZES: [15, 30, 60, 100, 'all']
};

// Global state
const STATE = {
    currentSection: 'documents',
    currentEditingId: null,
    selectedFile: null,
    allDocs: [],
    allFactories: [],
    allUsers: [],
    allInspections: [],
    allFollowups: []
};