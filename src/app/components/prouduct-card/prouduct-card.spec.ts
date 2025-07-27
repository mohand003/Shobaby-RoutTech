import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProuductCard } from './prouduct-card';

describe('ProuductCard', () => {
  let component: ProuductCard;
  let fixture: ComponentFixture<ProuductCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProuductCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProuductCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
