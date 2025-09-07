import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({

  selector: 'app-invoice-print',
  imports: [CommonModule,DecimalPipe],
  templateUrl: './invoice-print.html',
  styleUrl: './invoice-print.css'
})
export class InvoicePrint {
invoice: any;
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(`http://localhost:3000/api/invoices/${id}`).subscribe(res => {
      this.invoice = res;
    });
  }
}