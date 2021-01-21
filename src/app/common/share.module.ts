import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {ValueToNamePipe} from './pipe/value-to-name.pipe';
import {Level3NodesDirective} from './directive/level3-nodes.directive';
import {PasswordConfirmDirective} from './directive/password-confirm.directive';
import {MaterialModuleModule} from "./material-module/material-module.module";

@NgModule({
  declarations: [
    ValueToNamePipe,
    Level3NodesDirective,
    PasswordConfirmDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    HttpClientModule,
    RouterModule,
    MaterialModuleModule
  ],
  exports: [
    ValueToNamePipe,
    Level3NodesDirective,
    PasswordConfirmDirective,
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    HttpClientModule,
    MaterialModuleModule
  ]
})
export class ShareModule {
}
