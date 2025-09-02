import styles from './formatted-number.module.scss';
import { decimalSeparator } from '../../utils/format-numbers';

interface FormattedNumberProps {
  value: string;
}

export const FormattedNumber = ({ value }: FormattedNumberProps) => {
  if (!value) {
    return <>--</>;
  }

  // Handle numbers < 0.0001 with special subscript formatting
  const smallNumberMatch = value.match(/^0\.(0{3,})([1-9]\d*)$/);
  if (smallNumberMatch) {
    const zerosCount = smallNumberMatch[1].length;
    const restOfNumber = smallNumberMatch[2];
    return (
      <span className={styles.formattedNumber}>
        {`0${decimalSeparator}0`}
        <sub>{zerosCount}</sub>
        {restOfNumber}
      </span>
    );
  }

  // Handle numbers > 10,000 by showing only the formatted integer part
  if (Number(value) > 10000) {
    const intPart = value.split('.')[0];
    return <span>{BigInt(intPart).toLocaleString()}</span>;
  }

  const [whole, frac] = value.split('.');

  if (whole === '0') {
    // For numbers starting with 0, reduce frac to 4 significant digits
    if (frac) {
      let significantDigits = '';
      let count = 0;
      for (const digit of frac) {
        significantDigits += digit;
        if (digit !== '0' || count > 0) {
          count++;
        }
        if (count === 4) {
          break;
        }
      }
      return <span>{`0${decimalSeparator}${significantDigits}`}</span>;
    }
  }

  try {
    const bigWhole = BigInt(whole);
    const formattedWhole = bigWhole.toLocaleString();
    const validFrac = frac.split('').some((digit) => digit !== '0') ? frac : '';
    const formattedFraction = validFrac && bigWhole > 0n ? validFrac.slice(0, 2) : validFrac;
    return (
      <span>{formattedFraction ? `${formattedWhole}${decimalSeparator}${formattedFraction}` : formattedWhole}</span>
    );
  } catch (e) {
    return <span>{value}</span>;
  }
};
