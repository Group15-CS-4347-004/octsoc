const API_ROOT = 'https://octsoc.diejor.tech';
const $ = id => document.getElementById(id);

/**
 * Fetch JSON from /api/⟨endpoint⟩, toggle loading state on ⟨button⟩,
 * write errors or “no records” to ⟨statusElem⟩, and fill ⟨tableBody⟩.
 * @param {object} opts
 *   - endpoint: string
 *   - button: HTMLButtonElement
 *   - statusElem: HTMLElement
 *   - tableBody: HTMLElement
 *   - columns: Array<{ key: string }>
 */
async function fetchAndTable({ endpoint, button, statusElem, tableBody, columns }) {
  const origText = button.textContent;
  button.disabled = true;
  button.textContent = button.dataset.loadingText;
  statusElem.textContent = '';
  tableBody.innerHTML = '';

  try {
    const res = await fetch(`${API_ROOT}/api/${endpoint}`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      statusElem.textContent = 'No records found.';
    } else {
      tableBody.innerHTML = data.map(row => {
        const cells = columns.map(col => `<td class="px-4 py-2">${row[col.key] ?? ''}</td>`).join('');
        return `<tr class="border-b dark:border-gray-600">${cells}</tr>`;
      }).join('');
    }
  } catch (err) {
    console.error(err);
    statusElem.textContent = `Error: ${err.message}`;
  } finally {
    button.disabled = false;
    button.textContent = origText;
  }
}

// Customers
$('loadCustomers').addEventListener('click', () =>
  fetchAndTable({
    endpoint:    'customer',
    button:      $('loadCustomers'),
    statusElem:  $('customerStatus'),
    tableBody:   $('customerTableBody'),
    columns:     [
      { key:'membership_id' },
      { key:'first_name' },
      { key:'middle_initial' },
      { key:'last_name' },
      { key:'membership_type' }
    ]
  })
);

// Add Customer
$('customerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = btn.textContent;
  btn.disabled = true; btn.textContent = btn.dataset.loadingText;

  const f = e.target;
  try {
    const body = {
      first_name:     f.first_name.value,
      middle_initial: f.middle_initial.value || null,
      last_name:      f.last_name.value,
      membership_type: f.membership_type.value || null
    };
    const res = await fetch(`${API_ROOT}/api/customer`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    f.reset();
    $('loadCustomers').click();
  } catch (err) {
    alert(`Failed to add: ${err.message}`);
  } finally {
    btn.disabled = false; btn.textContent = orig;
  }
});

// Products
$('loadProducts').addEventListener('click', () =>
  fetchAndTable({
    endpoint:   'product',
    button:     $('loadProducts'),
    statusElem: $('productStatus'),
    tableBody:  $('productTableBody'),
    columns: [
      { key:'product_id' },
      { key:'name' },
      { key:'msrp' },
      { key:'sell_by_date' },
      { key:'supplier_id' },
      { key:'department_number' }
    ]
  })
);

// Add Product
$('productForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = btn.textContent;
  btn.disabled = true; btn.textContent = btn.dataset.loading-text;

  const f = e.target;
  try {
    const body = {
      name:              f.name.value,
      msrp:              parseFloat(f.msrp.value),
      sell_by_date:      f.sell_by_date.value || null,
      supplier_id:       +f.supplier_id.value,
      department_number: +f.department_number.value
    };
    const res = await fetch(`${API_ROOT}/api/product`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    f.reset();
    $('loadProducts').click();
  } catch (err) {
    alert(`Failed to add: ${err.message}`);
  } finally {
    btn.disabled = false; btn.textContent = orig;
  }
});

// Stores
$('loadStores').addEventListener('click', () =>
  fetchAndTable({
    endpoint:   'stores',
    button:     $('loadStores'),
    statusElem: $('storeStatus'),
    tableBody:  $('storeTableBody'),
    columns: [
      { key:'store_number' },
      { key:'city' },
      { key:'state' },
      { key:'department_count' }
    ]
  }).then(() => {
    // populate <select> after table loads
    const sel = $('storeSelect');
    sel.innerHTML = '<option hidden value="">Choose store…</option>';
    document.querySelectorAll('#storeTableBody tr').forEach(tr => {
      const num = tr.children[0].textContent;
      const city = tr.children[1].textContent;
      const opt = document.createElement('option');
      opt.value = num;
      opt.textContent = `#${num} – ${city}`;
      sel.appendChild(opt);
    });
  })
);

// Departments
$('storeSelect').addEventListener('change', () => {
  const id = $('storeSelect').value;
  if (!id) return;
  fetchAndTable({
    endpoint:   `stores/${id}/departments`,
    button:     $('loadStores'),
    statusElem: $('deptStatus'),
    tableBody:  $('deptTableBody'),
    columns: [
      { key:'department_number' },
      { key:'name' },
      { key:'manager' }
    ]
  });
});

// Employees
$('loadEmployees').addEventListener('click', () =>
  fetchAndTable({
    endpoint:   'employees',
    button:     $('loadEmployees'),
    statusElem: $('employeeStatus'),
    tableBody:  $('employeeTableBody'),
    columns: [
      { key:'employee_id' },
      { key:'employee' },
      { key:'manager' }
    ]
  })
);

// Suppliers
$('loadSuppliers').addEventListener('click', () =>
  fetchAndTable({
    endpoint:   'suppliers',
    button:     $('loadSuppliers'),
    statusElem: $('supplierStatus'),
    tableBody:  $('supplierTableBody'),
    columns: [
      { key:'supplier_id' },
      { key:'name' },
      { key:'sku_count' }
    ]
  })
);

// Expiring Products
$('loadExpiring').addEventListener('click', () =>
  fetchAndTable({
    endpoint:   'products/expiring',
    button:     $('loadExpiring'),
    statusElem: $('expiringStatus'),
    tableBody:  $('expiringTableBody'),
    columns: [
      { key:'product_id' },
      { key:'name' },
      { key:'sell_by' },
      { key:'msrp' }
    ]
  })
);

