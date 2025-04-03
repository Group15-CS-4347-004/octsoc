CREATE DATABASE IF NOT EXISTS octsoc;
USE octsoc;

-- Store Table
CREATE TABLE store (
  store_number INT PRIMARY KEY,
  address VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state CHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL
);

-- Department Table
CREATE TABLE department (
  department_number INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  store_number INT NOT NULL,
  FOREIGN KEY (store_number) REFERENCES store(store_number)
);

-- Employee Table
CREATE TABLE employee (
  employee_id INT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_initial CHAR(1),
  last_name VARCHAR(50) NOT NULL,
  department_number INT NOT NULL,
  FOREIGN KEY (department_number) REFERENCES department(department_number)
);

-- Supplier Table
CREATE TABLE supplier (
  supplier_id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  contact_info VARCHAR(100)
);

-- Product Table
CREATE TABLE product (
  product_id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  msrp DECIMAL(10,2),
  sell_by_date DATE,
  supplier_id INT NOT NULL,
  department_number INT NOT NULL,
  FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id),
  FOREIGN KEY (department_number) REFERENCES department(department_number)
);

-- Customer Table
CREATE TABLE customer (
  membership_id INT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_initial CHAR(1),
  last_name VARCHAR(50) NOT NULL,
  membership_type VARCHAR(20),
  city VARCHAR(50),
  state CHAR(2),
  zip_code INT,
  email VARCHAR(100),
  phone_number VARCHAR(20),
  account_manager VARCHAR(100),
  shared_cardholder VARCHAR(100)
);

-- Inventory Table
CREATE TABLE inventory (
  inventory_id INT PRIMARY KEY,
  product_id INT,
  quantity INT,
  store_number INT,
  FOREIGN KEY (product_id) REFERENCES product(product_id),
  FOREIGN KEY (store_number) REFERENCES store(store_number)
);

-- Sales Transaction Table
CREATE TABLE sales_transaction (
  transaction_id INT PRIMARY KEY,
  membership_id INT,
  employee_id INT,
  date DATE,
  time TIME,
  total_price DECIMAL(20,2),
  FOREIGN KEY (membership_id) REFERENCES customer(membership_id),
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
);

-- Sales Transaction Details Table
CREATE TABLE sales_transaction_details (
  transaction_id INT,
  product_id INT,
  quantity INT,
  subtotal DECIMAL(10,2),
  FOREIGN KEY (transaction_id) REFERENCES sales_transaction(transaction_id),
  FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- Shipment Table
CREATE TABLE shipment (
  shipment_id INT PRIMARY KEY,
  store_destination INT,
  arrival_date DATE,
  supplier_id INT,
  FOREIGN KEY (store_destination) REFERENCES store(store_number),
  FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
);

-- Shipment Details Table
CREATE TABLE shipment_details (
  shipment_id INT,
  product_id INT,
  quantity INT,
  FOREIGN KEY (shipment_id) REFERENCES shipment(shipment_id),
  FOREIGN KEY (product_id) REFERENCES product(product_id)
);
