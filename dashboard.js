import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Wait for the DOM and Firebase to be ready ---
document.addEventListener('DOMContentLoaded', () => {
    // A short delay to ensure window.db is initialized from the inline script
    setTimeout(fetchProducts, 100); 
});

// --- Main function to fetch and display products ---
async function fetchProducts() {
    if (!window.db) {
        console.error("Firestore is not initialized!");
        document.getElementById('loading-message').innerText = 'Error: Could not connect to the database.';
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(window.db, "products"));
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        displayProducts(products);

    } catch (error) {
        console.error("Error fetching products: ", error);
        document.getElementById('loading-message').innerText = 'Failed to fetch listings. Please try again later.';
    }
}

// --- Function to render products on the page ---
function displayProducts(products) {
    const listingsContainer = document.getElementById('listings-container');
    const categoryNav = document.getElementById('category-nav');
    
    // Clear loading message
    listingsContainer.innerHTML = ''; 
    categoryNav.innerHTML = '';

    const ALL_CATEGORIES = [
        "Computers & Laptops",
        "Mobile Phones & Tablets",
        "Computer Accessories",
        "Monitors & Display Devices",
        "Printers & Scanners",
        "Home Appliances",
        "Large Appliances",
        "Batteries & Power Devices",
        "Networking Devices",
        "Lighting & Other Electronics"
    ];

    const productsByCategory = products.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    ALL_CATEGORIES.forEach(category => {
        const categoryId = category.replace(/\s*&\s*|\s+/g, '-');
        const navLink = document.createElement('a');
        navLink.href = `#category-${categoryId}`;
        navLink.textContent = category;
        navLink.addEventListener('click', (e) => {
            e.preventDefault();
            const targetElement = document.getElementById(`category-${categoryId}`);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
        categoryNav.appendChild(navLink);

        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.id = `category-${categoryId}`;
        
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category;
        categorySection.appendChild(categoryTitle);

        const productGrid = document.createElement('div');
        productGrid.className = 'product-grid';

        const itemsInCategory = productsByCategory[category];
        if (itemsInCategory && itemsInCategory.length > 0) {
            itemsInCategory.forEach(product => {
                const card = createProductCard(product);
                productGrid.appendChild(card);
            });
        } else {
            const noProductsMessage = document.createElement('p');
            noProductsMessage.className = 'no-products-message';
            noProductsMessage.textContent = 'No products currently listed in this category.';
            productGrid.appendChild(noProductsMessage);
        }

        categorySection.appendChild(productGrid);
        listingsContainer.appendChild(categorySection);
    });
}

// --- Function to create a single product card ---
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // **MODIFIED**: Use the first image from the imageUrls array for the card.
    const primaryImageUrl = (product.imageUrls && product.imageUrls.length > 0)
        ? product.imageUrls[0]
        : 'https://placehold.co/300x200/CCCCCC/FFFFFF?text=No+Image';

    card.innerHTML = `
        <img src="${primaryImageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/CCCCCC/FFFFFF?text=No+Image';">
        <div class="product-card-content">
            <h3>${product.name || 'No Name'}</h3>
            <p>
                <strong>Working:</strong> ${product.workingCondition || 'N/A'}<br>
                <strong>Age:</strong> ${product.yearsOld ? `${product.yearsOld} years` : 'N/A'}
            </p>
            <div class="product-card-actions">
                <div class="checkbox-container">
                    <input type="checkbox" id="select-${product.id}" name="select-${product.id}">
                    <label for="select-${product.id}">Select</label>
                </div>
                <button class="btn btn-secondary view-more-btn">View More</button>
            </div>
        </div>
    `;

    card.querySelector('.view-more-btn').addEventListener('click', () => {
        showModal(product);
    });

    return card;
}

// --- Modal Functionality ---
const modal = document.getElementById('details-modal');
const closeButton = document.querySelector('.close-button');

function showModal(product) {
    const modalBody = document.getElementById('modal-body');
    
    // **MODIFIED**: Build an image gallery for the modal.
    let imageGalleryHtml = '';
    const images = product.imageUrls || [];

    if (images.length > 0) {
        const mainImage = `<img src="${images[0]}" alt="${product.name}" class="modal-main-image" id="modal-main-img">`;
        let thumbnails = '';
        if (images.length > 1) {
            thumbnails = '<div class="modal-thumbnails">';
            images.forEach(imgUrl => {
                thumbnails += `<img src="${imgUrl}" alt="thumbnail" class="modal-thumbnail">`;
            });
            thumbnails += '</div>';
        }
        imageGalleryHtml = `<div class="modal-gallery">${mainImage}${thumbnails}</div>`;
    } else {
        imageGalleryHtml = `<div class="modal-gallery"><img src="https://placehold.co/300x200/CCCCCC/FFFFFF?text=No+Image" alt="No Image" class="modal-main-image"></div>`;
    }

    modalBody.innerHTML = `
        ${imageGalleryHtml}
        <div class="modal-details">
            <h2>${product.name || 'No Name'}</h2>
            <p><strong>Category:</strong> ${product.category || 'N/A'}</p>
            <p><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
            <p><strong>Age:</strong> ${product.yearsOld ? `${product.yearsOld} years` : 'N/A'}</p>
            <p><strong>Working Condition:</strong> ${product.workingCondition || 'N/A'}</p>
            <p><strong>Description:</strong> ${product.description || 'No description provided.'}</p>
        </div>
    `;
    modal.style.display = 'block';

    // Add event listeners to thumbnails to change the main image.
    document.querySelectorAll('.modal-thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => {
            document.getElementById('modal-main-img').src = thumb.src;
        });
    });
}

closeButton.onclick = () => {
    modal.style.display = 'none';
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}