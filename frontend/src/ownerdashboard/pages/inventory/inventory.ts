import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  taxPercent: number;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class Inventory implements OnInit {
  products: Product[] = [];
  productData: Product = { name: '', price: 0, stock: 0, barcode: '', taxPercent: 0 };
  editing = false;
  selectedProduct: Product | null = null;
  showLowStockNotification: boolean = false;

  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
  }

  // Load products from API
  loadProducts() {
    this.http.get<Product[]>(this.apiUrl).subscribe((data) => {
      this.products = data;
      this.checkLowStock(); // Check after loading
    });
  }

  // Check for low stock products
  checkLowStock() {
    this.showLowStockNotification = this.products.some(p => p.stock < 10);
  }

  // Dismiss notification
  dismissNotification() {
    this.showLowStockNotification = false;
  }

  // Add or update product
  saveProduct() {
    if (this.editing && this.productData.id) {
      this.http.put<Product>(`${this.apiUrl}/${this.productData.id}`, this.productData)
        .subscribe(() => {
          this.loadProducts();
          this.resetForm();
        });
    } else {
      this.http.post<Product>(this.apiUrl, this.productData)
        .subscribe(() => {
          this.loadProducts();
          this.resetForm();
        });
    }
  }

  // Edit product
  editProduct(product: Product) {
    this.productData = { ...product };
    this.editing = true;
  }

  // Delete product
  deleteProduct(id?: number) {
    if (!id) return;
    if (confirm("Are you sure you want to delete this product?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.loadProducts());
    }
  }

  // View product in modal
  viewProduct(product: Product) {
    this.selectedProduct = product;
  }

  closeView() {
    this.selectedProduct = null;
  }

  resetForm() {
    this.productData = { name: '', price: 0, stock: 0, barcode: '', taxPercent: 0 };
    this.editing = false;
  }
}
