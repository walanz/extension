# Walanz - Multi-chain ETH Balance Checker

A Chrome extension for checking ETH balances across multiple chains.

## Features

- 🔍 Address input with ENS resolution support
- 🌐 Multi-chain selection (Mainnet, L2s, and other networks)
- 💰 Real-time balance cards with chain grouping
- 📊 Balance history visualization
- 🔗 Block explorer quick links
- 🌙 Automatic dark mode support

## Development

### Prerequisites

- Node.js 16+
- npm or pnpm

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Load the extension in Chrome:
   - Go to chrome://extensions/
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Building for production

```bash
npm run build
```

The built extension will be in the `dist` folder, ready to be packaged or loaded as an unpacked extension.

## API Service

This extension depends on a backend service that provides the balance data. Make sure the service is running at the specified API URL (configurable in `src/api/apiService.ts`).

## License

MIT