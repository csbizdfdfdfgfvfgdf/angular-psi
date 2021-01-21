import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-privacy-terms',
  templateUrl: './privacy-terms.component.html',
  styleUrls: ['./privacy-terms.component.less']
})
export class PrivacyTermsComponent implements OnInit {

  constructor(
    public translate: TranslateService,) { }

  ngOnInit(): void {
    this.translate.addLangs(['en', 'ch']);
    let dfltLang = localStorage.getItem('lang');
    if(dfltLang != null && dfltLang != ''){
        this.translate.use(dfltLang);
        this.translate.setDefaultLang(dfltLang);
    }else{
        this.translate.use('en');
        this.translate.setDefaultLang('en');
    }
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    localStorage.removeItem('lang');
    localStorage.setItem('lang',lang);
  }
}
