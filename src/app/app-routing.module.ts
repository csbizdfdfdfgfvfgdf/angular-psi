import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { PrivacyTermsComponent } from './privacy-terms/privacy-terms.component';

const routes: Routes = [
    {path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule)},
    {path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)},
    {path: 'privacy-terms', component: PrivacyTermsComponent},
    {path: '', pathMatch: 'full', redirectTo: 'home'},
    {path: '**', pathMatch: 'full', redirectTo: 'home'},

];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: false,
        enableTracing: false,
    })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
