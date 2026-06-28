import { FcmService } from './fcm.service';
import { ConfigService } from '@nestjs/config';

describe('FcmService', () => {
  let fcmService: FcmService;
  let mockConfig: jest.Mocked<Pick<ConfigService, 'get'>>;

  beforeEach(() => {
    mockConfig = { get: jest.fn() };
    fcmService = new FcmService(mockConfig as any);
  });

  describe('isUnregisteredError', () => {
    it('should return true for UNREGISTERED message', () => {
      const err = new Error('UNREGISTERED');
      expect(fcmService.isUnregisteredError(err)).toBe(true);
    });

    it('should return true for messaging/registration-token-not-registered errorInfo code', () => {
      const err: any = new Error('FCM error');
      err.errorInfo = { code: 'messaging/registration-token-not-registered' };
      expect(fcmService.isUnregisteredError(err)).toBe(true);
    });

    it('should return false for other errors', () => {
      const err = new Error('Network timeout');
      expect(fcmService.isUnregisteredError(err)).toBe(false);
    });

    it('should return false for non-Error values', () => {
      expect(fcmService.isUnregisteredError('some string')).toBe(false);
      expect(fcmService.isUnregisteredError(null)).toBe(false);
    });
  });

  describe('sendPush', () => {
    it('should skip and warn if FCM_SERVICE_ACCOUNT_JSON is not configured', async () => {
      mockConfig.get.mockReturnValue(undefined);

      // Should not throw
      await expect(fcmService.sendPush('some-token', 'test message')).resolves.toBeUndefined();
    });
  });
});
