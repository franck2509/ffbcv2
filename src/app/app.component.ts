import {Pipe, PipeTransform} from '@angular/core';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as jsPDF from 'jspdf';
import { DrupaldataService } from './drupaldata.service';
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';


@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args: string[]): any {
    const keys = [];
    for (const key in value) {
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
  // Variables for Value Check, tag used: vc
  data = '';
  valueCheck = true; // used to (de)activate questionnaire (with checkbox)
  // All Topic Tags
  vcs = ['CustNeed', 'MarkOport', 'Solution', 'Collab', 'CustAdv', 'ResultFF'];
  vcData = '';
  vcWeight = 1;
  vcRank = 0; // Final average of value check

  // Variables for Future Fit Check, tag used: ff
  ffCheck = true; ffWeight = 1; ffBenchRank = 0; ffMarketRank = 0; ffRank = 0; ffData = '';
  ffCheckUps = ['UpEnergy', 'UpWater', 'UpRespect', 'UpHarm', 'UpGreenhouse', 'UpWaste', 'UpCommunity', 'UpEmployees'];
  ffCheckCores = ['CoreEnergy', 'CoreWater', 'CoreHarm', 'CoreGreenhouse', 'CoreEncroach', 'CoreWaste',
                  'CoreEmployees', 'CoreConcerns', 'CoreCommunity'];
  ffCheckUses = ['UseEnvi', 'UseGreenhouse', 'UsePeople', 'UseCommunic', 'RepProd', 'RepCommunity'];

  // Variables for Business Potential Check, tag used: bp
  bpCheck = true; bpWeight = 1; bpRank = 0; bpData = '';
  bps = ['brandRep', 'opExp', 'emplProd', 'staffExp', 'marketValue', 'innovCult', 'risk', 'revGrowth'];

  score = 0; grade = '';
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
    this.drupaldataservice.getData();
    // this.drupaldataservice.postData();
  }
  reset() {
    this.text = [];
    this.vcRank = 0;
    this.ffMarketRank = 0;
    this.ffBenchRank = 0;
    this.ffRank = 0;
    this.bpRank = 0;
    this.vcData = '';
    this.ffData = '';
    this.bpData = '';
    this.data = '';
  }
  switchLanguage(language: string) {
    this.translate.use(language);
  }

  result() {
    // Reseting PDF content, variables used for calculations
    this.reset();
    let points = 0; let weights = 0 ;
    // get calculations from each check
    if (this.valueCheck) {
      this.valCheckEval();
      points += this.vcRank * this.vcWeight; weights += this.vcWeight;
    }
    if (this.ffCheck) {
      this.ffCheckEval();
      points += this.ffRank * this.ffWeight; weights += this.ffWeight;
    }
    if (this.bpCheck) {
      this.busPotCheckEval();
      points += this.bpRank * this.bpWeight; weights += this.bpWeight;
    }
    this.score = points / weights;
    this.getGrade();

    // todo Final Calculations
    // this.text.push('Score: ' + this.score.toString());
  }

  getGrade() {
    console.log('score ' + this.score);
    if (this.score > 100) {
      this.grade = 'R - Business case is positively future fit, adds value to society, is regenerative to environment.';
    } else if (this.score > 75) {
      this.grade = 'A - Business case is highly future fit.';
    } else if (this.score > 50) {
      this.grade = 'B - Business case is moderatly future fit.';
    } else if (this.score > 25) {
      this.grade = 'C - Business case is weakly future fit.';
    } else {
      this.grade = 'D - Business case is not future fit.';
    }
  }

  post() {
    this.reset();
    if (this.valueCheck) {
      this.vcJson();
      if (this.ffCheck) {
        this.vcData += ',';
      }
    }
    if (this.ffCheck) {
      this.ffJson();
      if (this.bpCheck) {
        this.ffData += ',';
      }
    }
    if (this.bpCheck) {
      this.bpJson();
    }
    this.data = '{' + this.vcData + this.ffData + this.bpData +'}';
    console.log(this.data);
    this.drupaldataservice.postData(this.data);
  }

  // calculates average of a questionnaire
  getAverage(tag, questionnaire, addOn = '') {
    let points = 0; let amount = 0; // used to sum up points and count
    // loops through all questions (tags) of questionnaire
    for (let i = 0; i < questionnaire.length; i++) {
      // loop through radio buttons to get the activated one
      for (let j = 0; j < this.scaleAbsolute.length; j++) { // goes through all buttons and retrieves checked one
        const radio = <HTMLInputElement>document.getElementsByName(questionnaire[i] + addOn)[j];
        if (radio.checked === true) {
          // add to average
          if ((radio.value) !== 'null') {
            points += parseInt(radio.value);
            amount++;
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
      this.vcRank = this.getAverage('vc', this.vcs);

      /*
      // Appends PDF content with question, value and text
      let vcTitle = <HTMLInputElement>document.getElementsByClassName('vcTitle')[i];
      this.text.push(vcTitle.innerHTML + ": " + vcRadio.value);
      let vcText = <HTMLInputElement>document.getElementsByClassName('vcText')[i];
      this.text.push(vcText.value);
      */
      console.log(this.vcRank);
    }
  }

  vcJson() {
    this.vcData = '"vc": {';
    for (let i = 0; i < this.vcs.length; i++) {
      this.vcData += '\"' + this.vcs[i] + '\"' + ':';
      const text = <HTMLInputElement>document.getElementsByClassName('vcText')[i];
      for (let j = 0; j < this.scaleAbsolute.length; j++) {
        const radio = <HTMLInputElement>document.getElementsByName(this.vcs[i])[j];
        if (radio.checked === true) {
          // add to average
          const data = {score: parseInt(radio.value), text: text.value};
          this.vcData += JSON.stringify(data) + ',';
        }
      }
    }
    this.vcData = this.vcData.slice(0, -1);
    this.vcData += '}';
  }

  ffCheckEval() {
    if (this.ffCheck) {
      // Adding Value Check Title to PDF
      this.text.push(document.getElementById('ff').innerHTML);

      // Loop through Value Check Questions
      this.ffBenchRank = (this.getAverage('ffup', this.ffCheckUps, 'B')
        + this.getAverage('ffcore', this.ffCheckCores, 'B') + this.getAverage('ffcore', this.ffCheckUses, 'B') * 2) / 4;
      this.ffMarketRank = (this.getAverage('ffup', this.ffCheckUps, 'M')
        + this.getAverage('ffcore', this.ffCheckCores, 'M') + this.getAverage('ffcore', this.ffCheckUses, 'M') * 2) / 4;
      this.ffRank = (this.ffBenchRank + this.ffMarketRank) / 2;

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

  ffJson() {
    this.ffData = '"ffc": { "ffup": {';
    let radioB: string;
    let radioM: string;
    let text = <HTMLInputElement>document.getElementById('ffupText');
    console.log(text.value);
    for (let i = 0; i < this.ffCheckUps.length; i++) {
      this.ffData += '\"' + this.ffCheckUps[i] + '\"' + ':';
      for (let j = 0; j < this.scaleAbsolute.length; j++) {
        const radio = <HTMLInputElement>document.getElementsByName(this.ffCheckUps[i] + 'B')[j];
        if (radio.checked === true) {
          radioB = radio.value;
        }
      }
      for (let j = 0; j < this.scaleRelative.length; j++) {
        const radio = <HTMLInputElement>document.getElementsByName(this.ffCheckUps[i] + 'M')[j];
        if (radio.checked === true) {
          radioM = radio.value;
        }
      }
      const data = {benchmark: parseInt(radioB), market: parseInt(radioM)};
      this.ffData += JSON.stringify(data) + ',';
    }
    this.ffData += '\"ffuptext\": \"' + text.value + '\"';
    this.ffData += '}, "ffcore": {';

    text = <HTMLInputElement>document.getElementById('ffcoreText');
    console.log(text.value);
    for (let i = 0; i < this.ffCheckCores.length; i++) {
      this.ffData += '\"' + this.ffCheckCores[i] + '\"' + ':';
      for (let j = 0; j < this.scaleAbsolute.length; j++) {
        const radio = <HTMLInputElement>document.getElementsByName(this.ffCheckCores[i] + 'B')[j];
        if (radio.checked === true) {
          radioB = radio.value;
        }
      }
      for (let j = 0; j < this.scaleRelative.length; j++) {
        const radio = <HTMLInputElement>document.getElementsByName(this.ffCheckCores[i] + 'M')[j];
        if (radio.checked === true) {
          radioM = radio.value;
        }
      }
      const data = {benchmark: parseInt(radioB), market: parseInt(radioM)};
      this.ffData += JSON.stringify(data) + ',';
    }
    this.ffData += '\"ffcoretext\": \"' + text.value + '\"';
    this.ffData += '}, "ffuse": {';

    text = <HTMLInputElement>document.getElementById('ffuseText');
    console.log(text.value);
    for (let i = 0; i < this.ffCheckUps.length; i++) {
      this.ffData += '\"' + this.ffCheckUps[i] + '\"' + ':';
      for (let j = 0; j < this.scaleAbsolute.length; j++) {
        const radio = <HTMLInputElement>document.getElementsByName(this.ffCheckUps[i] + 'B')[j];
        if (radio.checked === true) {
          radioB = radio.value;
        }
      }
      for (let j = 0; j < this.scaleRelative.length; j++) {
        const radio = <HTMLInputElement>document.getElementsByName(this.ffCheckUps[i] + 'M')[j];
        if (radio.checked === true) {
          radioM = radio.value;
        }
      }
      const data = {benchmark: parseInt(radioB), market: parseInt(radioM)};
      this.ffData += JSON.stringify(data) + ',';
    }
    this.ffData += '\"ffusetext\": \"' + text.value + '\"';
    this.ffData += '}}';
  }

  busPotCheckEval() {
    if (this.bpCheck) {
      this.bpRank = this.getAverage('bp', this.bps);
      // first 2 questions hardcoded
      const direct = <HTMLInputElement>document.getElementsByName('1')[1];
      if (direct.checked) {
        this.bpRank += parseInt(direct.value);
      }
      const platform = <HTMLInputElement>document.getElementsByName('2')[1];
      if (platform.checked) {
        this.bpRank += parseInt(platform.value);
      }
      if (this.bpRank < 0) {
        this.bpRank = 0;
      }

      console.log(this.bpRank);
    }
  }

  bpJson() {
    this.bpData = '"bp": {';
    this.bpData += '"rightDirect": { "score": ';
    let direct = <HTMLInputElement>document.getElementsByName('1')[0];
    console.log(direct.value);
    if (direct.checked) {
      console.log(direct.value);
      this.bpData += direct.value;
    } else {
      direct = <HTMLInputElement>document.getElementsByName('1')[1];
      this.bpData += direct.value;
    }
    let text = <HTMLInputElement>document.getElementById('bprdText');
    this.bpData += ', "text": "' + text.value + '"},';

    this.bpData += '"flexPlatform": { "score": ';
    let platform = <HTMLInputElement>document.getElementsByName('2')[0];
    if (platform.checked) {
      this.bpData += platform.value;
    } else {
      platform = <HTMLInputElement>document.getElementsByName('2')[1];
      this.bpData += platform.value;
    }
    text = <HTMLInputElement>document.getElementById('bpfpText');
    this.bpData += ', "text": "' + text.value + '"},';

    for (let i = 0; i < this.bps.length; i++) {
      this.bpData += '\"' + this.bps[i] + '\"' + ':';
      const text = <HTMLInputElement>document.getElementsByClassName('bpText')[i];
      for (let j = 0; j < this.scaleAbsolute.length; j++) {
        const radio = <HTMLInputElement>document.getElementsByName(this.bps[i])[j];
        if (radio.checked === true) {
          // add to average
          const data = {score: parseInt(radio.value), text: text.value};
          this.bpData += JSON.stringify(data) + ',';
        }
      }
    }
    this.bpData = this.bpData.slice(0, -1);
    this.bpData += '}';
    console.log(this.bpData);
  }

  // used to create PDF and make it download
  savePDF() {
    this.result();
    const doc = new jsPDF();
    doc.text(this.text, 10, 10);
    doc.save('prototyp.pdf');
  }
}
