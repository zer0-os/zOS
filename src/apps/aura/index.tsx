import { Component } from 'react';
import { ExternalApp } from '../external-app';
import { AuraManifest } from './manifest';

export class AuraApp extends Component {
  render() {
    return <ExternalApp manifest={AuraManifest} />;
  }
}
