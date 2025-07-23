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

  // For all other numbers, display the full value with a formatted integer part.
  const [whole, frac] = value.split('.');
  // Use try/catch for BigInt in case of an invalid number string
  try {
    const formattedWhole = BigInt(whole).toLocaleString();
    return <span>{frac ? `${formattedWhole}${decimalSeparator}${frac}` : formattedWhole}</span>;
  } catch (e) {
    return <span>{value}</span>;
  }
};
