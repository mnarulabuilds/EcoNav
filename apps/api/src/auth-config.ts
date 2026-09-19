import { DEMO_OTP } from '@econav/platform';

/** Pilot/demo OTP login — disable in production when real SMS auth is enabled. */
export function isDemoOtpLoginEnabled(): boolean {
  if (process.env.NODE_ENV === 'test') return true;
  if (process.env.ALLOW_DEMO_OTP === 'false') return false;
  if (process.env.ALLOW_DEMO_OTP === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

export function verifyDemoOtp(otp: string): boolean {
  if (!isDemoOtpLoginEnabled()) return false;
  return otp === DEMO_OTP;
}
