# Shared Terminology Guide

## Core Concepts

### Architecture Terms
- **zOS**: The ZERO operating system/platform (not "Z-OS" or "z-os")
- **Apps**: Core modules within zOS (feed, messenger, wallet, etc.)
- **External Apps**: Third-party integrations using ExternalApp wrapper

### Redux/State Management
- **Store**: The Redux store containing all application state
- **Saga**: Generator function handling side effects
- **Selector**: Function to extract data from Redux store
- **Normalized State**: Entities stored by ID with relationships as references
- **Container**: Component connected to Redux store
- **Presentational Component**: Pure React component without Redux connection

### Matrix Terms
- **Room**: Chat conversation in Matrix
- **Event**: Any action in Matrix (message, join, leave, etc.)
- **Home Server**: Matrix server instance
- **Sliding Sync**: Optimized sync protocol for Matrix

### Web3 Terms
- **Wallet**: Web3 wallet (MetaMask, WalletConnect, etc.)
- **Chain**: Blockchain network (Ethereum, Polygon, etc.)
- **Transaction**: Blockchain transaction
- **Smart Contract**: On-chain program

### Development Terms
- **PR**: Pull Request
- **DevTools**: Browser Developer Tools
- **Hot Reload**: Automatic refresh on code changes

## Naming Conventions
- Use `kebab-case` for file names
- Use `PascalCase` for React components
- Use `camelCase` for functions and variables
- Use `SCREAMING_SNAKE_CASE` for constants

## Tone Guidelines
- Professional but approachable
- Assume intelligence but not expertise
- Explain "why" not just "how"
- Use "you" to address the reader
- Avoid jargon without explanation