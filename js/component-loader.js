// Component Loader
class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.loadedComponents = new Set();
    }

    // Register a component
    registerComponent(name, html) {
        this.components.set(name, html);
        this.loadedComponents.add(name);
    }

    // Load component into container
    async loadComponent(componentName, containerId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Container ${containerId} not found`);
                return false;
            }

            // Check if component is already cached
            if (this.components.has(componentName)) {
                container.innerHTML = this.components.get(componentName);
                return true;
            }

            // Try to fetch from server if not in cache
            console.log(`Loading component: ${componentName}`);
            const response = await fetch(`components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`Component ${componentName} not found (${response.status})`);
            }
            
            const html = await response.text();
            this.registerComponent(componentName, html);
            container.innerHTML = html;
            console.log(`✅ Component loaded: ${componentName}`);
            return true;
            
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            
            // Provide fallback content for essential components
            if (componentName === 'sidebar') {
                container.innerHTML = this.getFallbackSidebar();
                return true;
            }
            
            return false;
        }
    }

    // Load multiple components
    async loadComponents(components) {
        const promises = components.map(([componentName, containerId]) => 
            this.loadComponent(componentName, containerId)
        );
        
        const results = await Promise.allSettled(promises);
        
        // Log results
        results.forEach((result, index) => {
            const [componentName] = components[index];
            if (result.status === 'fulfilled' && result.value) {
                console.log(`✅ Success: ${componentName}`);
            } else {
                console.error(`❌ Failed: ${componentName}`);
            }
        });
        
        return results;
    }

    // Check if component is loaded
    isComponentLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    // Get fallback sidebar (in case component fails to load)
    getFallbackSidebar() {
        return `
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
                    <a href="#" class="active" onclick="showSection('documents', event)">
                        <i class="bi bi-file-earmark"></i>
                        <span>ឯកសារ</span>
                    </a>
                    <a href="#" onclick="showSection('inspectionmanagement', event)">
                        <i class="bi bi-search"></i>
                        <span>គ្រប់គ្រងអធិការកិច្ច</span>
                    </a>
                    <a href="#" onclick="showSection('factories', event)">
                        <i class="bi bi-building"></i>
                        <span>រោងចក្រ</span>
                    </a>
                    <a href="#" onclick="showSection('users', event)">
                        <i class="bi bi-people"></i>
                        <span>អ្នកប្រើប្រាស់</span>
                    </a>
                </div>
            </nav>
        `;
    }
}

// Initialize component loader
const componentLoader = new ComponentLoader();