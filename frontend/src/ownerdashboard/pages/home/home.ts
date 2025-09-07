import { HttpClient } from '@angular/common/http';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, signal, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { map } from 'rxjs';
import { Barcodescannerservice } from '../../../services/barcodescannerservice';
type Product = {
  id: number;
  name: string;
  barcode: string;
  price: number;
  taxPercent?: number;
  stock?: number;
};
type SaleLine = {
  id: string;
  productId: number;
  productName: string;
  barcode: string;
  qty: number;
  price: number;
  discountPercent?: number;
  taxPercent?: number;
  subtotal: number;
  taxAmount: number;
  total: number;
};
type Invoice = {
  id: string;
  createdAt: string;
  lines: SaleLine[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paidAmount?: number;
};

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatListModule, FormsModule, CommonModule, DecimalPipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  barcode = '';
  qty = 1;
  query = '';
  manualProductId: number | null = null;
  searchResults: Product[] = [];
  paid = 0;
  isScannerConnected = false;

  private linesSignal = signal<SaleLine[]>([]);
  lines() { return this.linesSignal(); }

  lastInvoice: Invoice | null = null;

  subtotalval = computed(() => this.lines().reduce((s, l) => s + l.subtotal, 0));
  taxval = computed(() => this.lines().reduce((s, l) => s + l.taxAmount, 0));
  discountval = computed(() => this.lines().reduce((s, l) => s + ((l.price * l.qty) * (l.discountPercent ?? 0) / 100), 0));
  grandTotalval = computed(() => this.subtotalval() + this.taxval() - this.discountval());
  totalQtyval = computed(() => this.lines().reduce((s, l) => s + l.qty, 0));

  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private scannerService: Barcodescannerservice) {
    const raw = localStorage.getItem('lastInvoice');
    if (raw) this.lastInvoice = JSON.parse(raw);
  }

  ngOnInit() {
    this.initializeScanner();
  }

  initializeScanner() {
    // Subscribe to scanner connection status
    this.scannerService.connectionStatus.subscribe((status: boolean) => {
      this.isScannerConnected = status;
    });

    // Subscribe to scanner input
    this.scannerService.onScan().subscribe((data: string) => {
      this.barcode = data;
      this.onScan();
    });

    this.scannerService.connect();
  }

  toggleScanner() {
    if (this.isScannerConnected) {
      this.scannerService.disconnect();
    } else {
      this.scannerService.connect();
    }
  }

  onScannerInput(event: Event) {
    this.barcode = (event.target as HTMLInputElement).value;
  }

  async onScan() {
    const code = this.barcode.trim();
    if (!code) return;

    try {
      const product = await this.http
        .get<Product>(`${this.baseUrl}/products/barcode/${encodeURIComponent(code)}`)
        .toPromise();

      if (product) {
        this.addOrIncrement(product, Number(this.qty) || 1);
      } else {
        alert('Product not found on server');
      }
    } catch (err) {
      alert('Product not found on server');
    }

    this.barcode = '';
    this.qty = 1;
    this.focusScanner();
  }

  focusScanner() {
    this.barcodeInput.nativeElement.focus();
  }

  onSearch() {
    const q = (this.query || '').trim().toLowerCase();
    if (!q) {
      this.searchResults = [];
      return;
    }

    this.http.get<Product[]>(`${this.baseUrl}/products`).pipe(
      map(list => list.filter(p => p.name.toLowerCase().includes(q)).slice(0, 20))
    ).subscribe(res => this.searchResults = res);
  }

  addProduct(p: Product) {
    this.addOrIncrement(p, 1);
    this.searchResults = [];
    this.query = '';
  }

  private addOrIncrement(product: Product, qty: number) {
    const lines = this.linesSignal();
    const idx = lines.findIndex(l => l.productId === product.id);
    if (idx >= 0) {
      lines[idx].qty += qty;
      this.recalcLine(lines[idx]);
      this.linesSignal.set([...lines]);
    } else {
      const l: SaleLine = {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        qty,
        price: product.price,
        discountPercent: 0,
        taxPercent: product.taxPercent ?? 0,
        subtotal: 0,
        taxAmount: 0,
        total: 0
      };
      this.recalcLine(l);
      this.linesSignal.update(a => [...a, l]);
    }
  }

  private recalcLine(l: SaleLine) {
    const raw = l.price * l.qty;
    const disc = raw * ((l.discountPercent ?? 0) / 100);
    l.subtotal = raw - disc;
    l.taxAmount = l.subtotal * ((l.taxPercent ?? 0) / 100);
    l.total = l.subtotal + l.taxAmount;
  }

  changeQty(i: number, delta: number) {
    const arr = this.linesSignal();
    arr[i].qty = Math.max(1, arr[i].qty + delta);
    this.recalcLine(arr[i]);
    this.linesSignal.set([...arr]);
  }

  updateLine(i: number) {
    const arr = this.linesSignal();
    arr[i].qty = Math.max(1, Number(arr[i].qty) || 1);
    this.recalcLine(arr[i]);
    this.linesSignal.set([...arr]);
  }

  removeLine(i: number) {
    this.linesSignal.set(this.linesSignal().filter((_, idx) => idx !== i));
  }

  totalQty() { return this.totalQtyval(); }
  subtotal() { return this.subtotalval(); }
  tax() { return this.taxval(); }
  discount() { return this.discountval(); }
  grandTotal() { return this.grandTotalval(); }

  addById() {
    if (!this.manualProductId) return alert('Enter a product ID');

    this.http.get<Product[]>(`${this.baseUrl}/products`).subscribe(products => {
      const p = products.find(prod => prod.id === this.manualProductId);
      if (p) {
        this.addOrIncrement(p, Number(this.qty) || 1);
        this.manualProductId = null;
        this.qty = 1;
      } else {
        alert('Product ID not found');
      }
    });
  }

  createInvoice() {
    const inv: Invoice = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lines: this.linesSignal(),
      subtotal: this.subtotal(),
      tax: this.tax(),
      discount: this.discount(),
      grandTotal: this.grandTotal(),
      paidAmount: this.paid
    };

    this.http.post<{id:string}>(`${this.baseUrl}/invoices`, inv).subscribe({
      next: () => {
        localStorage.setItem('lastInvoice', JSON.stringify(inv));
        this.lastInvoice = inv;
        this.linesSignal.set([]);
        this.paid = 0;
        alert('Invoice saved (id: ' + inv.id + ')');
        window.open(`/invoice/${inv.id}`, '_blank');
      },
      error: () => alert('Failed to save invoice')
    });
  }

  printLast() {
    if (!this.lastInvoice) return alert('No invoice to print');
    window.open(`/invoice/${this.lastInvoice.id}`, '_blank');
  }
}