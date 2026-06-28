import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * FCM service wrapper for Firebase Admin SDK.
 *
 * NOTE: This is a stub implementation. To enable real FCM push notifications,
 * add `firebase-admin` to the dependencies:
 *   pnpm --filter=api add firebase-admin
 *
 * Then replace the stub with the real SDK integration using the service account
 * JSON provided via the FCM_SERVICE_ACCOUNT_JSON environment variable.
 *
 * Error codes:
 * - UNREGISTERED: the device token is no longer valid; caller should clear it.
 */
@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Sends a push notification to a specific device token.
   * Throws an error with code UNREGISTERED if the token is expired.
   */
  async sendPush(deviceToken: string, message: string): Promise<void> {
    const serviceAccountJson = this.config.get<string>('FCM_SERVICE_ACCOUNT_JSON');

    if (!serviceAccountJson) {
      this.logger.warn('FCM_SERVICE_ACCOUNT_JSON not configured — push notification skipped');
      return;
    }

    // Stub: log the would-be send and return.
    // Replace with firebase-admin SDK when dependency is approved:
    //
    // import * as admin from 'firebase-admin';
    // const app = admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountJson)) });
    // await app.messaging().send({ token: deviceToken, notification: { body: message } });
    this.logger.log(`[STUB] Would send FCM push to token: ${deviceToken.slice(0, 6)}… — "${message}"`);
  }

  isUnregisteredError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('UNREGISTERED') ||
        (error as any)?.errorInfo?.code === 'messaging/registration-token-not-registered'
      );
    }
    return false;
  }
}
