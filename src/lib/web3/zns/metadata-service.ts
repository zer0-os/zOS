import { SuperAgent } from 'superagent';

import { config as appConfig } from '../../../config';

export interface DomainMetadata {
  title: string;
  description: string;
  image: string;
}

export class MetadataService {
  constructor(private httpClient: SuperAgent, private config = appConfig) { }

  async load(url: string): Promise<DomainMetadata> {
    const normalizedUrl = this.normalizeUrl(url);

    let body: any;

    try {
      const response = await this.httpClient.get(normalizedUrl);
      body = response.body;
    } catch (_e) {
    }

    if (!body) return null;

    return this.normalize(body);
  }

  private normalizeUrl(url: string) {
    const ipfsRegex = new RegExp(/^ipfs:\/\/(.*)$/);

    if (url.match(ipfsRegex)) {
      const result = ipfsRegex.exec(url);

      return `${this.ipfsBaseUrl}${result[1]}`;
    }

    return url;
  }

  private get ipfsBaseUrl() {
    let url = this.config.ipfsBaseUrl;

    if (!url.endsWith('/')) {
      url = `${url}/`;
    }

    return url;
  }

  private normalize(domain: any) {
    return {
      title: domain.title || domain.name || null,
      description: domain.description || null,
      image: this.normalizeImage(domain),
    }
  }

  private normalizeImage({ image, image_full }) {
    const url = image || image_full;

    if (!url) return null;

    return this.normalizeUrl(url);
  }
}
