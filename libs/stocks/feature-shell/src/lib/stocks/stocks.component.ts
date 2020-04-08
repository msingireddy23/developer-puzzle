import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import {MatDatepicker} from '@angular/material';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  stockPickerForm: FormGroup;
  symbol: string;
  period: string;
  apiError: string = null;
  maxDate: Date;
  fromDate: Date;
  toDate: Date;

  quotes$ = this.priceQuery.priceQueries$;

  timePeriods = [
    { viewValue: 'All available data', value: 'max' },
    { viewValue: 'Five years', value: '5y' },
    { viewValue: 'Two years', value: '2y' },
    { viewValue: 'One year', value: '1y' },
    { viewValue: 'Year-to-date', value: 'ytd' },
    { viewValue: 'Six months', value: '6m' },
    { viewValue: 'Three months', value: '3m' },
    { viewValue: 'One month', value: '1m' }
  ];

  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade, private datePipe: DatePipe) {
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      period: [null, Validators.required],
      fromDate: [null],
      toDate: [null]
    });
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDate = new Date().getDate();
    this.maxDate = new Date(currentYear, currentMonth, currentDate);
  }

  ngOnInit() {}

  fetchQuote() {
    if (this.stockPickerForm.valid) {
      let { symbol, period, fromDate, toDate } = this.stockPickerForm.value;
      if (fromDate && toDate) {
        if (fromDate > toDate) {
          symbol = this.stockPickerForm.value['symbol'];
          period = null;
          fromDate = toDate = this.datePipe.transform(new Date().toString(), 'yyyy-MM-dd');
        }
        this.priceQuery.fetchQuote(symbol, period, this.datePipe.transform(fromDate, 'yyyy-MM-dd'), this.datePipe.transform(toDate, 'yyyy-MM-dd'));
      } else {
        this.priceQuery.fetchQuote(symbol, period);
      }
      this.priceQuery.selectedSymbol$.subscribe(value => value.toLowerCase() === 'unknown symbol' ? this.apiError = value : null);
    }
  }
}
