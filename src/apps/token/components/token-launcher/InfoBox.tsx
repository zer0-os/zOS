import React from 'react';
import styles from './styles.module.scss';

export const InfoBox = () => {
  return (
    <div className={styles.InfoBox}>
      <div className={styles.InfoTitle}>Important Information</div>
      <ul className={styles.InfoList}>
        <li>Tokens start with bonding curve pricing and graduate to Uniswap V3 at 800M supply</li>
        <li>Initial buy amount determines starting liquidity</li>
        <li>Tokens are soulbound (non-transferable) until graduation</li>
        <li>Factory fees apply: 1% vault entry/exit, 1% protocol entry/exit</li>
      </ul>
    </div>
  );
};
