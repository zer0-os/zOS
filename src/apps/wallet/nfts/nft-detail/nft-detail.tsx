import { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IconPackageMinus,
  IconCopy2,
  IconCheck,
  IconLinkExternal1,
  IconChevronLeft,
  IconVolumeMax,
  IconVolumeX,
  IconPlay,
} from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { PanelBody } from '../../../../components/layout/panel';
import { useNFTsQuery } from '../../queries/useNFTsQuery';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../../store/wallet/selectors';
import { getNFTExplorerUrl } from '../utils';
import { NFTBadge } from '../nft-badge';
import styles from './nft-detail.module.scss';

export const NFTDetail = () => {
  const { collectionAddress, tokenId } = useParams<{ collectionAddress: string; tokenId: string }>();
  const history = useHistory();
  const selectedWallet = useSelector(selectedWalletSelector);
  const { nfts } = useNFTsQuery(selectedWallet.address);
  const [isCopied, setIsCopied] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentNftIdRef = useRef<string | null>(null);

  // Find the NFT from the list
  const nft = nfts.find(
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

  // Reset video ready state when NFT actually changes
  useEffect(() => {
    if (nft?.id && nft.id !== currentNftIdRef.current) {
      currentNftIdRef.current = nft.id;
      setIsVideoReady(false);

      // Check if video is already cached when NFT changes
      const video = videoRef.current;
      if (video && nft.animationUrl && video.readyState >= 3) {
        // Video is already cached, mark as ready immediately
        setIsVideoReady(true);
      }
    }
  }, [nft?.id, nft?.animationUrl]);

  // Handle autoplay - try to play, mute if autoplay fails
  useEffect(() => {
    const video = videoRef.current;
    if (video && nft?.animationUrl && isVideoReady) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay failed, mute and try again
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {});
        });
    }
  }, [isVideoReady, nft?.animationUrl]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
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
          {nft.quantity && nft.quantity > 1 && <NFTBadge type='quantity' value={nft.quantity} />}
          {nft.tokenType && <NFTBadge type='tokenType' value={nft.tokenType} />}
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
                playsInline
                preload='auto'
                className={`${styles.image} ${styles.video} ${isVideoReady ? styles.videoReady : ''}`}
                onCanPlay={() => {
                  setIsVideoReady(true);
                  const video = videoRef.current;
                  if (video) {
                    setIsMuted(video.muted);
                    setIsPlaying(!video.paused);
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {isVideoReady && (
                <>
                  <button
                    className={styles.playPauseButton}
                    onClick={handleTogglePlay}
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? (
                      <svg viewBox='0 0 24 24' fill='currentColor' width={20} height={20}>
                        <path d='M6 4h4v16H6V4zm8 0h4v16h-4V4z' />
                      </svg>
                    ) : (
                      <IconPlay size={20} />
                    )}
                  </button>
                  <button
                    className={styles.volumeButton}
                    onClick={handleToggleMute}
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? <IconVolumeX size={20} /> : <IconVolumeMax size={20} />}
                  </button>
                </>
              )}
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
