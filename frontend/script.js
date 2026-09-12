// ================================
// CONFIG
// ================================

// Change this if your backend runs on a different host/port
const API_BASE_URL = "http://localhost:8080/api/products";


// ================================
// ELEMENT REFERENCES
// ================================

const searchInput = document.getElementById("productSearch");
const categoryCards = document.querySelectorAll(".category-card");
const productsSection = document.getElementById("products");
const productGrid = document.getElementById("productGrid");

// This holds the product data fetched from the backend,
// and the currently rendered card elements + active filters.
let allProducts = [];
let activeCategory = "all";


// ================================
// RENDER HELPERS
// ================================

function createProductCardHTML(product) {
    return `
        <div class="product-card"
             data-id="${product.id}"
             data-name="${product.name}"
             data-category="${product.category}">

            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.name}">
            </div>

            <p class="product-category">${product.category}</p>

            <h3>${product.name}</h3>

            <p>${product.description}</p>

            <p class="product-price">&#8377;${product.price}</p>

            <a href="./pages/product-details.html?id=${product.id}" class="btn">
                View Details
            </a>

        </div>
    `;
}

function renderProducts(products) {

    if (!products || products.length === 0) {
        productGrid.innerHTML = `<p class="loading-message">No products found.</p>`;
        return;
    }

    productGrid.innerHTML = products.map(createProductCardHTML).join("");
}


// ================================
// FILTER LOGIC (search + category combined)
// ================================

function applyFilters() {

    const searchText = searchInput.value.toLowerCase().trim();

    const filtered = allProducts.filter(function (product) {

        const matchesCategory =
            activeCategory === "all" ||
            product.category === activeCategory;

        const matchesSearch =
            searchText === "" ||
            product.name.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;

    });

    renderProducts(filtered);
}


// ================================
// EVENT LISTENERS
// ================================

searchInput.addEventListener("input", applyFilters);

categoryCards.forEach(function (categoryCard) {

    categoryCard.addEventListener("click", function () {

        activeCategory = categoryCard.dataset.category;

        categoryCards.forEach(function (c) {
            c.classList.remove("active");
        });
        categoryCard.classList.add("active");

        searchInput.value = "";
        applyFilters();

        if (productsSection) {
            productsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });

});


// ================================
// INITIAL LOAD — fetch from backend
// ================================

async function loadProducts() {

    try {

        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        allProducts = await response.json();
        applyFilters();

    } catch (error) {

        console.error("Failed to load products:", error);

        productGrid.innerHTML = `
            <p class="loading-message">
                Couldn't load products. Make sure the backend server is
                running at ${API_BASE_URL}.
            </p>
        `;

    }

}

loadProducts();
