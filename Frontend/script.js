const categories = {};
const billItems = [];
let currentCustomer = { id: "0", name: "Customer Zero" };

// Function to load categories and products
async function loadCategories(userId) {
    try {
        // Fetch the categories
        const response = await fetch(`http://localhost:5000/api/v1/product/categories/${userId}`);
        const data = await response.json();

        if (data.success) {
            // Clear previous categories
            Object.keys(categories).forEach(key => delete categories[key]);

            // Populate category buttons
            const categoryButtonsContainer = document.getElementById('categoryButtons');
            categoryButtonsContainer.innerHTML = '';

            // For each category, fetch the products using GET and query parameters
            for (const category of data.data) {
                const categoryName = category.category;
                const encodedCategoryName = encodeURIComponent(categoryName);

                // Fetch products by category
                const productsResponse = await fetch(`http://localhost:5000/api/v1/product/ProductByCategory/${userId}?categoryName=${encodedCategoryName}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const productsData = await productsResponse.json();

                if (productsData.success) {
                    categories[categoryName] = productsData.data.map(product => ({
                        name: product.name,
                        price: product.price
                    }));
                } else {
                    console.error(`No products found for category: ${categoryName}`);
                }

                // Add category button
                const button = document.createElement('button');
                button.className = 'category-btn';
                button.textContent = categoryName;
                button.onclick = () => displayProducts(categoryName);
                categoryButtonsContainer.appendChild(button);
            }

            // Optionally, display the default category or an initial category
            if (data.data.length > 0) {
                displayProducts(data.data[0].category);
            }
        } else {
            console.error('No categories found');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Function to display products based on category
function displayProducts(category) {
    const productsGrid = document.getElementById("productsGrid");
    productsGrid.innerHTML = "";

    if (categories[category]) {
        categories[category].forEach(product => {
            const productBtn = document.createElement("button");
            productBtn.className = "grid-item";
            productBtn.textContent = product.name;
            productBtn.onclick = () => addProductToBill(product);
            productsGrid.appendChild(productBtn);
        });
    } else {
        productsGrid.innerHTML = "<p>No products available for this category.</p>";
    }
}

// Function to add products to the bill
function addProductToBill(product) {
    const existingItem = billItems.find(item => item.name === product.name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        billItems.push({ ...product, quantity: 1 });
    }
    updateBill();
}

// Function to update the bill display
function updateBill() {
    const billList = document.getElementById("bill-items");
    const totalElement = document.getElementById("total");

    billList.innerHTML = "";
    let subTotal = 0;
    
    billItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subTotal += itemTotal;
        
        const listItem = document.createElement("div");
        listItem.className = "product-item";
        listItem.innerHTML = `
            <span>${item.name}</span>
            <input class="quantity" type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.name}', this.value)">
            <span>$${itemTotal.toFixed(2)}</span>
            <button class="decrease-btn" onclick="removeProduct('${item.name}')">-</button>
        `;
        billList.appendChild(listItem);
    });
    
    const total = subTotal;

    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Function to update product quantity
function updateQuantity(productName, newQuantity) {
    const item = billItems.find(item => item.name === productName);
    if (item) {
        item.quantity = parseInt(newQuantity);
        updateBill();
    }
}

// Function to remove product from bill
function removeProduct(productName) {
    const itemIndex = billItems.findIndex(item => item.name === productName);
    if (itemIndex > -1) {
        billItems.splice(itemIndex, 1);
        updateBill();
    }
}

// Function to set customer information
function setCustomerInfo(customerId) {
    const customerDatabase = {
        "1": "John Doe",
        "2": "Jane Smith"
    };

    if (customerDatabase[customerId]) {
        currentCustomer = { id: customerId, name: customerDatabase[customerId] };
    } else {
        currentCustomer = { id: "0", name: "Customer Zero" };
    }

    document.getElementById("customer-name").textContent = `Customer: ${currentCustomer.name}`;
}

// Handle Pay and Print Buttons
function payAndPrint() {
    alert(`Printing bill for ${currentCustomer.name}...\nTotal: ${document.getElementById("total").textContent}`);
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
    const userId = 1; // Replace with actual user ID if necessary
    loadCategories(userId);

    // Set default customer info
    setCustomerInfo("0");

    document.getElementById("pay-btn").addEventListener("click", payAndPrint);
    document.getElementById("customer-id-input").addEventListener("change", (e) => {
        setCustomerInfo(e.target.value);
    });
});
