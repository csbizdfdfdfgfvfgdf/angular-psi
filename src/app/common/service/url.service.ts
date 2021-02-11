import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, Location} from '@angular/common';
import {environment} from '../../../environments/environment.prod';
import {of} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UrlService {

  constructor() {
  }

  getUrl(url: string) {
    if (environment.production === false) {
      return '/api/' + url;
    }
    return 'https://apis.ppssii.com/' + url; 
    // return 'http://52.88.158.96:8080/' + url;
    // return 'https://localhost:8080/' + url;
  }
}
