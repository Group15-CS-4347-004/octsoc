// script.js – Client-side JavaScript to interact with the API

// When the "Load Customers" button is clicked, fetch the customer list from the backend
document.getElementById('loadCustomers').addEventListener('click', () => {
  fetch('/api/customers')               // GET request to our backend API
    .then(response => response.json())  // Parse JSON from response
    .then(customers => {
      const listEl = document.getElementById('customerList');
      listEl.innerHTML = '';            // Clear current list
      // Populate the list with customer data
      customers.forEach(cust => {
        const item = document.createElement('li');
        item.textContent = `${cust.customer_id}: ${cust.name} (${cust.membership_level})`;
        listEl.appendChild(item);
      });
    })
    .catch(err => {
      console.error('Error loading customers:', err);
    });
});

// Handle the "Add Customer" form submission
document.getElementById('customerForm').addEventListener('submit', event => {
  event.preventDefault();  // Prevent the default form submission (page reload)
  const form = event.target;
  // Collect form data into an object
  const newCustomer = {
    name: form.name.value,
    membership_level: form.membership_level.value
  };
  // Send a POST request with JSON body
  fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCustomer)
  })
    .then(response => response.json())
    .then(createdCust => {
      console.log('Customer added:', createdCust);
      form.reset();             // Clear the form fields
      document.getElementById('loadCustomers').click();  // Refresh the list
    })
    .catch(err => {
      console.error('Error adding customer:', err);
    });
});

// Similar logic for Products:
document.getElementById('loadProducts').addEventListener('click', () => {
  fetch('/api/products')
    .then(res => res.json())
    .then(products => {
      const listEl = document.getElementById('productList');
      listEl.innerHTML = '';
      products.forEach(prod => {
        const item = document.createElement('li');
        item.textContent = `${prod.product_id}: ${prod.name} ($${prod.price}) [Dept ${prod.department_id}]`;
        listEl.appendChild(item);
      });
    })
    .catch(err => console.error('Error loading products:', err));
});

document.getElementById('productForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const newProduct = {
    name: form.name.value,
    price: parseFloat(form.price.value),
    department_id: parseInt(form.department_id.value)
  };
  fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProduct)
  })
    .then(res => res.json())
    .then(createdProd => {
      console.log('Product added:', createdProd);
      form.reset();
      document.getElementById('loadProducts').click();  // Refresh product list
    })
    .catch(err => console.error('Error adding product:', err));
});

