import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, Location} from '@angular/common';
import {environment} from '../../../environments/environment.prod';
import {of} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UrlService {
  // services are responsible to send api calls to server like this one
  // you can save any object into a temporary varialbes in services by getter setter
  constructor() {
  }

  getUrl(url: string) {
    if (environment.production === true) {
      return 'https://apis.ppssii.com/' + url;
    }
    //return 'https://apis.ppssii.com/' + url; 
     return 'http://52.88.158.96:8080/' + url;
    // return 'https://localhost:8080/' + url;
  }
}
