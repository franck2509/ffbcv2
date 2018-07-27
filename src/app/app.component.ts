import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'tr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  user = {
    name: 'Arthur',
    age: 42
  };

  valueChecks = [
    "CustNeed", "MarkOport", "Solution"
  ]

  score: number;
  total: number;
  amount: number;
  text = [];

  selectScales = [
    {value: 'null', display: 'Not Applicable'},
    {value: '0', display: 'Weak'},
    {value: '50', display: 'Moderate'},
    {value: '100', display: 'Strong'},
    {value: '150', display: 'Outstanding'}
  ];

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

  value() {
    // Reseting PDF content, variables used for calculations
    this.text = []
    this.total = 0;
    this.amount = 0;

    // Adding Value Check Title to PDF
    this.text.push(<HTMLInputElement>document.getElementById('vc').innerHTML);

    // Loop through Value Check Questions
    for (let i = 0; i < this.valueChecks.length; i++) {
      // if: Checks that question hasn't chosen not applicable, adds value of dropdown and increases counter
      if ((<HTMLInputElement>document.getElementsByClassName('vcQ')[i].value) !== 'null') {
        this.total += parseInt(<HTMLInputElement>document.getElementsByClassName('vcQ')[i].value);
        this.amount += 1;
      }
      // Appends PDF content with question, value and text
      this.text.push(<HTMLInputElement>document.getElementsByClassName('vcTitle')[i].innerHTML + ": " + <HTMLInputElement>document.getElementsByClassName('vcQ')[i].value);
      this.text.push(<HTMLInputElement>document.getElementsByClassName('vcText')[i].value);
    }

    // Calculations
    this.score = this.total / this.amount;
    this.text.push("Score: " + this.score.toString())
  }

  // used to create PDF and make it download
  savePDF(){
    this.value();
    const doc = new jsPDF();
    doc.text(this.text,10,10);
    doc.save("prototyp.pdf");
  }
}
