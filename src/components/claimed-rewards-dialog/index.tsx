import * as React from 'react';

import { IconButton, Modal, Button, Variant as ButtonVariant } from '@zero-tech/zui/components';
import { IconArrowNarrowUpRight, IconXClose } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

export interface Properties {
  meowAmount?: string;
  usdAmount?: string;
  error?: string;
  isLoading?: boolean;
  transactionHash?: string;

  onClose: () => void;
  onRetry?: () => void;
}

const explorerUrl =
  process.env.NODE_ENV === 'production' ? 'https://zscan.live' : 'https://zephyr-blockscout.eu-north-2.gateway.fm';

export const ClaimedRewardsDialog: React.FC<Properties> = ({
  meowAmount,
  usdAmount,
  error,
  isLoading = false,
  transactionHash,
  onClose,
  onRetry,
}) => {
  const onOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const renderIcon = () => (
    <div className={styles.IconContainer}>
      <div className={styles.IconWrapper}>
        <svg width='60' height='57' viewBox='0 0 60 57' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M55.1943 23.0592C59.5204 12.1591 59.9996 5.47416 60.0024 3.09116C60.0033 2.33255 59.6637 1.62799 59.07 1.15829C58.5117 0.717472 57.7933 0.539468 57.0982 0.671806C50.8757 1.85539 41.4232 6.86464 39.4161 7.95409C38.3534 7.61207 35.3412 6.83389 29.9357 6.83389C24.5302 6.83389 21.5181 7.61207 20.4554 7.95409C18.4473 6.86464 8.99489 1.85446 2.77238 0.671806C2.07727 0.539468 1.35889 0.71654 0.800566 1.15829C0.206882 1.62706 -0.132765 2.33162 -0.131834 3.09116C-0.128112 5.47416 0.350185 12.1581 4.67626 23.0592C4.42129 23.7544 3.91415 25.3621 3.72432 27.5717C3.49262 30.2669 3.70664 34.4253 6.04322 38.9304C8.16113 43.0151 11.793 47.4037 15.7571 50.6702C21.7879 55.6403 26.7598 56.7176 29.8939 56.7363C29.9078 56.7363 29.9218 56.7363 29.9357 56.7363C29.9497 56.7363 29.9637 56.7363 29.9776 56.7363C33.1117 56.7176 38.0835 55.6394 44.1144 50.6693C48.0785 47.4028 51.7104 43.0142 53.8283 38.9294C56.1648 34.4244 56.3789 30.266 56.1472 27.5708C55.9573 25.3611 55.4502 23.7535 55.1952 23.0583L55.1943 23.0592ZM52.1766 38.0711C50.1675 41.9443 46.7115 46.1157 42.9317 49.2313C37.3149 53.8593 32.7869 54.8584 29.9581 54.8733C24.8485 54.8659 20.059 51.8025 16.9389 49.2313C13.1591 46.1167 9.70303 41.9443 7.694 38.0711C5.9967 34.7981 5.28204 31.3452 5.57144 27.8094C5.78826 25.1561 6.52152 23.4469 6.52803 23.432L6.66296 23.1254C6.66575 23.1198 6.66855 23.1133 6.67041 23.1095C7.38878 21.5755 8.20487 20.0714 9.29173 18.7638C10.0194 17.8636 10.7657 17.1394 11.659 16.3109C11.2459 16.3202 10.8336 16.3836 10.4372 16.4992C8.48868 17.0444 6.75881 18.6678 5.69706 20.5336C2.1452 11.0258 1.73204 5.22999 1.72924 3.08836C1.72924 2.90477 1.81113 2.73422 1.9535 2.62145C2.08843 2.51521 2.25965 2.47234 2.42436 2.5031C8.97442 3.74819 19.8124 9.72667 19.9213 9.78632L20.314 10.0007L20.7262 9.83291C20.7541 9.82173 23.5867 8.69779 29.9348 8.69779C36.283 8.69779 39.1164 9.82173 39.1406 9.83105L39.5557 10.0044L39.9493 9.78632C40.0582 9.72574 50.8924 3.74912 57.4462 2.5031C57.6109 2.47234 57.7831 2.51521 57.9171 2.62145C58.0604 2.73422 58.1422 2.90477 58.1422 3.08836C58.1395 5.22999 57.7263 11.0277 54.1716 20.5364C54.154 20.5047 54.1363 20.4721 54.1177 20.4413C52.8652 18.3407 50.7659 16.406 48.2106 16.3109C49.3701 17.3771 50.3453 18.3696 51.233 19.6184C52.0174 20.7181 52.639 21.925 53.2169 23.1431L53.3416 23.4301C53.349 23.4469 54.0823 25.1561 54.2991 27.8094C54.5885 31.3452 53.8739 34.7981 52.1766 38.0711Z'
            fill='#ACFD5A'
          />
          <path
            d='M19.9604 33.3182C18.4306 32.1951 16.8421 31.1644 15.2388 30.1532C12.7915 28.6397 10.3981 26.8867 7.4167 26.6454C8.63664 27.8466 9.99895 28.6761 11.4031 29.567C13.1423 30.7394 14.8191 32.0246 16.5053 33.2846C17.9886 34.4048 19.5212 35.5027 21.0035 36.6061C21.6912 37.1065 22.2895 37.6378 22.8301 38.3144C23.4201 39.0273 23.9394 39.7831 24.5414 40.5408C24.8206 39.0115 24.3404 37.3526 23.3392 36.1541C22.3379 35.0656 21.1235 34.197 19.9604 33.3182Z'
            fill='#ACFD5A'
          />
          <path
            d='M39.9102 33.3182C38.747 34.197 37.5317 35.0656 36.5314 36.1541C35.5311 37.3516 35.0491 39.0133 35.3291 40.5408C35.9312 39.7822 36.4504 39.0273 37.0404 38.3144C37.5811 37.6378 38.1803 37.1065 38.8671 36.6061C40.3494 35.5036 41.882 34.4048 43.3653 33.2846C45.0514 32.0237 46.7283 30.7394 48.4674 29.567C49.8716 28.6752 51.2339 27.8457 52.4539 26.6454C49.4724 26.8877 47.0791 28.6397 44.6317 30.1532C43.0275 31.1653 41.44 32.1951 39.9102 33.3182Z'
            fill='#ACFD5A'
          />
          <path
            d='M18.5692 38.8446C17.1557 38.128 15.892 37.1653 14.7047 36.0982C13.6606 35.1513 12.6733 34.1392 11.8386 32.9882C11.6683 32.758 11.3436 32.2883 11.1872 32.047C10.5442 31.0293 9.86309 30.0395 9.02467 29.1654C8.89719 30.0144 9.05166 30.8764 9.2936 31.6863C9.53926 32.471 9.94404 33.2371 10.3395 33.9556C11.5818 36.155 13.3805 38.0627 15.5282 39.4085C17.3232 40.5175 19.4058 41.3171 21.5404 41.1382C21.9601 41.1102 22.3798 41.0403 22.7948 40.9257C22.4356 40.7067 22.055 40.5352 21.6865 40.3479C20.6508 39.8558 19.5714 39.3591 18.5701 38.8437L18.5692 38.8446Z'
            fill='#ACFD5A'
          />
          <path
            d='M48.6833 32.047C48.5288 32.2855 48.2004 32.7608 48.0319 32.9882C47.1972 34.1392 46.2109 35.1504 45.1659 36.0982C43.9776 37.1653 42.7148 38.128 41.3013 38.8446C40.2992 39.3591 39.2216 39.8558 38.185 40.3488C37.8146 40.5371 37.435 40.7085 37.0767 40.9266C37.4917 41.0422 37.9114 41.1111 38.3311 41.1391C40.4657 41.3171 42.5492 40.5175 44.3433 39.4094C46.49 38.0637 48.2897 36.156 49.532 33.9556C49.9274 33.2371 50.3322 32.471 50.5779 31.6863C50.8198 30.8764 50.9743 30.0144 50.8468 29.1654C50.0084 30.0395 49.3272 31.0293 48.6842 32.047H48.6833Z'
            fill='#ACFD5A'
          />
        </svg>
      </div>
    </div>
  );

  return (
    <Modal open={true} onOpenChange={onOpenChange}>
      <div className={styles.Content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.Header}>
          <h3 className={styles.Title}>Earnings Claimed</h3>
          <IconButton className={styles.Close} size={28} Icon={IconXClose} onClick={onClose} />
        </div>

        <div className={styles.Body}>
          {error && (
            <>
              {renderIcon()}
              <div className={styles.ErrorTitle}>Claim Failed</div>
              <div className={styles.ErrorMessage}>{error}</div>
            </>
          )}

          {isLoading && (
            <>
              {renderIcon()}
              <div className={styles.LoadingTitle}>Processing Claim...</div>
              <div className={styles.LoadingMessage}>Please wait while we process your claim.</div>
            </>
          )}

          {!error && !isLoading && (
            <>
              <div className={styles.Message}>Your Daily Earnings have been added to your Wallet.</div>
              {renderIcon()}
              <div className={styles.Amounts}>
                <div className={styles.MeowAmount}>{meowAmount}</div>
                <div className={styles.UsdAmount}>{usdAmount}</div>
                <a
                  // add hash and correct url here
                  href={`${explorerUrl}/tx/${transactionHash}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={styles.ViewTransaction}
                >
                  View Transaction
                  <IconArrowNarrowUpRight size={16} className={styles.ViewTransactionIcon} />
                </a>
              </div>
            </>
          )}
        </div>

        <div className={styles.Footer}>
          {error && (
            <>
              {onRetry && (
                <Button className={styles.Button} variant={ButtonVariant.Primary} onPress={onRetry}>
                  Try Again
                </Button>
              )}
              <Button className={styles.Button} variant={ButtonVariant.Primary} onPress={onClose}>
                Close
              </Button>
            </>
          )}

          {!error && !isLoading && (
            <Button className={styles.Button} variant={ButtonVariant.Primary} onPress={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
