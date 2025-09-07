


import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Barcodescannerservice {
  private connectionStatusval = new BehaviorSubject<boolean>(false);
  private scanSubject = new BehaviorSubject<string>('');

  constructor() {
    this.checkConnection();
  }

  connect() {
    console.log('Connecting to barcode scanner...');
    setTimeout(() => {
      this.connectionStatusval.next(false);
    }, 1000);
  }

  disconnect() {
    console.log('Disconnecting barcode scanner...');
    this.connectionStatusval.next(false);
  }

  checkConnection() {
    setInterval(() => {
      const isConnected = Math.random() > 0.3;
      this.connectionStatusval.next(isConnected);
    }, 5000);
  }

  onScan(): Observable<string> {
    return this.scanSubject.asObservable();
  }







  get connectionStatus(): Observable<boolean> {
    return this.connectionStatusval.asObservable();
  }
}