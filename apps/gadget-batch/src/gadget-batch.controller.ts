import { Controller, Get, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { BatchService } from './gadget-batch.service'
import { BATCH_ROLLBACK, BATCH_TOP_AGENTS, BATCH_TOP_PROPERTIES } from './lib/config'

@Controller()
export class BatchController {
	private logger: Logger = new Logger('~~!  BatchController  !~~');

	constructor(private readonly batchService: BatchService) {}
	// TimeOut birmaarta ishga tushadi
	@Timeout(2000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY !');
	}
	// '*/20 * * * * *' har 20 secda ishga tushadi
	@Cron('00 5 00 * * *', { name: BATCH_ROLLBACK })
  public async batchRollBack() {
    try {
      this.logger['context'] = BATCH_ROLLBACK;
      this.logger.debug('Exicuted!!!');
      await this.batchService.batchRollback()
    } catch (error) {
      this.logger.error(error)
    }

	}

	@Cron('00 10 00 * * *', { name: BATCH_TOP_PROPERTIES })
  public async batchTopProperties() {
    try {
      this.logger['context'] = BATCH_TOP_PROPERTIES;
      this.logger.debug('Exicuted!!!');
      await this.batchService.batchTopProperties()
    } catch (error) {
      this.logger.error(error)
    }
		
	}

	@Cron('00 15 00 * * *', { name: BATCH_TOP_AGENTS })
  public async batchTopAgents() {
    try {
      this.logger['context'] = BATCH_TOP_AGENTS;
      this.logger.debug('Exicuted!!! Top AgEnts');
      await this.batchService.batchTopAgents()
    } catch (error) {
      this.logger.error(error)
    }
	
	}

	/* 

  @Interval(3000) // Xar 3 sec da ishga tushaveradi 
  handleInterval() {
    this.logger.debug('BATCH SERVER Interval!')
    }

 */

	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}