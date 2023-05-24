import { Injectable } from '@nestjs/common';
import { storage } from 'firebase-admin';

@Injectable()
export class AppService {
  getHello() {
    return ""
  }
}
