import { Alert, Button } from '@zero-tech/zui/components';
import { useEffect, useState } from 'react';
import styles from './otp-login.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { errorsSelector, loadingSelector } from '../../store/login/selectors';
import { EmailLoginErrors, verifyOTPCode, loginByOTP } from '../../store/login';
import { OTPCode } from './otp-code/otp-code';
import classNames from 'classnames';
const RESEND_TIMEOUT_SECONDS = 45;

export const OTPVerify = ({ email }: { email: string }) => {
  const [code, setCode] = useState('');
  const [resendTime, setResendTime] = useState(RESEND_TIMEOUT_SECONDS);
  const isLoading = useSelector(loadingSelector);
  const errors = useSelector(errorsSelector);
  const dispatch = useDispatch();
  const hasOTPError = errors.some((error) => error === 'INVALID_OTP');
  const noUserError = errors.some((error) => error === 'USER_NOT_FOUND');
  const unknownError = errors.some((error) => error === EmailLoginErrors.UNKNOWN_ERROR);
  const error = hasOTPError
    ? 'Invalid code'
    : noUserError
    ? 'User not found'
    : unknownError
    ? 'An unknown error occurred'
    : null;

  useEffect(() => {
    if (resendTime > 0) {
      setTimeout(() => setResendTime(resendTime - 1), 1000);
    }
  }, [resendTime]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(verifyOTPCode({ email, code }));
  };

  const handleResend = () => {
    if (resendTime > 0) return;

    dispatch(loginByOTP({ email }));
    setResendTime(RESEND_TIMEOUT_SECONDS);
  };

  return (
    <div className={styles.otpVerify}>
      <div className={styles.otpVerifyHeader}>
        <div>
          An email has been sent to <span className={styles.email}>{email}</span>.
        </div>
      </div>
      <div className={classNames(styles.otpVerifyResend, resendTime <= 0 && styles.enabled)} onClick={handleResend}>
        <span>Resend {resendTime > 0 ? `(${resendTime})` : ''}</span>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <OTPCode value={code} onChange={setCode} />
        <Button isSubmit isLoading={isLoading} isDisabled={!code || code.length < 6}>
          Verify
        </Button>
        {error && (
          <Alert variant='error' isFilled>
            {error}
          </Alert>
        )}
      </form>
    </div>
  );
};
