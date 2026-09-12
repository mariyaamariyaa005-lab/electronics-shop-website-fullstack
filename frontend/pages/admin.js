// ================================
// CONFIG
// ================================

const API_BASE_URL = "http://localhost:8080/api/products";


// ================================
// ELEMENT REFERENCES
// ================================

const productForm = document.getElementById("productForm");
const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const productIdInput = document.getElementById("productId");
const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");
const imageUrlInput = document.getElementById("imageUrl");

const productTableBody = document.getElementById("productTableBody");


// ================================
// HELPERS
// ================================

function showMessage(text, isError) {
    formMessage.textContent = text;
    formMessage.className = "form-message " + (isError ? "error" : "success");

    setTimeout(function () {
        formMessage.textContent = "";
        formMessage.className = "form-message";
    }, 4000);
}

function resetForm() {
    productForm.reset();
    productIdInput.value = "";
    formTitle.textContent = "Add a Product";
    submitBtn.textContent = "Add Product";
    cancelEditBtn.hidden = true;
}

function fillFormForEdit(product) {
    productIdInput.value = product.id;
    nameInput.value = product.name;
    categoryInput.value = product.category;
    priceInput.value = product.price;
    descriptionInput.value = product.description;
    imageUrlInput.value = product.imageUrl;

    formTitle.textContent = "Edit Product";
    submitBtn.textContent = "Save Changes";
    cancelEditBtn.hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}


// ================================
// RENDER TABLE
// ================================

function renderTable(products) {

    if (!products || products.length === 0) {
        productTableBody.innerHTML = `<tr><td colspan="4">No products yet.</td></tr>`;
        return;
    }

    productTableBody.innerHTML = products.map(function (product) {
        return `
            <tr>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>&#8377;${product.price}</td>
                <td class="admin-actions">
                    <button class="btn-link edit-btn" data-id="${product.id}">Edit</button>
                    <button class="btn-link delete-btn" data-id="${product.id}">Delete</button>
                </td>
            </tr>
        `;
    }).join("");

    // Wire up the buttons we just rendered
    document.querySelectorAll(".edit-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            handleEditClick(btn.dataset.id);
        });
    });

    document.querySelectorAll(".delete-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            handleDeleteClick(btn.dataset.id);
        });
    });

}


// ================================
// API CALLS
// ================================

async function loadProducts() {

    try {

        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        const products = await response.json();
        renderTable(products);

    } catch (error) {

        console.error("Failed to load products:", error);
        productTableBody.innerHTML = `
            <tr><td colspan="4">Couldn't load products. Is the backend running?</td></tr>
        `;

    }

}

async function handleFormSubmit(event) {

    event.preventDefault();

    const productData = {
        name: nameInput.value.trim(),
        category: categoryInput.value,
        price: parseFloat(priceInput.value),
        description: descriptionInput.value.trim(),
        imageUrl: imageUrlInput.value.trim() || "https://placehold.co/400x300?text=Product"
    };

    const editingId = productIdInput.value;
    const isEditing = Boolean(editingId);

    const url = isEditing ? `${API_BASE_URL}/${editingId}` : API_BASE_URL;
    const method = isEditing ? "PUT" : "POST";

    try {

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        showMessage(isEditing ? "Product updated." : "Product added.", false);
        resetForm();
        loadProducts();

    } catch (error) {

        console.error("Failed to save product:", error);
        showMessage("Couldn't save the product. Is the backend running?", true);

    }

}

async function handleEditClick(id) {

    try {

        const response = await fetch(`${API_BASE_URL}/${id}`);

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        const product = await response.json();
        fillFormForEdit(product);

    } catch (error) {

        console.error("Failed to load product for editing:", error);
        showMessage("Couldn't load that product to edit.", true);

    }

}

async function handleDeleteClick(id) {

    const confirmed = window.confirm("Delete this product? This can't be undone.");

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        showMessage("Product deleted.", false);
        loadProducts();

    } catch (error) {

        console.error("Failed to delete product:", error);
        showMessage("Couldn't delete the product.", true);

    }

}


// ================================
// EVENT LISTENERS
// ================================

productForm.addEventListener("submit", handleFormSubmit);

cancelEditBtn.addEventListener("click", resetForm);


// ================================
// INITIAL LOAD
// ================================

loadProducts();
