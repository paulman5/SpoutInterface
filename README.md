# DeFi Trading Dashboard

A comprehensive decentralized finance (DeFi) trading platform built with Next.js, featuring confidential trading, KYC verification, proof of reserve, and **ERC3643 compliant tokenized securities**.

## 🚀 Features

### Core Trading Features

- **ERC3643 Token Trading**: Trade compliant tokenized securities (LQD, MSFT, AAPL) following T-REX standard
- **Regulatory Compliance**: Built-in compliance checks for regulated securities trading
- **Real-Time Charts**: Interactive price charts with multiple timeframes (7D, 30D, 90D)
- **Price Estimation**: Real-time price estimates with 1% slippage calculations
- **Balance Display**: View USDC and token balances for informed trading decisions

### Confidential Trading

- **Privacy-First**: Encrypted trading amounts using Inco Network's FHE technology
- **Compliant Privacy**: Maintain privacy while adhering to ERC3643 compliance requirements
- **Secure Transactions**: All trade amounts are encrypted before being sent to smart contracts
- **Order Management**: Track pending buy and sell orders with encrypted data

### KYC & Identity Management (ERC3643 Required)

- **OnChain Identity**: ERC-734/735 compliant identity management required for ERC3643 tokens
- **Regulatory KYC**: Enhanced KYC verification meeting securities regulations
- **Claim Management**: Add and manage identity claims on-chain for compliance
- **Eligibility Verification**: Automatic verification of investor eligibility for regulated tokens
- **Country Support**: Support for 50+ countries with regulatory compliance checks

### Proof of Reserve

- **Real-Time Verification**: Live verification of reserve holdings backing tokenized securities
- **Transparent Backing**: View T-Bills and Corporate Bonds backing the ERC3643 tokens
- **Automated Audits**: Daily automated verification through Chainlink Functions
- **Regulatory Compliance**: Reserve verification meeting securities regulations
- **Public Verification**: Blockchain-based proof allowing public verification

### Market Data

- **Live Prices**: Real-time price feeds from Alpha Vantage API
- **Fallback Data**: Mock data generation when API limits are reached
- **Historical Data**: 100-day historical price charts
- **Volume Tracking**: Trading volume and market cap information

## 🛠 Tech Stack

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library
- **Recharts**: Interactive charting library

### Blockchain Integration

- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum
- **ERC3643**: T-REX standard for compliant tokenized securities
- **Inco Network**: Fully Homomorphic Encryption (FHE)
- **Chainlink Functions**: Decentralized oracle network

### Backend & APIs

- **Alpha Vantage**: Stock market data
- **Custom KYC API**: Identity verification service for regulatory compliance
- **Reserve API**: Proof of reserve data for tokenized securities

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SpoutChainlink/ui.git
   cd defi-trading-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:

   ```env
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   APCA_API_KEY_ID=your_alpaca_key_id
   APCA_API_SECRET_KEY=your_alpaca_secret_key
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_id
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔗 Contract Addresses (Base Sepolia)

- **Confidential Orders**: `0x02A3bf058A4B74CeeA4A4cA141908Cef33990de0`
- **USDC Token**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **ERC3643 RWA Token**: `0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB`
- **Proof of Reserve**: `0xf26c960Abf98875f87764502f64e8F5ef9134C20`
- **ID Factory**: `0x123...` (KYC identity management for ERC3643 compliance)
- **OnChain ID**: `0x456...` (User identity contracts required for ERC3643)

## 🔧 Smart Contract Integration

### ERC3643 Compliant Trading Flow

1. **KYC Verification**: Complete identity verification required for ERC3643 tokens
2. **Eligibility Check**: Verify investor eligibility for regulated securities
3. **Approve USDC**: Allow the confidential orders contract to spend USDC
4. **Encrypt Amount**: Use Inco's FHE to encrypt the trading amount
5. **Submit Order**: Call `buyAsset` or `sellAsset` with encrypted data and compliance checks
6. **Oracle Integration**: Chainlink Functions fetch real-time prices
7. **Compliance Validation**: Automatic validation of ERC3643 transfer rules
8. **Order Fulfillment**: Automatic execution when price data is available and compliance is met

### ERC3643 KYC Flow (Required)

1. **Create Identity**: Deploy personal OnChain ID contract (ERC-734/735)
2. **Add Management Key**: Set up key management for the identity
3. **Complete Regulatory KYC**: Submit verification documents meeting securities regulations
4. **Add Compliance Claims**: Attach verified claims to the identity contract
5. **Eligibility Verification**: Verify eligibility for specific ERC3643 tokens

### Proof of Reserve (Securities Backing)

1. **Request Update**: Call `requestReserves` function
2. **Oracle Fetch**: Chainlink Functions query reserve API for securities backing
3. **Update State**: Total reserves of backing securities updated on-chain
4. **Regulatory Compliance**: Ensure reserve backing meets securities regulations
5. **Public Verification**: Anyone can verify reserve backing of tokenized securities

## 📱 Usage Examples

### Trading ERC3643 Tokens

```typescript
// Buy ERC3643 compliant LQD with USDC
const handleBuy = async () => {
  // 0. Verify KYC and eligibility (automatically checked by ERC3643)

  // 1. Approve USDC
  await approve(CONFIDENTIAL_ORDERS_ADDRESS, amount);

  // 2. Encrypt amount
  const encrypted = await encryptValue({
    value: amount,
    address: userAddress,
    contractAddress: CONFIDENTIAL_ORDERS_ADDRESS,
  });

  // 3. Execute buy (includes automatic ERC3643 compliance checks)
  buyAsset(
    selectedToken,
    selectedToken,
    RWA_TOKEN_ADDRESS,
    encrypted,
    BigInt(379),
    userAddress,
  );
};
```

### ERC3643 Compliance Verification

```typescript
// Complete regulatory KYC process for ERC3643 compliance
const handleKYC = async () => {
  // 1. Create identity (required for ERC3643)
  const identityAddress = await createIdentity();

  // 2. Add management key
  await addKey(userKey, [1], 1); // Management purpose

  // 3. Submit regulatory KYC data
  const signature = await getKYCSignature(kycData);

  // 4. Add compliance claim (required for ERC3643 token transfers)
  await addClaim(1, 0, issuer, signature, kycData, "");
};
```

### Check Securities Reserves

```typescript
// Request reserve update for tokenized securities
const updateReserves = async () => {
  await requestReserves(BigInt(379)); // Subscription ID
};

// Get current reserves backing ERC3643 tokens
const currentReserves = await getReserves();
```

## 🌐 API Endpoints

### Market Data

- `GET /api/stocks/[ticker]` - Historical price data for ERC3643 tokenized securities
- `GET /api/marketdata?symbol=LQD` - Latest quote for tokenized security

### Regulatory KYC Service

- `POST /api/kyc-signature` - Get KYC signature for ERC3643 compliance verification

## 🧪 Testing

Run the test suite:

```bash
npm test

```

Run linting:

```bash
npm run lint

```

## 🔒 Security & Compliance Features

- **ERC3643 Compliance**: Full T-REX standard implementation for regulated securities
- **Regulatory KYC**: Enhanced identity verification meeting securities regulations
- **Encrypted Trading**: All trading amounts encrypted using FHE while maintaining compliance
- **Secure Key Management**: ERC-734/735 compliant identity keys required for ERC3643
- **Oracle Security**: Chainlink's decentralized oracle network
- **Custody Protection**: Regulated custodians for reserve assets backing tokenized securities
- **Smart Contract Audits**: Comprehensive security reviews including ERC3643 compliance
- **Transfer Restrictions**: Built-in transfer restrictions for regulatory compliance

## 🏛️ Regulatory Compliance

- **Securities Regulations**: Full compliance with applicable securities laws
- **KYC/AML Requirements**: Enhanced know-your-customer and anti-money laundering checks
- **Investor Eligibility**: Automatic verification of investor accreditation and eligibility
- **Transfer Restrictions**: Programmatic enforcement of regulatory transfer restrictions
- **Audit Trail**: Complete on-chain audit trail for regulatory reporting
- **Jurisdictional Compliance**: Support for multiple regulatory jurisdictions
