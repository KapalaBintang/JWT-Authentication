import { Module, Global } from '@nestjs/common';
import { DbService } from './db.service';

@Global()
@Module({
  providers: [DbService],
  // export DbService agar dapat diinject ke dalam modul lain
  exports: [DbService],
})
export class DbModule {}
