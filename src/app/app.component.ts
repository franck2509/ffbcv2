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
  // Variables for Value Check, tag used: vc
  valueCheck = true; // used to (de)activate questionnaire (with checkbox)
  vcs = [  // All Topic Tags
    "CustNeed", "MarkOport", "Solution"
  ];
  valueRank = 0; // Final average of value check

  ffCheck = true;
  ffCheckUps = [
    "Energy", "Water", "Respect"
  ];
  ffBenchRank = 0; ffMarketRank = 0; ffRank = 0;

  bpCheck = true;
  bps = [
    "brandRep", "opExp"
  ];
  bpRank = 0;

  score: number;
  total: number; // To be removed
  amount: number;// To be removed
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
    this.bpRank = 0;

    // get input from each check
    this.valCheckEval();
    this.ffCheckEval();
    this.busPotCheckEval();

    // Calculations
    this.score = this.total / this.amount;
    this.text.push("Score: " + this.score.toString())
  }

  getWeight(tag, i) { // gets weight of a question
    let w = <HTMLInputElement>document.getElementsByClassName(tag + 'Weight')[i];
    let weight = parseInt(w.value);
    return weight;
  }

  getAverage(tag, questionnaire, addOn = '') {
    let points = 0; let amount = 0; // used to sum up points and count
    for (let i = 0; i < questionnaire.length; i++) {
      let weight = this.getWeight(tag, i);
      for (let j = 0; j < this.scaleAbsolute.length; j++) { // goes through all buttons and retrieves checked one
        let radio = <HTMLInputElement>document.getElementsByName(questionnaire[i] + addOn)[j];
        if (radio.checked === true) {
          // add to average
          if ((radio.value) !== 'null') {
            points += parseInt(radio.value) * weight;
            amount += weight;
          }
        }
      }
    }
    return points / amount;
  }


  valCheckEval() {
    if (this.valueCheck) {
      // Adding Value Check Title to PDF
      this.text.push(document.getElementById('vc').innerHTML);
      this.valueRank = this.getAverage('vc', this.vcs);

      /*
      // Appends PDF content with question, value and text
      let vcTitle = <HTMLInputElement>document.getElementsByClassName('vcTitle')[i];
      this.text.push(vcTitle.innerHTML + ": " + vcRadio.value);
      let vcText = <HTMLInputElement>document.getElementsByClassName('vcText')[i];
      this.text.push(vcText.value);
      */
      console.log(this.valueRank);
    }
  }

  ffCheckEval() {
    if (this.ffCheck) {
      // Adding Value Check Title to PDF
      this.text.push(document.getElementById('ff').innerHTML);

      // Loop through Value Check Questions
      this.ffBenchRank = this.getAverage('ff', this.ffCheckUps, 'B');
      this.ffMarketRank = this.getAverage('ff', this.ffCheckUps, 'M');

      console.log(this.ffMarketRank);
      console.log(this.ffBenchRank);

      // Appends PDF content with question, value and text
      /*
      let vcTitle = <HTMLInputElement>document.getElementsByClassName('ffTitle')[i];
      this.text.push(vcTitle.innerHTML + ": " /*+ vcDrop.value);*/
      /*
      let vcText = <HTMLInputElement>document.getElementsByClassName('ffText')[i];
      this.text.push(vcText.value);
      }
    }*/
    }
  }

  busPotCheckEval() {
    if(this.bpCheck) {
      this.bpRank = this.getAverage('bp', this.bps);
      let direct = <HTMLInputElement>document.getElementsByName('1')[1];
      if (direct.checked){
        this.bpRank += parseInt(direct.value);
      }
      let platform = <HTMLInputElement>document.getElementsByName('2')[1];
      if (platform.checked){
        this.bpRank += parseInt(platform.value);
      }
    }
    console.log(this.bpRank);
  }

  // used to create PDF and make it download
  savePDF(){
    this.result();
    const doc = new jsPDF();
    doc.text(this.text,10,10);
    doc.save("prototyp.pdf");
  }
}
