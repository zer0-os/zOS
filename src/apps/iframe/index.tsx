import './styles.scss';

import { bemClassName } from '../../lib/bem';

const cn = bemClassName('iframe');

export interface IFrameProps {
  src: string;
  title: string;
}

export const IFrame = ({ src, title }: IFrameProps) => {
  return <iframe data-testid='iframe' {...cn('')} src={src} title={title} />;
};
