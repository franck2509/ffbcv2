import { TestBed, inject } from '@angular/core/testing';

import { DrupaldataService } from './drupaldata.service';

describe('DrupaldataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DrupaldataService]
    });
  });

  it('should be created', inject([DrupaldataService], (service: DrupaldataService) => {
    expect(service).toBeTruthy();
  }));
});
