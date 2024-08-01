import { Component } from 'react';
import { ExternalApp } from '../external-app';

const EXPLORER_ROUTE = '/explorer';
const EXPLORER_TITLE = 'Explorer';
const EXPLORER_URL = 'https://explorer.zero.tech/';

export class ExplorerApp extends Component {
  render() {
    return <ExternalApp route={EXPLORER_ROUTE} title={EXPLORER_TITLE} url={EXPLORER_URL} />;
  }
}
