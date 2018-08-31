import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';

declare var firebase: any;
@Injectable({
  providedIn: 'root'
})
export class DrupaldataService {

  constructor(private http: HttpClient) {}

  getToken() {
    /*
    return this.http.get('https://ffbcv-eaadf.firebaseio.com/.json').subscribe( // http://localhost/api/v1/dreamit  http://localhost/rest/session/token
      (data) => console.log(data)
    );
    */
    return this.http.get('http://localhost/rest/session/token',  {responseType: 'text'}).subscribe(
      (data) => console.log(data)
    ); // http://localhost/api/v1/dreamit  http://localhost/rest/session/token

  }

  postData() {

    var headers = new HttpHeaders();
    headers.append('X-CSRF-Token', this.getToken().toString());
    headers.append('Content-Type', 'application/hal+json');
    return this.http.post('http://localhost/entity/node?_format=json',
      {
        "_links": {
          "type": {
            "href": "http://localhost/rest/type/node/dream_it"
          }
        },
        "title":[{"value": "test title8 updated"}],
        "body":[{"value": "Test body8"}],
        "type": [{"target_id": "dream_it"}]
      }, {headers: headers})
      .subscribe((data: any) => console.log(data));

    /*
    var json = JSON.stringify({var1: 'test', var2: 3});
    var params = 'json=' + json;
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    this.http.post('https://ffbcv-eaadf.firebaseio.com', params, { // http://localhost/api/v1/dreamit
      headers: headers
    }).map(res => res.json());
    this.fetchData();


    var hal = require('hal');
    var resource = new hal.Resource({"title": "test title3 updated",
      "body": "Test body3"}, 'http://localhost/entity/node?_format=json');
    resource.link('test', "http://localhost/rest/type/node/dream_it")
    console.log(resource.toJSON());


    return this.http.post('http://localhost/entity/node?_format=json',
      {
        "_links": {
          "type": {
            "href": "http://localhost/rest/type/node/dream_it"
          }
        },
        "title":[{"value": "test title3 updated"}],
        "body":[{"value": "Test body3"}]
      })
      .subscribe(
        (data: any) => console.log(data)
    );
    */
    }
}
