import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router'; 
import { ManageNotepadComponent } from './manage-notepad/manage-notepad.component'; 


const routes: Routes = [
  {
    path: 'mynotes',
    component: ManageNotepadComponent,
  }, 
  {
    path: '',
    redirectTo: 'mynotes',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {
}
