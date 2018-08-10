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

  valueCheck = true; // used to (de)activate questionnaire (with checkbox)
  valuePoints = 0; // accumulation of points in value questions
  valueAmount = 0; // # of questions (for later calc. average)
  valueRank = 0;   // Final average
  valueChecks = [  // All Topic Tags
    "CustNeed", "MarkOport", "Solution"
  ];

  ffCheck = true;
  ffCheckUps = [
    "Energy", "Water", "Respect"
  ];
  ffBenchPoints = 0;
  ffBenchAmount = 0;
  ffBenchRank = 0;
  ffMarketPoints = 0;
  ffMarketAmount = 0;
  ffMarketRank = 0;
  ffRank = 0;

  bpCheck = true;
  bpChecks = ["brandRep", "opExp"];


  score: number;
  total: number;
  amount: number;
  text = [];

  scaleAbsolute = [
    {value: 'null', display: 'Not Applicable'},
    {value: '0', display: 'Weak'},
    {value: '50', display: 'Moderate'},
    {value: '100', display: 'Strong'},
    {value: '150', display: 'Outstanding'}
  ];
  scaleRelative = [
    {value: 'null', display: 'Not Applicable'},
    {value: '0', display: 'Lower'},
    {value: '50', display: 'Equal'},
    {value: '100', display: 'Better'},
    {value: '150', display: 'Outstanding'}
  ]

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

  result() {
    // Reseting PDF content, variables used for calculations
    this.text = []
    this.total = 0;
    this.amount = 0;

    // get input from each check
    this.valCheckEval();
    this.ffCheckEval();

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
        for (let j = 0; j < this.scaleAbsolute.length; j++) { // goes through all buttons and retrieves checked one
          let vcRadio =  <HTMLInputElement>document.getElementsByName(this.valueChecks[i])[j];
          if (vcRadio.checked === true) {
            // add to average
            if ((vcRadio.value) !== 'null') {
              this.valuePoints += parseInt(vcRadio.value) * weight;
              this.valueAmount += weight;
          }
        }
          // Appends PDF content with question, value and text
          let vcTitle = <HTMLInputElement>document.getElementsByClassName('vcTitle')[i];
          this.text.push(vcTitle.innerHTML + ": " + vcRadio.value);
          let vcText = <HTMLInputElement>document.getElementsByClassName('vcText')[i];
          this.text.push(vcText.value);
        }
      }
      this.valueRank = this.valuePoints / this.valueAmount;
    }
  }

  ffCheckEval() {
    if (this.ffCheck) {
      // Adding Value Check Title to PDF
      this.text.push(document.getElementById('ff').innerHTML);

      // Loop through Value Check Questions
      for (let i = 0; i < this.ffCheckUps.length; i++) {
        // get weight of question
        let w = <HTMLInputElement>document.getElementsByClassName('ffWeight')[i];
        let weight = parseInt(w.value)

        // get radio button of Bench
        for (let j = 0; j < this.scaleAbsolute.length; j++) {
          let ffRadio = <HTMLInputElement>document.getElementsByName(this.ffCheckUps[i] + "B")[j];
          if (ffRadio.checked === true) {
            // add to average
            if ((ffRadio.value) !== 'null') {
              this.ffBenchPoints += parseInt(ffRadio.value) * weight;
              this.ffBenchAmount += weight;
            }
          }
        }
        // get radio button of Market
        for (let j = 0; j < this.scaleRelative.length; j++) {
          let ffRadio = <HTMLInputElement>document.getElementsByName(this.ffCheckUps[i] + "M")[j];
          if (ffRadio.checked === true) {
            // add to average
            if ((ffRadio.value) !== 'null') {
              this.ffMarketPoints += parseInt(ffRadio.value) * weight;
              this.ffMarketAmount += weight;
            }
          }
          this.ffRank = ((this.ffBenchPoints / this.ffBenchAmount) + (this.ffMarketPoints / this.ffMarketAmount)) / 2;
          console.log(this.ffRank);
          // Appends PDF content with question, value and text

          let vcTitle = <HTMLInputElement>document.getElementsByClassName('ffTitle')[i];
          this.text.push(vcTitle.innerHTML + ": " /*+ vcDrop.value*/);
          /*
          let vcText = <HTMLInputElement>document.getElementsByClassName('ffText')[i];
          this.text.push(vcText.value);
          */
          }
        }
      }
    }


  busPotCheckEval() {

  }

  // used to create PDF and make it download
  savePDF(){
    this.result();
    const doc = new jsPDF();
    doc.text(this.text,10,10);
    doc.save("prototyp.pdf");
  }
}
