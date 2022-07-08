import { DomainResolver } from '@zer0-os/zos-zns';
import { config } from '../../config';

export const get = () => new DomainResolver({ rootDomainId: config.rootDomainId });
