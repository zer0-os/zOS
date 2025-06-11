import React, { useState } from 'react';

import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Input } from '@zero-tech/zui/components/Input';

import styles from './styles.module.scss';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface Props {
  onNext: (details: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }) => void;
  onBack: () => void;
  initialValues?: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export const Details: React.FC<Props> = ({ onNext, onBack, initialValues }) => {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [email, setEmail] = useState(initialValues?.email ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [city, setCity] = useState(initialValues?.city ?? '');
  const [postalCode, setPostalCode] = useState(initialValues?.postalCode ?? '');
  const [country, setCountry] = useState(initialValues?.country ?? '');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const emailIsValid = isValidEmail(email);
  const isValid = name && email && emailIsValid && address && city && postalCode && country;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (isValid) {
      onNext({ name, email, address, city, postalCode, country });
    }
  };

  return (
    <>
      <IconButton className={styles.BackButton} onClick={onBack} Icon={IconArrowLeft} size={24} />

      <div className={styles.SectionContainer}>
        <div className={styles.SectionHeaderRow}>
          <div className={styles.SectionLine} />
          <div className={styles.SectionHeader}>Personal Info</div>
          <div className={styles.SectionLine} />
        </div>

        <form className={styles.Form} autoComplete='off' onSubmit={handleSubmit}>
          <Input
            className={styles.Input}
            value={name}
            onChange={setName}
            placeholder='Name'
            isRequired
            error={attemptedSubmit && !name}
          />
          <Input
            className={styles.Input}
            value={email}
            onChange={setEmail}
            placeholder='Email'
            type='email'
            isRequired
            error={attemptedSubmit && (!email || !emailIsValid)}
          />
          <Input
            className={styles.Input}
            value={address}
            onChange={setAddress}
            placeholder='Address (first line)'
            isRequired
            error={attemptedSubmit && !address}
          />
          <Input
            className={styles.Input}
            value={city}
            onChange={setCity}
            placeholder='City'
            isRequired
            error={attemptedSubmit && !city}
          />
          <Input
            className={styles.Input}
            value={postalCode}
            onChange={setPostalCode}
            placeholder='Zip / Postal Code'
            isRequired
            error={attemptedSubmit && !postalCode}
          />
          <Input
            className={styles.Input}
            value={country}
            onChange={setCountry}
            placeholder='Country'
            isRequired
            error={attemptedSubmit && !country}
          />

          {!attemptedSubmit && !isValid && (
            <div className={styles.FormInfo}>Please complete all fields to continue.</div>
          )}
          {attemptedSubmit && !isValid && (
            <div className={styles.FormError}>
              {!emailIsValid ? 'Please enter a valid email' : 'Please complete all fields to continue.'}
            </div>
          )}

          <div className={styles.SubmitButtonContainer}>
            <Button
              className={styles.SubmitButton}
              variant={ButtonVariant.Primary}
              isSubmit
              type='submit'
              disabled={!isValid}
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
