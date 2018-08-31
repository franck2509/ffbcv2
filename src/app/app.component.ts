import {Pipe, PipeTransform} from '@angular/core';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as jsPDF from 'jspdf';
import { DrupaldataService } from './drupaldata.service';
import { HttpClient, HttpParams, HttpHeaders} from "@angular/common/http";


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
  styleUrls: ['./app.component.css'],
  providers: [DrupaldataService]
})

export class AppComponent {
  user = {
    name: 'Arthur',
    age: 42
  };
  // Variables for Value Check, tag used: vc
  valueCheck = true; // used to (de)activate questionnaire (with checkbox)
  // All Topic Tags
  vcs = ["CustNeed", "MarkOport", "Solution", "Collab", "CustAdv", "ResultFF"];
  valueRank = 0; // Final average of value check

  // Variables for Future Fit Check, tag used: ff
  ffCheck = true; ffBenchRank = 0; ffMarketRank = 0; ffRank = 0;
  ffCheckUps = ["UpEnergy", "UpWater", "UpRespect", "UpHarm", "UpGreenhouse", "UpWaste", "UpCommunity", "UpEmployees"];
  ffCheckCores = ["CoreEnergy", "CoreWater", "CoreHarm", "CoreGreenhouse", "CoreEncroach", "CoreWaste", "CoreEmployees", "CoreConcerns", "CoreCommunity"];
  ffCheckUses = ["UseEnvi", "UseGreenhouse", "UsePeople", "UseCommunic", "RepProd", "RepCommunity"];

  // Variables for Business Potential Check, tag used: bp
  bpCheck = true; bpRank = 0;
  bps = ["brandRep", "opExp", "emplProd", "staffExp", "marketValue", "innovCult", "risk", "revGrowth"];

  score: number;
  text = []; // used for PDF file, is on hold

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
  ];

  constructor(private translate: TranslateService, private drupaldataservice: DrupaldataService) {
    translate.setDefaultLang('en');
  }

  ngOnInit() {
    // this.drupaldataservice.getToken();
    this.drupaldataservice.postData();
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

  result() {
    // Reseting PDF content, variables used for calculations
    this.reset()

    // get calculations from each check
    this.valCheckEval();
    this.ffCheckEval();
    this.busPotCheckEval();
    this.score = this.ffRank;

    // todo Final Calculations
    this.text.push("Score: " + this.score.toString())
  }

  reset() {
    this.text = []; this.valueRank = 0; this.ffMarketRank = 0;
    this.ffBenchRank = 0; this.ffRank = 0; this.bpRank = 0;
  }

  getWeight(tag, i) { // gets weight of a question
    // 2 steps for getting the value due to strange bug, some sort of workaround used
    let w = <HTMLInputElement>document.getElementsByClassName(tag + 'Weight')[i];
    let weight = parseInt(w.value);
    return weight;
  }

  // calculates average of a questionnaire
  getAverage(tag, questionnaire, addOn = '') {
    let points = 0; let amount = 0; // used to sum up points and count
    // loops through all questions (tags) of questionnaire
    for (let i = 0; i < questionnaire.length; i++) {
      let weight = this.getWeight(tag, i);
      // loop through radio buttons to get the activated one
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

  valCheckEval() { // takes necessary steps to get the average
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
      console.log("Average Up Bench");
      console.log(this.getAverage('ffup', this.ffCheckUps, 'B'));
      console.log("Average Core Bench");
      console.log(this.getAverage('ffcore', this.ffCheckUps, 'B'));
      this.ffBenchRank = (this.getAverage('ffup', this.ffCheckUps, 'B') + this.getAverage('ffcore', this.ffCheckCores, 'B') + this.getAverage('ffcore', this.ffCheckUses, 'B')*2)/4;
      this.ffMarketRank = (this.getAverage('ffup', this.ffCheckUps, 'M') + this.getAverage('ffcore', this.ffCheckCores, 'M') + this.getAverage('ffcore', this.ffCheckUses, 'M')*2)/4;
      this.ffRank = (this.ffBenchRank + this.ffMarketRank) / 2;
      console.log("MarketRank: ");
      console.log(this.ffMarketRank);
      console.log("BenchRank: ");
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
      // first 2 questions hardcoded
      let direct = <HTMLInputElement>document.getElementsByName('1')[1];
      if (direct.checked){
        this.bpRank += parseInt(direct.value);
      }
      let platform = <HTMLInputElement>document.getElementsByName('2')[1];
      if (platform.checked){
        this.bpRank += parseInt(platform.value);
      }
      if (this.bpRank < 0)
        this.bpRank = 0;

      console.log(this.bpRank);
    }
  }

  // used to create PDF and make it download
  savePDF(){
    this.result();
    const doc = new jsPDF();
    doc.text(this.text,10,10);
    doc.save("prototyp.pdf");
  }
}
