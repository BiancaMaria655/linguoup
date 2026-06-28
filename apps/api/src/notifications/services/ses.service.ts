import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * SES service wrapper for AWS SDK v3.
 *
 * NOTE: This is a stub implementation. To enable real email delivery,
 * add `@aws-sdk/client-ses` to the dependencies:
 *   pnpm --filter=api add @aws-sdk/client-ses
 *
 * Then replace the stub with the real SDK integration using env vars:
 *   AWS_SES_FROM_EMAIL, AWS_SES_REGION
 */
@Injectable()
export class SesService {
  private readonly logger = new Logger(SesService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Sends an email via AWS SES.
   */
  async sendEmail(to: string, subject: string, _body: string): Promise<void> {
    const fromEmail = this.config.get<string>('AWS_SES_FROM_EMAIL');
    const region = this.config.get<string>('AWS_SES_REGION');

    if (!fromEmail || !region) {
      this.logger.warn('AWS_SES_FROM_EMAIL or AWS_SES_REGION not configured — email skipped');
      return;
    }

    // Stub: log the would-be send and return.
    // Replace with @aws-sdk/client-ses when dependency is approved:
    //
    // import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
    // const client = new SESClient({ region });
    // await client.send(new SendEmailCommand({
    //   Source: fromEmail,
    //   Destination: { ToAddresses: [to] },
    //   Message: {
    //     Subject: { Data: subject },
    //     Body: { Text: { Data: body } },
    //   },
    // }));
    this.logger.log(`[STUB] Would send SES email to: ${to}, subject: "${subject}"`);
  }
}
