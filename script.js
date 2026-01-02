// Product Management System
class ProductManager {
    constructor() {
        this.products = [];
        this.currentView = 'list'; // 'list' or 'card'
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.searchTerm = '';
        this.editingId = null;
        this.debounceTimer = null;

        this.init();
    }

    init() {
        this.initTheme();
        this.setupEventListeners();
        this.renderProducts();
    }

    initTheme() {
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('product-form');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Cancel button
        document.getElementById('cancel-btn').addEventListener('click', () => this.cancelEdit());

        // View toggle buttons
        document.getElementById('list-view-btn').addEventListener('click', () => this.switchView('list'));
        document.getElementById('card-view-btn').addEventListener('click', () => this.switchView('card'));

        // Search input with debounce
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Theme toggle button
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Form validation on input
        const formInputs = form.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    // Form Validation
    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const errorElement = document.getElementById(`${fieldName}-error`);

        // Clear previous error
        errorElement.textContent = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorElement.textContent = `${this.getFieldLabel(fieldName)} is required`;
            return false;
        }

        // Price validation
        if (fieldName === 'price' && value) {
            const price = parseFloat(value);
            if (isNaN(price) || price < 0) {
                errorElement.textContent = 'Price must be a valid positive number';
                return false;
            }
        }

        // Stock validation
        if (fieldName === 'stock' && value) {
            const stock = parseInt(value);
            if (isNaN(stock) || stock < 0) {
                errorElement.textContent = 'Stock must be a valid non-negative integer';
                return false;
            }
        }

        return true;
    }

    clearFieldError(field) {
        const errorElement = document.getElementById(`${field.name}-error`);
        errorElement.textContent = '';
    }

    getFieldLabel(fieldName) {
        const labels = {
            name: 'Name',
            price: 'Price',
            category: 'Category',
            stock: 'Stock',
            description: 'Description'
        };
        return labels[fieldName] || fieldName;
    }

    validateForm() {
        const form = document.getElementById('product-form');
        const fields = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Form Handling
    handleFormSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        const formData = new FormData(e.target);
        const productData = {
            id: this.editingId || Date.now().toString(),
            name: formData.get('name').trim(),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            stock: parseInt(formData.get('stock')) || 0,
            description: formData.get('description').trim(),
            image: 'https://images.unsplash.com/photo-1633174524827-db00a6b7bc74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YW1hem9ufGVufDB8fDB8fHww' // Dummy image for all products
        };

        if (this.editingId) {
            this.updateProduct(productData);
        } else {
            this.addProduct(productData);
        }

        this.resetForm();
    }

    addProduct(product) {
        this.products.push(product);
        this.renderProducts();
        this.showNotification('Product added successfully!', 'success');
    }

    updateProduct(product) {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            this.products[index] = product;
            this.renderProducts();
            this.showNotification('Product updated successfully!', 'success');
        }
    }

    deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== id);
            this.renderProducts();
            this.showNotification('Product deleted successfully!', 'success');
        }
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.editingId = id;
        document.getElementById('form-title').textContent = 'Edit Product';
        document.getElementById('submit-btn').textContent = 'Update Product';
        document.getElementById('cancel-btn').style.display = 'block';

        // Fill form with product data
        document.getElementById('name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('category').value = product.category;
        document.getElementById('stock').value = product.stock;
        document.getElementById('description').value = product.description || '';
        if (product.image) {
            document.getElementById('image-preview').src = product.image;
        }

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    cancelEdit() {
        this.editingId = null;
        this.resetForm();
    }

    resetForm() {
        document.getElementById('product-form').reset();
        document.getElementById('form-title').textContent = 'Add New Product';
        document.getElementById('submit-btn').textContent = 'Add Product';
        document.getElementById('cancel-btn').style.display = 'none';
        
        // Clear all error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });

        this.editingId = null;
    }

    // Search with Debounce
    handleSearch(term) {
        this.searchTerm = term.toLowerCase().trim();
        
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set new timer for 500ms debounce
        this.debounceTimer = setTimeout(() => {
            this.currentPage = 1; // Reset to first page on search
            this.renderProducts();
        }, 500);
    }

    getFilteredProducts() {
        if (!this.searchTerm) {
            return this.products;
        }
        return this.products.filter(product =>
            product.name.toLowerCase().includes(this.searchTerm)
        );
    }

    // View Toggle
    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.getElementById('list-view-btn').classList.toggle('active', view === 'list');
        document.getElementById('card-view-btn').classList.toggle('active', view === 'card');
        
        this.renderProducts();
    }

    // Pagination
    getPaginatedProducts() {
        const filtered = this.getFilteredProducts();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return {
            products: filtered.slice(startIndex, endIndex),
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / this.itemsPerPage)
        };
    }

    changePage(page) {
        const { totalPages } = this.getPaginatedProducts();
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Rendering
    renderProducts() {
        const { products, total, totalPages } = this.getPaginatedProducts();
        const container = document.getElementById('products-container');

        if (total === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            document.getElementById('pagination-container').innerHTML = '';
            return;
        }

        if (this.currentView === 'list') {
            container.innerHTML = this.renderListView(products);
        } else {
            container.innerHTML = this.renderCardView(products);
        }

        this.renderPagination(totalPages);
    }

    renderListView(products) {
        if (products.length === 0) {
            return this.getEmptyStateHTML();
        }

        let html = '<div class="list-view"><table><thead><tr>';
        html += '<th>Image</th><th>Name</th><th>Price</th><th>Category</th><th>Stock</th><th>Description</th><th>Actions</th>';
        html += '</tr></thead><tbody>';

        products.forEach(product => {
            html += `
                <tr>
                    <td><img src="${product.image || 'https://images.unsplash.com/photo-1633174524827-db00a6b7bc74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YW1hem9ufGVufDB8fDB8fHww'}" alt="${this.escapeHtml(product.name)}" class="product-image"></td>
                    <td><strong>${this.escapeHtml(product.name)}</strong></td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td><span class="category">${this.escapeHtml(product.category)}</span></td>
                    <td>${product.stock}</td>
                    <td>${this.escapeHtml(product.description || '-')}</td>
                    <td class="actions">
                        <button class="btn-edit" onclick="productManager.editProduct('${product.id}')">Edit</button>
                        <button class="btn-delete" onclick="productManager.deleteProduct('${product.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        return html;
    }

    renderCardView(products) {
        if (products.length === 0) {
            return this.getEmptyStateHTML();
        }

        let html = '<div class="card-view">';
        
        products.forEach(product => {
            html += `
                <div class="product-card">
                    <img src="${product.image || 'https://images.unsplash.com/photo-1633174524827-db00a6b7bc74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YW1hem9ufGVufDB8fDB8fHww'}" alt="${this.escapeHtml(product.name)}" class="product-card-image">
                    <div class="product-card-content">
                        <h3>${this.escapeHtml(product.name)}</h3>
                        <div class="price">$${product.price.toFixed(2)}</div>
                        <div class="category">${this.escapeHtml(product.category)}</div>
                        <div class="stock">Stock: ${product.stock}</div>
                        ${product.description ? `<div class="description">${this.escapeHtml(product.description)}</div>` : ''}
                        <div class="actions">
                            <button class="btn-edit" onclick="productManager.editProduct('${product.id}')">Edit</button>
                            <button class="btn-delete" onclick="productManager.deleteProduct('${product.id}')">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    renderPagination(totalPages) {
        const container = document.getElementById('pagination-container');
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        html += `<button class="pagination-btn" onclick="productManager.changePage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>`;

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            html += `<button class="pagination-btn" onclick="productManager.changePage(1)">1</button>`;
            if (startPage > 2) {
                html += `<span style="padding: 10px;">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="productManager.changePage(${i})">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span style="padding: 10px;">...</span>`;
            }
            html += `<button class="pagination-btn" onclick="productManager.changePage(${totalPages})">${totalPages}</button>`;
        }

        // Next button
        html += `<button class="pagination-btn" onclick="productManager.changePage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>`;

        container.innerHTML = html;
    }

    getEmptyStateHTML() {
        const { total } = this.getPaginatedProducts();
        if (this.searchTerm && total === 0) {
            return `
                <div class="empty-state">
                    <p style="font-size: 1.2rem; margin-bottom: 10px;">No products found</p>
                    <p>Try adjusting your search term</p>
                </div>
            `;
        }
        return `
            <div class="empty-state">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">No products yet</p>
                <p>Add your first product using the form on the left</p>
            </div>
        `;
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Simple notification (can be enhanced with a toast library)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the Product Manager
const productManager = new ProductManager();

