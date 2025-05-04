/* Root of the live API */
const API_ROOT = 'https://octsoc.diejor.tech';

/* ---------- Utility ---------- */
const $ = id => document.getElementById(id);
const listify = (container, rows, render) => {
  container.innerHTML = '';
  rows.forEach(r => {
    const li = document.createElement('li');
    li.textContent = render(r);
    container.appendChild(li);
  });
};

/* =================================================
   ==================  CUSTOMERS  ==================
   ================================================= */
$('loadCustomers').addEventListener('click', () => {
  fetch(`${API_ROOT}/api/customer`)
    .then(r => r.json())
    .then(rows => listify($('customerList'), rows, c => {
      const mi = c.middle_initial ? ` ${c.middle_initial}.` : '';
      return `${c.membership_id}: ${c.first_name}${mi} ${c.last_name} [${c.membership_type || 'N/A'}]`;
    }))
    .catch(console.error);
});

$('customerForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  fetch(`${API_ROOT}/api/customer`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name:      f.first_name.value,
      middle_initial:  f.middle_initial.value || null,
      last_name:       f.last_name.value,
      membership_type: f.membership_type.value || null
    }),
  })
    .then(() => { f.reset(); $('loadCustomers').click(); })
    .catch(console.error);
});

/* =================================================
   ==================  PRODUCTS  ===================
   ================================================= */
$('loadProducts').addEventListener('click', () => {
  fetch(`${API_ROOT}/api/product`)
    .then(r => r.json())
    .then(rows => listify($('productList'), rows, p =>
      `${p.product_id}: ${p.name} — $${p.msrp} (Sell By: ${p.sell_by_date || 'N/A'}) [Supp: ${p.supplier_id}, Dept: ${p.department_number}]`
    ))
    .catch(console.error);
});

$('productForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  fetch(`${API_ROOT}/api/product`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:              f.name.value,
      msrp:              parseFloat(f.msrp.value),
      sell_by_date:      f.sell_by_date.value || null,
      supplier_id:       parseInt(f.supplier_id.value, 10),
      department_number: parseInt(f.department_number.value, 10)
    }),
  })
    .then(() => { f.reset(); $('loadProducts').click(); })
    .catch(console.error);
});

/* =================================================
   ===================  STORES  ====================
   ================================================= */
$('loadStores').addEventListener('click', () => {
  fetch(`${API_ROOT}/api/stores`)
    .then(r => r.json())
    .then(rows => {
      listify($('storeList'), rows, s =>
        `#${s.store_number} — ${s.city}, ${s.state}  (${s.department_count} depts)`
      );
      /* fill drop‑down for department lookup */
      const sel = $('storeSelect');
      sel.innerHTML = '<option hidden value="">Choose store…</option>';
      rows.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.store_number;
        opt.textContent = `#${s.store_number} – ${s.city}`;
        sel.appendChild(opt);
      });
    })
    .catch(console.error);
});

/* =================================================
   ===========  DEPARTMENTS BY STORE  ==============
   ================================================= */
$('storeSelect').addEventListener('change', e => {
  const id = e.target.value;
  if (!id) return;
  fetch(`${API_ROOT}/api/stores/${id}/departments`)
    .then(r => r.json())
    .then(rows => listify($('deptList'), rows, d =>
      `${d.department_number}: ${d.name} (Mgr: ${d.manager || '—'})`
    ))
    .catch(console.error);
});

/* =================================================
   =================  EMPLOYEES  ===================
   ================================================= */
$('loadEmployees').addEventListener('click', () => {
  fetch(`${API_ROOT}/api/employees`)
    .then(r => r.json())
    .then(rows => listify($('employeeList'), rows, e =>
      `${e.employee_id}: ${e.employee}  →  ${e.manager || 'None'}`
    ))
    .catch(console.error);
});

/* =================================================
   =================  SUPPLIERS  ===================
   ================================================= */
$('loadSuppliers').addEventListener('click', () => {
  fetch(`${API_ROOT}/api/suppliers`)
    .then(r => r.json())
    .then(rows => listify($('supplierList'), rows, s =>
      `${s.supplier_id}: ${s.name} – ${s.sku_count} SKUs`
    ))
    .catch(console.error);
});

/* =================================================
   ===========  EXPIRING PRODUCTS (30d)  ===========
   ================================================= */
$('loadExpiring').addEventListener('click', () => {
  fetch(`${API_ROOT}/api/products/expiring`)
    .then(r => r.json())
    .then(rows => listify($('expiringList'), rows, p =>
      `${p.product_id}: ${p.name}  (Sell‑by ${p.sell_by}) – $${p.msrp}`
    ))
    .catch(console.error);
});

