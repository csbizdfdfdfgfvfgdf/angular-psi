import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module'; 
import {NzLayoutModule, NzGridModule} from "ng-zorro-antd";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {ShareModule} from "../../common/share.module";
import {MatTreeModule} from "@angular/material/tree"; 
import { ManageNotepadComponent } from './manage-notepad/manage-notepad.component';
import { MaterialModule } from 'src/app/meterial.module';
import { CdkTreeModule } from '@angular/cdk/tree';
import { NgxSpinnerModule } from 'ngx-spinner'; 
import { AngularSplitModule } from 'angular-split';  

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

@NgModule({
  declarations: [ManageNotepadComponent],
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
    HomeRoutingModule,
    NzLayoutModule,
    DragDropModule,
    MatTreeModule,
    ShareModule,
    NzGridModule,
    MaterialModule,
    CdkTreeModule, 
    NgxSpinnerModule,
    AngularSplitModule,
  ],
  entryComponents: [ManageNotepadComponent],
})
export class HomeModule { }

// AOT compilation support
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}