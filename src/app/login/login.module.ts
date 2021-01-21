import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShareModule} from '../common/share.module';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {LoginComponent} from './login.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [
    LoginComponent
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
    CommonModule,
    ReactiveFormsModule,
    ShareModule,
    RouterModule.forChild([{
      path: '',
      component: LoginComponent,
    }, {
      path: ':doaction',
      component: LoginComponent,
    }]),
  ]
})
export class LoginModule {
}

// AOT compilation support
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}