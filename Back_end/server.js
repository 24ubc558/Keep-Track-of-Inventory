const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const fs = require('fs');
const path = require('path');



const app = express();
const PORT =  3000;
const JWT_SECRET = '9f7d0a4c3a1e2b8d6a0b72f4c9d832e8c1f4d7e5a2b9d0f7e3a8c4d2f1b6a9d0';


app.use(cors());
app.use(bodyParser.json());

// In-memory user storage (replace with database in production)
const users = [

  {
    id: 1,
    email: 'admin@gmail.com',
    password: bcrypt.hashSync('password123', 10), // "password123" hashed
    role: 'ADMIN',
    name: 'Shreya Raja'
  }
];

// Pre-hash the passwords (in real app, do this when creating users)
users.forEach(user => {
  if (user.password === 'password123') {
    user.password = bcrypt.hashSync(user.password, 10);
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  console.log("______----------",email,password);
  
  // Input validation
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }

  // Find user by email
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ 
      error: 'Invalid email or password' 
    });
  }

  // Check password
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({ 
      error: 'Invalid email or password' 
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );

  // Return success response with token
  res.json({
    token,
    role: user.role,
    name: user.name
  });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Example protected route for customers
app.get('/api/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'CUSTOMER') {
    return res.status(403).json({ error: 'Access denied. Customer role required.' });
  }

  res.json({
    message: 'Welcome to customer dashboard',
    user: req.user
  });
});

// Example protected route for owners
app.get('/api/owner-dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'OWNER') {
    return res.status(403).json({ error: 'Access denied. Owner role required.' });
  }

  res.json({
    message: 'Welcome to owner dashboard',
    user: req.user
  });
});

// Get current user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Return user data without password
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});




// for invoices

// GET /api/invoices - Retrieve all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await readJson('invoices.json', []);
    res.json(invoices);
  } catch (e) {
    console.error('Failed to read invoices:', e);
    res.status(500).json({ message: 'Server error' });
  }
});










const readJson = (filename, fallback = []) => {
  try {
    const raw = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    return JSON.parse(raw || 'null') || fallback;
  } catch (e) {
    return fallback;
  }
};
const writeJson = (filename, data) => {
  fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 2), 'utf8');
};

// Ensure files exist
if (!fs.existsSync(path.join(__dirname, 'products.json'))) {
  const initialProducts = [
    { id: Date.now(), name: 'Cola 500ml', barcode: '8901234567890', price: 35, taxPercent: 12, stock: 120 },
    { id: Date.now()+1, name: 'Chips 80g', barcode: '8901111111111', price: 20, taxPercent: 12, stock: 80 },
    { id: Date.now()+2, name: 'Milk 1L', barcode: '8902222222222', price: 54, taxPercent: 5, stock: 40 }
  ];
  writeJson('products.json', initialProducts);
}
if (!fs.existsSync(path.join(__dirname, 'invoices.json'))) {
  writeJson('invoices.json', []);
}

// PRODUCTS: list all
app.get('/api/products', (req, res) => {
  const products = readJson('products.json', []);
  res.json(products);
});

// PRODUCTS: find by barcode
app.get('/api/products/barcode/:code', (req, res) => {
  const code = req.params.code;
  const products = readJson('products.json', []);
  const found = products.find(p => p.barcode === code.trim());
  if (!found) return res.status(404).json({ message: 'Product not found' });
  res.json(found);
});

// INVOICES: save invoice
app.post('/api/invoices', (req, res) => {
  const invoice = req.body;
  if (!invoice || !invoice.id) return res.status(400).json({ message: 'Invalid invoice' });

  const invoices = readJson('invoices.json', []);
  invoices.push(invoice);
  writeJson('invoices.json', invoices);

  // Also decrement product stock (best-effort)
  try {
    const products = readJson('products.json', []);
    invoice.lines?.forEach(line => {
      const p = products.find(pp => pp.id === line.productId);
      if (p && typeof line.qty === 'number') {
        p.stock = Math.max(0, (p.stock || 0) - line.qty);
      }
    });
    writeJson('products.json', products);
  } catch (e) {
    // ignore
  }

  res.json({ message: 'Invoice saved', id: invoice.id });
});

// INVOICE: get by id
app.get('/api/invoices/:id', (req, res) => {
  const id = req.params.id;
  const invoices = readJson('invoices.json', []);
  const inv = invoices.find(i => String(i.id) === String(id));
  if (!inv) return res.status(404).json({ message: 'Invoice not found' });
  res.json(inv);
});



const filePath = path.join(__dirname, "products.json");
function readProducts() {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeProducts(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


// Get all items
app.get("/api/products", (req, res) => {
  res.json(readProducts());
});

// Add item
app.post("/api/products", (req, res) => {
  const products = readProducts();
  const newProduct = { id: Date.now(), ...req.body };
  products.push(newProduct);
  writeProducts(products);
  res.json(newProduct);
});

// Update item
app.put("/api/products/:id", (req, res) => {
  const products = readProducts();
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).send("Product not found");
  products[index] = { ...products[index], ...req.body };
  writeProducts(products);
  res.json(products[index]);
});

// Delete item
app.delete("/api/products/:id", (req, res) => {
  let products = readProducts();
  const id = parseInt(req.params.id);
  products = products.filter(p => p.id !== id);
  writeProducts(products);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`POS backend running on http://localhost:${PORT}`));