import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {IconsProviderModule} from './icons-provider.module';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {FormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule, HttpClient} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NZ_I18N} from 'ng-zorro-antd/i18n';
import {en_US} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import en from '@angular/common/locales/en';
import {AppInterceptor} from "./common/interceptor/app.interceptor";
import {ShareModule} from "./common/share.module";
import { MaterialModule } from './meterial.module';
import { CdkTreeModule } from '@angular/cdk/tree';
import { AngularSplitModule } from 'angular-split';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PrivacyTermsComponent } from './privacy-terms/privacy-terms.component';

registerLocaleData(en);

@NgModule({
    declarations: [
        AppComponent,PrivacyTermsComponent
    ],
    imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: httpTranslateLoader,
            deps: [HttpClient]
          }
        }),
        BrowserModule,
        AppRoutingModule,
        IconsProviderModule,
        NzLayoutModule,
        ShareModule,
        NzMenuModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MaterialModule,
        CdkTreeModule,
        AngularSplitModule,
    ],
    providers: [{provide: NZ_I18N, useValue: en_US},
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AppInterceptor,
            multi: true
        }],
    bootstrap: [AppComponent]
})
export class AppModule {
}

// AOT compilation support
export function httpTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http);
  }