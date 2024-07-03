import { Injectable } from '@nestjs/common';

@Injectable()
export class GadgetBatchService {
  getHello(): string {
    return 'Welcome To NEST- GADGET BATCH ';
  }
}
