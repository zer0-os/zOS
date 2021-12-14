import { SuperAgent } from 'superagent';

export interface DomainMetadata {
  title: string;
  description: string;
  image: string;
}

export class MetadataService {
  constructor(private httpClient: SuperAgent) { }

  async load(url: string): Promise<DomainMetadata> {
    let body: any;

    try {
      const response = await this.httpClient.get(url);
      body = response.body;
    } catch (_e) {
    }

    if (!body) return null;

    return this.normalize(body);
  }

  private normalize(domain: any) {
    return {
      title: domain.title || domain.name || null,
      description: domain.description || null,
      image: domain.image || null,
    }
  }
}
