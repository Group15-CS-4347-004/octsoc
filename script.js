const API_ROOT = 'https://octsoc.diejor.tech';

// ——— CUSTOMER ———
document.getElementById('loadCustomers').addEventListener('click', () => {
  fetch(`${API_ROOT}/api/customer`)
    .then(r => r.json())
    .then(list => {
      const ul = document.getElementById('customerList');
      ul.innerHTML = '';
      list.forEach(c => {
        const mi = c.middle_initial ? ` ${c.middle_initial}.` : '';
        const li = document.createElement('li');
        li.textContent = 
          `${c.membership_id}: ${c.first_name}${mi} ${c.last_name}` +
          ` [${c.membership_type || 'N/A'}]`;
        ul.appendChild(li);
      });
    })
    .catch(console.error);
});

document.getElementById('customerForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const body = {
    first_name:      f.first_name.value,
    middle_initial:  f.middle_initial.value || null,
    last_name:       f.last_name.value,
    membership_type: f.membership_type.value || null,
  };
  fetch(`${API_ROOT}/api/customer`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
    .then(r => r.json())
    .then(() => {
      f.reset();
      document.getElementById('loadCustomers').click();
    })
    .catch(console.error);
});

// ——— PRODUCT ———
document.getElementById('loadProducts').addEventListener('click', () => {
  fetch(`${API_ROOT}/api/product`)
    .then(r => r.json())
    .then(list => {
      const ul = document.getElementById('productList');
      ul.innerHTML = '';
      list.forEach(p => {
        const li = document.createElement('li');
        li.textContent =
          `${p.product_id}: ${p.name} — $${p.msrp}` +
          ` (Sell By: ${p.sell_by_date || 'N/A'})` +
          ` [Supp: ${p.supplier_id}, Dept: ${p.department_number}]`;
        ul.appendChild(li);
      });
    })
    .catch(console.error);
});

document.getElementById('productForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const body = {
    name:              f.name.value,
    msrp:              parseFloat(f.msrp.value),
    sell_by_date:      f.sell_by_date.value || null,
    supplier_id:       parseInt(f.supplier_id.value, 10),
    department_number: parseInt(f.department_number.value, 10),
  };
  fetch(`${API_ROOT}/api/product`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
    .then(r => r.json())
    .then(() => {
      f.reset();
      document.getElementById('loadProducts').click();
    })
    .catch(console.error);
});

