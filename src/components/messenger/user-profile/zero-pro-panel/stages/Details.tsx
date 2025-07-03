import React, { useState } from 'react';
import countryList from 'react-select-country-list';
import { postcodeValidator, postcodeValidatorExistsForCountry } from 'postcode-validator';

import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Input } from '@zero-tech/zui/components/Input';

import styles from './styles.module.scss';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const countryOptions = countryList().getData(); // [{ value: 'US', label: 'United States' }, ...]

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
  const countryIsValid = !!countryOptions.find((c) => c.value === country);
  const cityIsValid = !!city;
  const supportsPostcodeValidation = country && postcodeValidatorExistsForCountry(country);
  const postalCodeIsValid =
    country && postalCode ? (supportsPostcodeValidation ? postcodeValidator(postalCode, country) : true) : false;
  const isValid = name && email && emailIsValid && address && cityIsValid && postalCodeIsValid && countryIsValid;

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
            error={attemptedSubmit && !name}
          />
          <Input
            className={styles.Input}
            value={email}
            onChange={setEmail}
            placeholder='Email'
            type='email'
            error={attemptedSubmit && (!email || !emailIsValid)}
          />
          <div className={styles.SelectWrapper} data-status={attemptedSubmit && !countryIsValid ? 'error' : undefined}>
            <select className={styles.Select} value={country} onChange={(e) => setCountry(e.target.value)}>
              <option className={styles.SelectOption} value=''>
                Select a country
              </option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            className={styles.Input}
            value={address}
            onChange={setAddress}
            placeholder='Address (first line)'
            error={attemptedSubmit && !address}
          />
          <Input
            className={styles.Input}
            value={city}
            onChange={setCity}
            placeholder='City'
            error={attemptedSubmit && !cityIsValid}
          />
          <Input
            className={styles.Input}
            value={postalCode}
            onChange={setPostalCode}
            placeholder='Zip / Postal Code'
            error={attemptedSubmit && !postalCodeIsValid}
          />

          {/* Error/Info/Success messaging */}
          {/* TODO: Clean up the form info/error messaging */}
          {isValid ? (
            <div className={styles.FormSuccess}>All fields completed</div>
          ) : attemptedSubmit ? (
            <div className={styles.FormError}>
              {!emailIsValid
                ? 'Please enter a valid email.'
                : !countryIsValid
                ? 'Please select a valid country.'
                : !postalCodeIsValid
                ? 'Please enter a valid code for the selected country.'
                : !name || !address || !city
                ? 'Please complete all fields to continue.'
                : ''}
            </div>
          ) : (
            <div className={styles.FormInfo}>Please complete all fields to continue.</div>
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
