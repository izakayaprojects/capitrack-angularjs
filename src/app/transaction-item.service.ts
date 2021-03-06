import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient } from '@angular/common/http';

import { MessagesService } from './messages.service';
import { Factory } from './_models/factory';
import { TransactionItem, TransactionType, Stock } from "./_models/transaction-item";
import { MOCK_TRANSACTION_ITEMS } from "./mocks/mock-transaction-items";

import { API_ENV, CONSTANTS } from './global';

const FACTORY = new Factory();

@Injectable({
  providedIn: 'root'
})

export class TransactionItemService {

  constructor(
    private messageService: MessagesService,
    private http: HttpClient,
    private localStorage: LocalStorageService) { }

  getTransactions(): Observable<TransactionItem[]> {
    let token = this.localStorage.retrieve(CONSTANTS.LSKEY_TOKEN);
    return this.http.post(API_ENV.debug.url+"/transactions", {token: token})
      .pipe(map(result => {
        let data = result["data"];
        let items: TransactionItem[] = [];
        for (let entry of data) {
          items.push(FACTORY.createTransactionItem(entry));
        }
        return items;
      }))
  }

  findStocksByName(term: string) {
    return this.http.get(API_ENV.debug.url+"/stock/find?search="+term)
      .pipe(map(result => {
        let data = result["data"];
        let items: Stock[] = [];
        for (let item of data) {
          items.push(FACTORY.createStockItem(item));
        }
        return items;
      }))
  }

  getStockByISIN(isin: string): Observable<Stock> {
    return this.http.get(API_ENV.debug.url+"/stock/get/"+isin)
      .pipe(map(result => {
        let data = result["data"];
        if (data === undefined || data === null || data.length == 0) {
          return null
        } else {
          return FACTORY.createStockItem(data[0])
        }
      }))
  }

  addStock(stock: Stock) {
    let body = {
      token: this.localStorage.retrieve(CONSTANTS.LSKEY_TOKEN),
      isin: stock.isin,
      name: stock.name,
      market_sector: stock.marketSector,
      security_type: stock.securityType,
      security_type2: stock.securityType2
    }
    return this.http.post(API_ENV.debug.url+"/stock/add", body)
  }

  addTransaction(trx: TransactionItem) {
    let body = {
      token: this.localStorage.retrieve(CONSTANTS.LSKEY_TOKEN),
      type: trx.type,
      isin: trx.needStock() ? trx.stock.isin : "",
      amount: trx.amount,
      value: trx.valuePerAmount,
      timestamp: FACTORY.jsDateToSQLDate(trx.timestamp)
    }
    return this.http.post(API_ENV.debug.url+"/transactions/add", body)
      .pipe(map(result => result["transaction_id"]))
  }

  deleteTransaction(trx: TransactionItem) {
    let body = {
      token: this.localStorage.retrieve(CONSTANTS.LSKEY_TOKEN),
      transaction_id: trx.id
    }
    return this.http.post(API_ENV.debug.url+"/transactions/delete", body)
  }

  getTransactionTypes() {
    return this.http.get(API_ENV.debug.url+"/transaction_types")
      .pipe(map(result => {
        return result["data"];
      }))
  }

  getMockTransactionItems(): Observable<TransactionItem[]> {
  	this.messageService.add("Retrieving transactions...");
  	return of(MOCK_TRANSACTION_ITEMS);
  }

  getMockTransactionItem(id: string): Observable<TransactionItem> {
  	this.messageService.add(`Retrieving transaction with id ${id}`);
  	return of(MOCK_TRANSACTION_ITEMS.find(item => item.id === id));
  }
}
