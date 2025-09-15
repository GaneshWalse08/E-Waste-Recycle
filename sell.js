import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Configuration ---
// PASTE YOUR IMGBB API KEY HERE
const IMGBB_API_KEY = 'af3029d9f98d06794a7d21c1070eaf75';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

// --- DOM Elements ---
const sellForm = document.getElementById('sell-form');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');

// --- Event Listener for Form Submission ---
sellForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const imageFiles = document.getElementById('product-image').files;
    if (!imageFiles || imageFiles.length === 0) {
        showStatus('Please select at least one image to upload.', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = `Uploading ${imageFiles.length} image(s)...`;
    showStatus('Uploading images, please wait...', 'info');

    try {
        const uploadPromises = Array.from(imageFiles).map(file => uploadImage(file));
        const imageUrls = await Promise.all(uploadPromises);
        
        showStatus('Images uploaded! Saving product details...', 'info');
        const productData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            brand: document.getElementById('product-brand').value,
            yearsOld: document.getElementById('product-age').value,
            workingCondition: document.getElementById('working-condition').value,
            description: document.getElementById('product-description').value,
            imageUrls: imageUrls,
            createdAt: new Date()
        };

        await addDoc(collection(window.db, "products"), productData);
        
        showStatus('Product listed successfully!', 'success');
        sellForm.reset();

    } catch (error) {
        console.error("Error:", error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'List My Item';
    }
});

async function uploadImage(imageFile) {
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', imageFile);

    const response = await fetch(IMGBB_UPLOAD_URL, {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to upload an image.');
    }
    return result.data.url;
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}