const API_ROOT = 'https://octsoc.diejor.tech';

// simple DOM helpers
const $ = id => document.getElementById(id);
const listify = (container, rows, render) => {
  container.innerHTML = '';
  rows.forEach(r => {
    const li = document.createElement('li');
    li.textContent = render(r);
    container.appendChild(li);
  });
};

/**
 * Universal fetch + render helper
 * @param {string} endpoint  path after /api/
 * @param {HTMLButtonElement} button
 * @param {HTMLElement} listContainer
 * @param {HTMLElement} statusElem
 * @param {Function} renderFn  (row) => string
 */
async function fetchAndRender({ endpoint, button, listContainer, statusElem, renderFn }) {
  const origText = button.textContent;
  button.disabled = true;
  button.textContent = button.dataset.loadingText;
  statusElem.textContent = '';
  listContainer.innerHTML = '';

  try {
    const res = await fetch(`${API_ROOT}/api/${endpoint}`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      statusElem.textContent = 'No records found.';
    } else {
      listify(listContainer, data, renderFn);
    }
  } catch (err) {
    console.error(err);
    statusElem.textContent = `Error: ${err.message}`;
  } finally {
    button.disabled = false;
    button.textContent = origText;
  }
}

// wire up each section

// Customers
$('loadCustomers').addEventListener('click', () =>
  fetchAndRender({
    endpoint:      'customer',
    button:        $('loadCustomers'),
    listContainer: $('customerList'),
    statusElem:    $('customerStatus'),
    renderFn: c => {
      const mi = c.middle_initial ? ` ${c.middle_initial}.` : '';
      return `${c.membership_id}: ${c.first_name}${mi} ${c.last_name} [${c.membership_type || 'N/A'}]`;
    }
  })
);
$('customerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = btn.textContent;
  btn.disabled = true; btn.textContent = btn.dataset.loadingText;

  const form = e.target;
  try {
    const payload = {
      first_name:     form.first_name.value,
      middle_initial: form.middle_initial.value || null,
      last_name:      form.last_name.value,
      membership_type: form.membership_type.value || null
    };
    const res = await fetch(`${API_ROOT}/api/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    form.reset();
    $('loadCustomers').click();
  } catch (err) {
    alert(`Failed to add customer: ${err.message}`);
    console.error(err);
  } finally {
    btn.disabled = false; btn.textContent = orig;
  }
});

// Products
$('loadProducts').addEventListener('click', () =>
  fetchAndRender({
    endpoint:      'product',
    button:        $('loadProducts'),
    listContainer: $('productList'),
    statusElem:    $('productStatus'),
    renderFn: p => `${p.product_id}: ${p.name} — $${p.msrp} (Sell-by ${p.sell_by_date || 'N/A'}) [Supp: ${p.supplier_id}, Dept: ${p.department_number}]`
  })
);
$('productForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = btn.textContent;
  btn.disabled = true; btn.textContent = btn.dataset.loadingText;

  const form = e.target;
  try {
    const payload = {
      name:              form.name.value,
      msrp:              parseFloat(form.msrp.value),
      sell_by_date:      form.sell_by_date.value || null,
      supplier_id:       parseInt(form.supplier_id.value, 10),
      department_number: parseInt(form.department_number.value, 10)
    };
    const res = await fetch(`${API_ROOT}/api/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    form.reset();
    $('loadProducts').click();
  } catch (err) {
    alert(`Failed to add product: ${err.message}`);
    console.error(err);
  } finally {
    btn.disabled = false; btn.textContent = orig;
  }
});

// Stores & Departments
$('loadStores').addEventListener('click', () =>
  fetchAndRender({
    endpoint:      'stores',
    button:        $('loadStores'),
    listContainer: $('storeList'),
    statusElem:    $('storeStatus'),
    renderFn: s => `#${s.store_number} — ${s.city}, ${s.state}  (${s.department_count} depts)`
  }).then(() => {
    // populate select after successful fetch
    const sel = $('storeSelect');
    sel.innerHTML = '<option hidden value="">Choose store…</option>';
    document.querySelectorAll('#storeList li').forEach(li => {
      // parse store_number from text
      const num = li.textContent.match(/^#(\d+)/)[1];
      const city = li.textContent.split('—')[1].trim().split(',')[0];
      const opt = document.createElement('option');
      opt.value = num;
      opt.textContent = `#${num} – ${city}`;
      sel.appendChild(opt);
    });
  })
);
$('storeSelect').addEventListener('change', () => {
  const id = $('storeSelect').value;
  if (!id) return;
  fetchAndRender({
    endpoint:      `stores/${id}/departments`,
    button:        $('loadStores'), // reuse store button just for loading state
    listContainer: $('deptList'),
    statusElem:    $('deptStatus'),
    renderFn: d => `${d.department_number}: ${d.name} (Mgr: ${d.manager||'—'})`
  });
});

// Employees
$('loadEmployees').addEventListener('click', () =>
  fetchAndRender({
    endpoint:      'employees',
    button:        $('loadEmployees'),
    listContainer: $('employeeList'),
    statusElem:    $('employeeStatus'),
    renderFn: e => `${e.employee_id}: ${e.employee} → ${e.manager||'None'}`
  })
);

// Suppliers
$('loadSuppliers').addEventListener('click', () =>
  fetchAndRender({
    endpoint:      'suppliers',
    button:        $('loadSuppliers'),
    listContainer: $('supplierList'),
    statusElem:    $('supplierStatus'),
    renderFn: s => `${s.supplier_id}: ${s.name} – ${s.sku_count} SKUs`
  })
);

// Expiring Products
$('loadExpiring').addEventListener('click', () =>
  fetchAndRender({
    endpoint:      'products/expiring',
    button:        $('loadExpiring'),
    listContainer: $('expiringList'),
    statusElem:    $('expiringStatus'),
    renderFn: p => `${p.product_id}: ${p.name} (Sell-by ${p.sell_by}) – $${p.msrp}`
  })
);

