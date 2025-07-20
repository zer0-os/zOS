import { Button, Input } from '@zero-tech/zui/components';
import { AlertProps } from '@zero-tech/zui/components/Alert';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginByOTP, LoginStage, OTPStage, switchLoginStage } from '../../store/login';
import { errorsSelector, loadingSelector, otpStageSelector } from '../../store/login/selectors';
import styles from './otp-login.module.scss';
import { OTPVerify } from './otp-verify';

export const OTPLogin = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const otpStage = useSelector(otpStageSelector);
  const isLoading = useSelector(loadingSelector);
  const errors = useSelector(errorsSelector);
  const hasEmailError = errors.find((error) => error === 'INVALID_EMAIL');
  const rateLimitError = errors.find((error) => error === 'RATE_LIMIT');
  const emailError = hasEmailError
    ? { variant: 'error' as AlertProps['variant'], text: 'Invalid email address' }
    : rateLimitError
    ? { variant: 'error' as AlertProps['variant'], text: 'Too many requests. Try again later.' }
    : { variant: 'error' as AlertProps['variant'], text: 'An unknown error occurred' };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginByOTP({ email }));
  };

  const handleUsePassword = () => {
    dispatch(switchLoginStage(LoginStage.EmailLogin));
  };

  return (
    <div className={styles.otpLogin}>
      {otpStage === OTPStage.Verify && <OTPVerify email={email} />}
      {otpStage === OTPStage.Login && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            className={styles.input}
            label='Email Address'
            name='email'
            value={email}
            onChange={setEmail}
            autoFocus
            error={!!hasEmailError}
            alert={emailError}
          />
          <Button isSubmit isLoading={isLoading} isDisabled={!email}>
            Log in
          </Button>
          <div onClick={handleUsePassword} className={styles.usePassword}>
            Use password instead?
          </div>
        </form>
      )}
    </div>
  );
};
