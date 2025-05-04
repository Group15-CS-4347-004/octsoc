USE OCTSOC;

-- Employees + their managers
DROP VIEW IF EXISTS employee_with_manager;
CREATE VIEW employee_with_manager AS
SELECT
  e.employee_id,
  CONCAT(e.first_name, ' ', e.last_name) AS employee,
  CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM EMPLOYEE AS e
LEFT JOIN EMPLOYEE AS m ON e.man_id = m.employee_id
ORDER BY manager, employee;

-- Stores + department counts
DROP VIEW IF EXISTS store_with_dept_count;
CREATE VIEW store_with_dept_count AS
SELECT
  s.store_number,
  s.city,
  s.state,
  COUNT(d.department_number) AS department_count
FROM STORE AS s
LEFT JOIN DEPARTMENT AS d USING (store_number)
GROUP BY s.store_number, s.city, s.state
ORDER BY s.store_number;

-- Supplier SKU counts
DROP VIEW IF EXISTS supplier_stats;
CREATE VIEW supplier_stats AS
SELECT
  sup.supplier_id,
  sup.name,
  COUNT(sp.product_id) AS sku_count
FROM SUPPLIER AS sup
LEFT JOIN SUPPLY AS sp USING (supplier_id)
GROUP BY sup.supplier_id, sup.name
ORDER BY sku_count DESC;

-- Products expiring in the next 30 days
DROP VIEW IF EXISTS products_expiring_soon;
CREATE VIEW products_expiring_soon AS
SELECT
  product_id,
  name,
  msrp,
  sell_by
FROM PRODUCT
WHERE sell_by IS NOT NULL
  AND sell_by BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY sell_by;

-- Daily sales summary (last 30 days)
DROP VIEW IF EXISTS daily_sales;
CREATE VIEW daily_sales AS
SELECT
  DATE(date)   AS sales_day,
  SUM(total_price) AS total_sales
FROM SALES
GROUP BY sales_day
ORDER BY sales_day DESC
LIMIT 30;

