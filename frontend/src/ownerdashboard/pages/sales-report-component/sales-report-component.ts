import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { registerables, Chart } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

interface Invoice { 
  id: string; createdAt: string;
  lines: { qty: number; total: number; productName: string; productId: number; barcode: string; price: number; discountPercent: number; taxPercent: number; subtotal: number; taxAmount: number; }[];
  subtotal: number; tax: number; discount: number; grandTotal: number; paidAmount: number;
}

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, BaseChartDirective, DecimalPipe],
  templateUrl: './sales-report-component.html',
  styleUrls: ['./sales-report-component.css']
})
export class SalesReportComponent implements OnInit {
  invoices: Invoice[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: ChartData<'line'> = {
    labels: [],
    datasets: [{ data: [], label: 'Daily Sales (₹)', borderColor: '#1e3a8a', backgroundColor: 'rgba(30, 58, 138, 0.1)', fill: true, tension: 0.4 }]
  };

  totalSales = 0;
  totalItems = 0;
  averageOrderValue = 0;
  totalInvoices = 0;

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: 'time', time: { unit: 'day' }, title: { display: true, text: 'Date' } },
      y: { beginAtZero: true, title: { display: true, text: 'Sales (₹)' } }
    },
    plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true } }
  };

  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() { this.fetchInvoices(); }

  fetchInvoices() {
    this.http.get<Invoice[]>(`${this.baseUrl}/invoices`).subscribe({
      next: (invoices) => { this.invoices = invoices; this.updateChart(); },
      error: (err) => { console.error(err); alert('Failed to load sales data'); }
    });
  }

  updateChart() {
    this.totalSales = this.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    this.totalItems = this.invoices.reduce((sum, inv) => sum + inv.lines.reduce((s, l) => s + l.qty, 0), 0);
    this.totalInvoices = this.invoices.length;
    this.averageOrderValue = this.totalInvoices ? this.totalSales / this.totalInvoices : 0;

    const salesMap = new Map<string, number>();
    this.invoices.forEach(inv => {
      const day = new Date(inv.createdAt).toISOString().split('T')[0];
      salesMap.set(day, (salesMap.get(day) || 0) + inv.grandTotal);
    });

    const sortedDates = Array.from(salesMap.keys()).sort();
    const salesData = sortedDates.map(date => salesMap.get(date) || 0);

    this.chartData = { labels: sortedDates.map(d => new Date(d)), datasets: [{ ...this.chartData.datasets[0], data: salesData }] };

    this.chart?.update();
  }
}
