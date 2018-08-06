import {Pipe, PipeTransform} from '@angular/core';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as jsPDF from 'jspdf';


@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
      keys.push({key: key, value: value[key]});
    }
    return keys;
  }
}

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

  valueCheck = true;
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

    // get input from each check
    this.valCheckEval();

    // Calculations
    this.score = this.total / this.amount;
    this.text.push("Score: " + this.score.toString())
  }

  valCheckEval() {
    if (this.valueCheck) {
      // Adding Value Check Title to PDF
      this.text.push(document.getElementById('vc').innerHTML);

      // Loop through Value Check Questions
      for (let i = 0; i < this.valueChecks.length; i++) {
        // get weight of question
        let w = <HTMLInputElement>document.getElementsByClassName('vcWeight')[i];
        let weight = parseInt(w.value)

        // get radio button of question
        for (let j = 0; j < this.selectScales.length; j++) {
          let vcDrop =  <HTMLInputElement>document.getElementsByName(this.valueChecks[i])[j];
          if (vcDrop.checked === true) {
            // add to average
            if ((vcDrop.value) !== 'null') {
              this.total += parseInt(vcDrop.value) * weight;
              this.amount += weight;
          }
        }
          // Appends PDF content with question, value and text
          let vcTitle = <HTMLInputElement>document.getElementsByClassName('vcTitle')[i];
          this.text.push(vcTitle.innerHTML + ": " + vcDrop.value);
          let vcText = <HTMLInputElement>document.getElementsByClassName('vcText')[i];
          this.text.push(vcText.value);
        }
      }
    }
  }

  // used to create PDF and make it download
  savePDF(){
    this.value();
    const doc = new jsPDF();
    doc.text(this.text,10,10);
    doc.save("prototyp.pdf");
  }
}
