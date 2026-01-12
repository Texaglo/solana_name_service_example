const { clusterApiUrl, Connection, PublicKey, Keypair } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, Token, MINT_SIZE,
        createAssociatedTokenAccountInstruction,
        createInitializeMintInstruction,
        getAssociatedTokenAddress,
  } = require("@solana/spl-token");
const anchor = require('@project-serum/anchor');
const bs58 = require("bs58");

const fs = require('fs');
const async_fs = fs.promises;
const path = require('path');
const os = require("os");
const {
  resolveToWalletAddress,
  getParsedNftAccountsByOwner,
} = require("@nfteyez/sol-rayz");

const test = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const publicAddress = new PublicKey("5pVyoAeURQHNMVU7DmfMHvCDNmTEYXWfEwc136GYhTKG")

  const NFTs = await getParsedNftAccountsByOwner({
    publicAddress,
    connection,
  })


  console.log(NFTs);
}

test()
