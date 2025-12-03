import { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IconPackageMinus, IconCopy2, IconCheck, IconLinkExternal1, IconChevronLeft } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { PanelBody } from '../../../../components/layout/panel';
import { useNFTsQuery } from '../../queries/useNFTsQuery';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../../store/wallet/selectors';
import { getNFTExplorerUrl } from '../utils';
import styles from './nft-detail.module.scss';

export const NFTDetail = () => {
  const { collectionAddress, tokenId } = useParams<{ collectionAddress: string; tokenId: string }>();
  const history = useHistory();
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data } = useNFTsQuery(selectedWallet.address);
  const [isCopied, setIsCopied] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Find the NFT from the list
  const nft = data?.nfts.find(
    (n) => n.collectionAddress.toLowerCase() === collectionAddress.toLowerCase() && n.id === tokenId
  );

  const handleBack = () => {
    history.push('/wallet/nfts');
  };

  const handleCopyId = () => {
    if (nft) {
      navigator.clipboard.writeText(nft.id);
      setIsCopied(true);
    }
  };

  const handleExternalLink = () => {
    if (nft) {
      const url = getNFTExplorerUrl(nft.collectionAddress, nft.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Reset to copy icon after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !nft?.animationUrl) {
      setIsVideoReady(false);
      return;
    }

    if (video.readyState >= 3) {
      video.currentTime = 0;
      video.play().catch(() => {});
      setIsVideoReady(true);
    }
  }, [nft?.animationUrl]);

  const handleVideoCanPlay = () => {
    setIsVideoReady(true);
  };

  if (!nft) {
    return (
      <PanelBody className={styles.container}>
        <div className={styles.header}>
          <IconButton Icon={IconChevronLeft} className={styles.backButton} onClick={handleBack} />
          <span className={styles.headerLabel}>NFT Details</span>
          <span className={styles.headerSpacer} />
        </div>
        <div className={styles.notFound}>NFT not found</div>
      </PanelBody>
    );
  }

  const nftName = nft.metadata?.name ?? 'Unnamed Token';
  const description = nft.metadata?.description;
  const attributes = nft.metadata?.attributes ?? [];

  return (
    <PanelBody className={styles.container}>
      <div className={styles.header}>
        <IconButton Icon={IconChevronLeft} className={styles.backButton} onClick={handleBack} />
        <span className={styles.headerLabel}>{nftName}</span>
        <span className={styles.headerSpacer} />
      </div>

      <div className={styles.content}>
        <div className={styles.imageContainer}>
          {nft.animationUrl ? (
            <>
              {nft.imageUrl && (
                <img
                  src={nft.imageUrl}
                  alt={nftName}
                  className={`${styles.image} ${styles.imagePlaceholder} ${
                    isVideoReady ? styles.imagePlaceholderHidden : ''
                  }`}
                />
              )}
              {!isVideoReady && (
                <div className={styles.videoLoading}>
                  <Spinner />
                </div>
              )}
              <video
                ref={videoRef}
                src={nft.animationUrl}
                autoPlay
                loop
                muted
                playsInline
                preload='auto'
                className={`${styles.image} ${styles.video} ${isVideoReady ? styles.videoReady : ''}`}
                onCanPlay={handleVideoCanPlay}
              />
            </>
          ) : nft.imageUrl ? (
            <img src={nft.imageUrl} alt={nftName} className={styles.image} />
          ) : (
            <div className={styles.imageFallback}>
              <IconPackageMinus className={styles.fallbackIcon} size={80} />
              {nft.collectionName && <div className={styles.collectionLabel}>{nft.collectionName}</div>}
            </div>
          )}
        </div>

        <div className={styles.details}>
          <div className={styles.nameIdRow}>
            <div className={styles.name}>{nftName}</div>
            <div className={styles.idContainer}>
              <span className={styles.id}>ID: {nft.id}</span>
              <IconButton
                onClick={handleCopyId}
                Icon={isCopied ? IconCheck : IconCopy2}
                aria-label={isCopied ? 'Copied!' : 'Copy NFT ID'}
                size={20}
                className={`${styles.copyButton} ${isCopied ? styles.copied : ''}`}
              />
              <IconButton
                onClick={handleExternalLink}
                Icon={IconLinkExternal1}
                aria-label='View on explorer'
                size={20}
                className={styles.externalLinkButton}
              />
            </div>
          </div>

          {description && <div className={styles.description}>{description}</div>}

          {attributes.length > 0 && (
            <div className={styles.attributesSection}>
              <div className={styles.sectionTitle}>Attributes</div>
              <div className={styles.attributes}>
                {attributes.map((attr, index) => (
                  <div key={index} className={styles.attribute}>
                    <div className={styles.attributeTrait}>{attr.traitType}</div>
                    <div className={styles.attributeValue}>{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PanelBody>
  );
};
