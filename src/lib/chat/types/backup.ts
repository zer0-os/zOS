import { BackupTrustInfo, KeyBackupInfo } from 'matrix-js-sdk/lib/crypto-api';

export interface MatrixKeyBackupInfo {
  backupInfo: KeyBackupInfo;
  trustInfo: BackupTrustInfo;
  crossSigning: boolean;
}
