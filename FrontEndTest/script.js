// script.js

async function loadCategories(userId) {
    try {
        const response = await (`/api/v1/product/categories/${userId}`);

        // Check if the response is not OK (e.g., 404 or 500 errors)
        if (!response.ok) {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            return;
        }

        // Log the raw response for debugging
        const rawData = await response.text();
        console.log('Raw response:', rawData);

        // Parse the raw text as JSON
        const data = JSON.parse(rawData);

        if (data.success) {
            const categoriesList = document.getElementById('categoriesList');
            data.data.forEach(category => {
                const li = document.createElement('li');
                li.textContent = category.category;
                categoriesList.appendChild(li);
            });
        } else {
            console.error('No categories found');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Call the function with the appropriate user ID
document.addEventListener('DOMContentLoaded', () => {
    const userId = 1; // Replace with actual user ID if necessary
    loadCategories(userId);
});
