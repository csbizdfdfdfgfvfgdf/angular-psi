import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNotepadComponent } from './manage-notepad.component';

describe('ManageNotepadComponent', () => {
  let component: ManageNotepadComponent;
  let fixture: ComponentFixture<ManageNotepadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageNotepadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageNotepadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
