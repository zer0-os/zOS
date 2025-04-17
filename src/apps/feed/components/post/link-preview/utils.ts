import { PostLinkPreviewType, PostLinkPreviewData } from './index';

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;

export function detectLinkType(url: string): PostLinkPreviewType | null {
  if (!url) return null;
  if (YOUTUBE_REGEX.test(url)) return 'youtube';
  return null;
}

export async function fetchYoutubePreview(videoId: string): Promise<PostLinkPreviewData> {
  if (!videoId) {
    throw new Error('Video ID is required');
  }

  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch YouTube preview');
    }

    const data = await response.json();

    if (!data?.title) {
      throw new Error('Invalid YouTube response');
    }

    return {
      title: data.title,
      authorName: data.author_name || '',
      authorHandle: data.author_url || '',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoId,
    };
  } catch (error) {
    console.error('Error fetching YouTube preview:', error);
    throw new Error('Failed to fetch YouTube preview');
  }
}

export async function fetchPreviewFromUrl(url: string, type: PostLinkPreviewType): Promise<PostLinkPreviewData> {
  if (!url || !type) {
    throw new Error('URL and type are required');
  }

  if (type === 'youtube') {
    const match = url.match(YOUTUBE_REGEX);
    if (!match?.[1]) throw new Error('Invalid YouTube URL');
    return fetchYoutubePreview(match[1]);
  }

  throw new Error('Unsupported URL type');
}
