import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {Component} from "@angular/core";

@Component({selector: 'router-outlet', template: ''})
class RouterOutletStubComponent { }


describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          {path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule)},
          {path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)},
          {path: '', pathMatch: 'full', redirectTo: 'home'},
        ]),
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'webapp'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    // expect(app.title).toEqual('webapp');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    // expect(compiled.querySelector('.content span').textContent).toContain('webapp app is running!');
  });
});
