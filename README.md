# Solana Name Service NFT Program

A comprehensive Solana program for minting NFTs with integrated domain name functionality. This program allows users to mint unique NFTs while associating them with custom subdomains, creating a decentralized name service on the Solana blockchain.

## 🚀 Features

- **NFT Minting**: Create unique NFTs following Metaplex standards
- **Domain Integration**: Associate NFTs with custom subdomains
- **Fee Management**: Configurable minting fees with treasury collection
- **Collection Support**: Support for both individual NFTs and NFT collections
- **User Tracking**: Monitor user minting activity and limits
- **Treasury Management**: Built-in treasury system for fee collection and withdrawal

## 📋 Program Functions

### Core Functions
- `initialize` - Set up the program with initial configuration and fees
- `mint_nft` - Mint individual NFTs with associated subdomains
- `mint_nftcollection` - Mint NFTs as part of a collection
- `update_fee` - Modify the minting fee (admin only)
- `withdraw` - Withdraw accumulated fees from treasury (admin only)
- `finalize` - Complete user sessions and update records
- `update_info` - Store additional user information

### Key Features
- **Subdomain Registration**: Each NFT can be linked to a unique subdomain
- **Minting Limits**: Configurable limits on total NFTs and per-user limits
- **Fee Collection**: Automatic fee deduction during minting
- **Metadata Creation**: Full Metaplex metadata and master edition creation
- **Event Emission**: Program events for tracking minting activity

## 🏗️ Program Architecture

### Accounts
- **ContractData**: Stores program configuration, fees, and global statistics
- **UserData**: Tracks individual user minting activity and timestamps
- **UserInfo**: Stores additional user information and preferences
- **SubDomainData**: Manages domain name associations with NFTs
- **Treasury**: Holds collected fees for program administration

### Security Features
- Program-derived addresses (PDAs) for secure account management
- Authority controls for administrative functions
- Fee validation and treasury protection
- Domain uniqueness validation

## 🛠️ Prerequisites

- [Anchor Framework](https://book.anchor-lang.com/getting_started/installation.html)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Node.js](https://nodejs.org/) (v16+)
- [Yarn](https://yarnpkg.com/) or npm

## 🚀 Quick Start

### Setup Dependencies
```bash
npm install
```

## 🚀 Deployment

### Step 1: Initial Build
```bash
anchor build
```

### Step 2: Generate Program Keypair
```bash
solana -k target/deploy/nft-keypair.json
```

### Step 3: Update Program Addresses

After running the keypair command, you'll get a program address. Copy this address and update the following files:

**Anchor.toml:**
```toml
[programs.localnet]
solana_nft = "YOUR_PROGRAM_ID_HERE"

[programs.devnet]
solana_nft = "YOUR_PROGRAM_ID_HERE"

[programs.testnet]
solana_nft = "YOUR_PROGRAM_ID_HERE"

[programs.mainnet]
solana_nft = "YOUR_PROGRAM_ID_HERE"
```

**programs/solana_nft/src/lib.rs:**
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

### Step 4: Final Deployment
```bash
anchor build
anchor deploy
```

### Step 5: Program Configuration

Copy the deployed program address to update the configuration:

**config/server/pool.js:**
```javascript
const programID = new PublicKey("YOUR_PROGRAM_ID_HERE");
```

### Step 6: Initialize the Smart Contract
```bash
cd config
npm run pool
```

This will initialize the program with default settings and prepare it for NFT minting.

## 📖 Usage Examples

### Minting an NFT
Users can mint NFTs by calling the `mint_nft` function with:
- Creator address
- Metadata URI (Arweave, IPFS, etc.)
- NFT title
- Associated subdomain

### Managing Collections
The program supports both individual NFTs and organized collections through the `mint_nftcollection` function.

### Fee Management
Administrators can update minting fees using the `update_fee` function and withdraw accumulated funds using `withdraw`.

## 🔧 Configuration

### Environment Setup
- Update all program IDs in configuration files after deployment
- Configure wallet addresses for administrative functions
- Set appropriate cluster endpoints (devnet/mainnet)

### Fee Structure
- Default minting fee: Configurable during initialization
- Fee collection: Automatic during minting process
- Treasury withdrawal: Admin-controlled

## 🧪 Testing

Run the test suite:
```bash
anchor test
```

## 📚 API Reference

### Program ID
The program uses Metaplex Token Metadata program for NFT standards:
- Token Metadata: `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`

### Events
- `NFTMinted`: Emitted when an NFT is successfully minted
- `FeeUpdated`: Emitted when minting fees are changed
- `Initialized`: Emitted during program setup
- `Finalized`: Emitted when user sessions are completed
- `Withdrawn`: Emitted when treasury funds are withdrawn

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Security Notice

This program handles financial transactions and NFT minting. Always audit the code thoroughly before deploying to mainnet. The current version includes safety checks but should be reviewed by security professionals for production use.

