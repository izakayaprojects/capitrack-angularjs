import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

import { TransactionItem, TransactionType } from '../_models/transaction-item';
import { TransactionItemService } from "../transaction-item.service";
import { AddTransactionComponent } from "../add-transaction/add-transaction.component";
import { UserCredService } from "../user-cred.service";

@Component({
  selector: 'app-transaction-item',
  templateUrl: './transaction-item.component.html',
  styleUrls: ['./transaction-item.component.css']
})

export class TransactionItemComponent implements OnInit {

  items: TransactionItem[];
	selectedItem: TransactionItem;

  private mDialogNewTransaction: MatDialogRef<AddTransactionComponent>;

  constructor(
    private tiService: TransactionItemService,
    private ucService: UserCredService,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.tiService.getTransactions().subscribe(results => this.items = results)
  }

  onSelect(transactionitem: TransactionItem) {
  	this.selectedItem = transactionitem
  }

  showNewTransactionWindow() {
    this.mDialogNewTransaction = this.dialog.open(AddTransactionComponent, {
      height: "400px",
      minWidth: "400px"
    });
  }
}