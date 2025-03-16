import { Component } from 'react';
import { ExternalApp } from '../external-app';
import { ExplorerManifest } from './manifest';

export class ExplorerApp extends Component {
  render() {
    return <ExternalApp manifest={ExplorerManifest} />;
  }
}
