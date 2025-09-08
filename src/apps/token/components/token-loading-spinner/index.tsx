import styles from './styles.module.scss';

export const TokenLoadingSpinner = () => {
  return (
    <div className={styles.Container}>
      <svg className={styles.OuterCircle} viewBox='0 0 72 72' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <circle className={styles.PulseCircle} cx='36' cy='36' r='0' fill='#01f4cb' />
        <circle cx='36' cy='36' r='8' fill='#01f4cb' />

        <circle
          className={styles.Spinner}
          cx='36'
          cy='36'
          r='35'
          stroke='#01f4cb'
          strokeWidth='2'
          strokeDasharray='1, 220'
          strokeDashoffset='0'
        />
        <circle cx='36' cy='36' r='35' stroke='#01F4CB3D' strokeWidth='2' />
      </svg>
    </div>
  );
};
