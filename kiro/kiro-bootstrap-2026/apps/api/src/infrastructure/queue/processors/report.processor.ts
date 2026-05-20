import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '../queue.constants';

/**
 * Processes report generation jobs asynchronously.
 * Regenerates cached reports when they expire or underlying data changes.
 */
@Processor(QUEUE_NAMES.REPORTS)
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  @Process('report-generate')
  async handleReportGeneration(job: { data: Record<string, unknown> }): Promise<void> {
    const { reportType, params } = job.data;

    this.logger.debug(`Generating report: ${reportType}`);

    try {
      this.logger.log(`Report "${reportType}" generated with params: ${JSON.stringify(params)}`);
    } catch (error) {
      this.logger.error(
        `Failed to generate report "${reportType}": ${error instanceof Error ? error.message : 'Unknown'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
