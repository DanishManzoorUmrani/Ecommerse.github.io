let cart = [];
let total = 0;
let products = [
    { id: 1, name: 'Product 1', price: 10, category: 'Electronics', image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Product 2', price: 15, category: 'Clothing', image: 'https://via.placeholder.com/150' }
];
let categories = ['Electronics', 'Clothing'];
let admins = [{ username: 'admin', password: '123', access: 'full' }];
let customers = [];
let orders = [];
let currentUser = null;

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const admin = admins.find(a => a.username === username && a.password === password);
    const customer = customers.find(c => c.username === username && c.password === password);
    
    if (admin) {
        currentUser = admin;
        document.getElementById('login').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        document.getElementById('login-link').innerText = 'Logout';
        updateAdminProductList();
        updateCategoryOptions();
        updateOrderList();
        updateAdminList();
    } else if (customer) {
        currentUser = customer;
        document.getElementById('login').style.display = 'none';
        document.getElementById('store').style.display = 'block';
        document.getElementById('login-link').innerText = 'Logout';
        updateProductList();
        updateFilterOptions();
    } else {
        alert('Invalid username or password');
    }
}

function logout() {
    currentUser = null;
    cart = [];
    total = 0;
    document.getElementById('login').style.display = 'block';
    document.getElementById('store').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('cart-page').style.display = 'none';
    document.getElementById('login-link').innerText = 'Login';
    document.getElementById('cart-count').innerText = '0';
}

function showRegister() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'block';
}

function showLogin() {
    document.getElementById('register').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}

function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    
    if (username && password) {
        if (admins.find(a => a.username === username) || customers.find(c => c.username === username)) {
            alert('Username already exists');
        } else {
            customers.push({ username, password, type: 'customer' });
            alert('Registration successful! Please login.');
            showLogin();
        }
    } else {
        alert('Please fill all fields');
    }
}

function showSection(sectionId) {
    if (!currentUser) {
        alert('Please login first!');
        return;
    }
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    document.getElementById('dashboard').style.display = currentUser.access ? 'flex' : 'none';
}

function showCart() {
    if (!currentUser || currentUser.type !== 'customer') {
        alert('Please login as a customer to view cart');
        document.getElementById('login').style.display = 'block';
        document.getElementById('cart-page').style.display = 'none';
        return;
    }
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('cart-page').style.display = 'block';
    updateCart();
}

function showAdminSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function updateProductList(filteredProducts = products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = filteredProducts.map(p => `
        <div class="product">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>Price: $${p.price}</p>
            <p>Category: ${p.category}</p>
            <button onclick="addToCart('${p.name}', ${p.price}, '${p.image}')">Add to Cart</button>
        </div>
    `).join('');
}

function updateAdminProductList() {
    const adminProductList = document.getElementById('admin-product-list');
    adminProductList.innerHTML = products.map(p => `
        <div class="product">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>Price: $${p.price}</p>
            <p>Category: ${p.category}</p>
            <button onclick="editProduct(${p.id})">Edit</button>
            <button onclick="deleteProduct(${p.id})">Delete</button>
        </div>
    `).join('');
}

function updateOrderList() {
    const orderList = document.getElementById('order-list');
    orderList.innerHTML = orders.map(order => `
        <tr>
            <td>${order.date}</td>
            <td>${order.customer.name}</td>
            <td>${order.customer.email}</td>
            <td>${order.customer.mobile}</td>
            <td>${order.customer.father}</td>
            <td>${order.customer.address}, ${order.customer.city}, ${order.customer.province}</td>
            <td>$${order.total}</td>
            <td>${order.cart.map(item => `${item.name} ($${item.price})`).join(', ')}</td>
        </tr>
    `).join('') || '<tr><td colspan="8">No orders yet.</td></tr>';
}

function updateAdminList() {
    const adminList = document.getElementById('admin-list');
    adminList.innerHTML = admins.map(admin => `
        <tr>
            <td>${admin.username}</td>
            <td>${admin.access}</td>
        </tr>
    `).join('') || '<tr><td colspan="2">No admins yet.</td></tr>';
}

function updateCategoryOptions() {
    const categorySelect = document.getElementById('product-category');
    categorySelect.innerHTML = '<option value="">Select Category</option>' + 
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('') +
        '<option value="new">Add New Category</option>';
}

function updateFilterOptions() {
    const filterSelect = document.getElementById('category-filter');
    filterSelect.innerHTML = '<option value="all">All</option>' + 
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function checkNewCategory() {
    const categorySelect = document.getElementById('product-category').value;
    const newCategoryInput = document.getElementById('new-category');
    newCategoryInput.style.display = categorySelect === 'new' ? 'block' : 'none';
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('image-preview').src = e.target.result;
            document.getElementById('image-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function addToCart(name, price, image) {
    if (!currentUser || currentUser.type !== 'customer') {
        alert('Please login as a customer to buy products');
        document.getElementById('login').style.display = 'block';
        return;
    }
    cart.push({ name, price, image });
    total += price;
    document.getElementById('cart-count').innerText = cart.length;
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = cart.map(item => `
        <div class="product">
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Price: $${item.price}</p>
        </div>
    `).join('') || '<p>Your cart is empty</p>';
    document.getElementById('cart-total').innerText = total;
}

function checkout() {
    if (!currentUser || currentUser.type !== 'customer') {
        alert('Please login or register to checkout');
        document.getElementById('login').style.display = 'block';
        document.getElementById('cart-page').style.display = 'none';
        return;
    }
    if (cart.length > 0) {
        document.getElementById('address').style.display = 'block';
    } else {
        alert('Cart is empty!');
    }
}

function submitAddress() {
    const name = document.getElementById('customer-name').value;
    const email = document.getElementById('customer-email').value;
    const mobile = document.getElementById('customer-mobile').value;
    const father = document.getElementById('customer-father').value;
    const address = document.getElementById('customer-address').value;
    const province = document.getElementById('customer-province').value;
    const city = document.getElementById('customer-city').value;

    if (name && email && mobile && father && address && province && city) {
        const orderDetails = {
            customer: { name, email, mobile, father, address, province, city },
            cart: [...cart],
            total,
            date: new Date().toLocaleString()
        };
        orders.push(orderDetails);
        console.log('Order Details:', orderDetails);
        alert('Order placed with Cash on Delivery!');
        document.getElementById('address').style.display = 'none';
        cart = [];
        total = 0;
        updateCart();
        document.getElementById('cart-count').innerText = '0';
        document.getElementById('cart-page').style.display = 'none';
        document.getElementById('store').style.display = 'block';
        if (currentUser && currentUser.access) {
            updateOrderList();
        }
    } else {
        alert('Please fill all fields');
    }
}

function addProduct() {
    const name = document.getElementById('product-name').value;
    const price = parseInt(document.getElementById('product-price').value);
    const categorySelect = document.getElementById('product-category').value;
    const newCategory = document.getElementById('new-category').value;
    const imageFile = document.getElementById('product-image').files[0];
    let image = 'https://via.placeholder.com/150';

    if (imageFile) {
        image = document.getElementById('image-preview').src;
        localStorage.setItem(`product-image-${name}`, image);
    }

    let category = categorySelect;
    if (categorySelect === 'new' && newCategory) {
        category = newCategory;
        categories.push(newCategory);
    }

    if (name && price && category) {
        products.push({ id: products.length + 1, name, price, category, image });
        document.getElementById('add-product').style.display = 'none';
        document.getElementById('new-category').style.display = 'none';
        showAdminSection('products');
        updateAdminProductList();
        updateProductList();
        updateFilterOptions();
    } else {
        alert('Please fill all fields');
    }
}

function deleteProduct(id) {
    if (currentUser.access === 'limited') {
        alert('You do not have permission to delete products');
        return;
    }
    products = products.filter(p => p.id !== id);
    updateAdminProductList();
    updateProductList();
}

function editProduct(id) {
    if (currentUser.access === 'limited') {
        alert('You do not have permission to edit products');
        return;
    }
    const product = products.find(p => p.id === id);
    const newName = prompt('Enter new name:', product.name);
    const newPrice = parseInt(prompt('Enter new price:', product.price));
    const newCategory = prompt('Enter new category:', product.category);
    if (newName && newPrice && newCategory) {
        product.name = newName;
        product.price = newPrice;
        product.category = newCategory;
        if (!categories.includes(newCategory)) {
            categories.push(newCategory);
            updateFilterOptions();
        }
        updateAdminProductList();
        updateProductList();
    }
}

function addNewAdmin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const access = document.getElementById('admin-access').value;
    if (username && password) {
        admins.push({ username, password, access });
        document.getElementById('add-admin').style.display = 'none';
        showAdminSection('admins');
        updateAdminList();
        alert(`Admin ${username} added with ${access} access`);
    } else {
        alert('Please fill all fields');
    }
}

function filterProducts() {
    const selectedCategory = document.getElementById('category-filter').value;
    const filteredProducts = selectedCategory === 'all' 
        ? products 
        : products.filter(p => p.category === selectedCategory);
    updateProductList(filteredProducts);
}














function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
            </div>
            <div class="cart-item-price">$${item.price}</div>
        </div>
    `).join('') || '<p>Your cart is empty</p>';
    document.getElementById('cart-total').innerText = total;
}