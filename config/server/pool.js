const { clusterApiUrl, Connection, PublicKey, Keypair } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, Token, MINT_SIZE,
        createAssociatedTokenAccountInstruction,
        createInitializeMintInstruction,
        getAssociatedTokenAddress,
  } = require("@solana/spl-token");
const anchor = require('@project-serum/anchor');
const bs58 = require("bs58");
const {
        findAssociatedTokenAccountPda,
        findCandyMachineCreatorPda,
        findCollectionAuthorityRecordPda,
        findMasterEditionV2Pda,
        findMetadataPda,
        keypairIdentity,
        Metaplex,
        bundlrStorage,
        NftWithToken,
} = require('@metaplex-foundation/js');

const fs = require('fs');
const async_fs = fs.promises;
const path = require('path');
const os = require("os");

const PROGRAM_ADDRESS = 'CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR';

const CANDY_PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS);


const idl = JSON.parse(fs.readFileSync(path.resolve('./idl/spl_staking.json')));
const programID = new PublicKey("AG9DMWMCDcempq2tQMozgTqcPpAobPStrXu6V5CXTuJm");

const walletKeyData = JSON.parse(fs.readFileSync('./wallet/staking.json'));
const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeyData));
const wallet = new anchor.Wallet(walletKeypair);

let kindNFT = 1; // 1, 2, 3, 4, 5
let sellBuy = 0; // 0: pending 1: crafted

let stakingMintPubkey;
let poolPubkey;
let poolKeypair;


let collection_authority_record = new PublicKey("3kYoRP1YUuPTQzsA2RCXHpVs1ZExWj2GRwfC1WXTBVpR")
let collection_mint = new PublicKey("69ZoTtqHvNSm6nrL4P6PfcUWRYpotQgb1xdV5J6eqaaS")
let collection_metadata = new PublicKey("4E91qKCWoLEGYXoaiGiSshL1GsxCzLUbW1xtXVAhiS94")
let collection_master_edition = new PublicKey("FjiivXUaAbxh3ZtFPZSDrrr4H3Bn91UeVPe9NSzXDYp1")
let collection_update_authority = new PublicKey("C8HXcXRqA6UjWAf1NTQXY7i4DMvMY9x3zbUhj9dyw2Yi")

const MAX_NAME_LENGTH = 32;
const MAX_URI_LENGTH = 200;
const MAX_SYMBOL_LENGTH = 10;
const MAX_CREATOR_LEN = 32 + 1 + 1;
const MAX_CREATOR_LIMIT = 5;
const MAX_DATA_SIZE = 4 + MAX_NAME_LENGTH + 4 + MAX_SYMBOL_LENGTH + 4 + MAX_URI_LENGTH + 2 + 1 + 4 + MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172;
const CREATOR_ARRAY_START = 1 + 32 + 32 + 4 + MAX_NAME_LENGTH + 4 + MAX_URI_LENGTH + 4 + MAX_SYMBOL_LENGTH + 2 + 1 + 4;

const TOKEN_METADATA_PROGRAM = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const CANDY_MACHINE_V2_PROGRAM = new PublicKey(
  "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"
);

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// const candyMachineId = new PublicKey("ENTER_YOUR_CANDY_MACHINE_ID_HERE");

// const connection = new Connection("clusterApiUrl('devnet')")
const connection = new Connection("https://api.devnet.solana.com")


// const connection = new Connection('http://127.0.0.1:8899');
const getMintAddresses = async (connection, firstCreatorAddress) => {
  const metadataAccounts = await connection.getProgramAccounts(
    TOKEN_METADATA_PROGRAM,
    {
      // The mint address is located at byte 33 and lasts for 32 bytes.
      dataSlice: { offset: 33, length: 32 },

      filters: [
        // Only get Metadata accounts.
        { dataSize: MAX_METADATA_LEN },

        // Filter using the first creator.
        {
          memcmp: {
            offset: CREATOR_ARRAY_START,
            bytes: firstCreatorAddress.toBase58(),
          },
        },
      ],
    }
  );

  return metadataAccounts.map((metadataAccountInfo) =>
    bs58.encode(metadataAccountInfo.account.data)
  );
};
    
const getProvider = () =>{
    const provider = new anchor.Provider(
        connection, wallet, { preflightCommitment: "processed" },
    );
    return provider;
}

const getUserData = async (mintAuthority) =>{
  return getPDAPublicKey([Buffer.from("userdata"), mintAuthority.toBuffer()], programID);
};

const getUserDataInfo = async (mintAuthority) =>{
  return getPDAPublicKey([Buffer.from("user_info"), mintAuthority.toBuffer()], programID);
};

const getPDAPublicKey = async (seeds, programId) =>{
  return (await getPDA(seeds, programId))[0];
}

const getPDAPublicKey1 = async (seeds, programId) =>{
  return (await getPDA(seeds, programId))[1];
}

const getPDA = async(seeds, programId) =>{
  return anchor.web3.PublicKey.findProgramAddress(seeds, programId);
}

const getMetadata = async (mint) =>{
  return await getPDAPublicKey(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  );
};

const getMasterEdition = async (mint) =>{
  return await getPDAPublicKey(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
    TOKEN_METADATA_PROGRAM_ID,
  );
};

const provider = getProvider();

let program = new anchor.Program(idl, programID, provider);
let contractDataPublic,  treasuryDataPublic, subdomainData;

async function initializePool() {
  try{

      console.log("initializePool starting...")

      // await async_fs.appendFile('./config.js', stakingMintVault.toBase58() + "\n", 'utf8');      

      console.log("contractDataPublic address ", (await contractDataPublic).toBase58());
      console.log("treasuryDataPublic address ", (await treasuryDataPublic).toBase58());
      
      console.log(provider.wallet.publicKey.toBase58())

      const tx = await program.rpc.initialize(
          new anchor.BN(5555),
          {
              accounts: {
                contractData: await contractDataPublic,
                treasury: await treasuryDataPublic,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
              }
          }
      );
      
      console.log("Your transaction signature", tx);
      console.log("initialize finished")
  } catch (error) {
      console.log(error)
      console.log("error: initialize Skip")
  }
    
}

async function mint() {
  try{

      console.log("mint starting...")

      const lamports = await program.provider.connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      
      const mintKey = anchor.web3.Keypair.generate();
      console.log(wallet.publicKey.toBase58(), lamports, MINT_SIZE)
      const NftTokenAccount = await getAssociatedTokenAddress(mintKey.publicKey, wallet.publicKey);
      console.log("NFT Account: ", NftTokenAccount.toBase58());

      const metadataAddress = await getMetadata(mintKey.publicKey);
      const masterEdition = await getMasterEdition(mintKey.publicKey);
      
      // const mint_tx = new anchor.web3.Transaction().add(
      //   anchor.web3.SystemProgram.createAccount({
      //     fromPubkey: wallet.publicKey,
      //     newAccountPubkey: mintKey.publicKey,
      //     space: MINT_SIZE,
      //     programId: TOKEN_PROGRAM_ID,
      //     lamports,
      //   }),
      //   createInitializeMintInstruction(mintKey.publicKey, 0, provider.wallet.publicKey, provider.wallet.publicKey),
      //   createAssociatedTokenAccountInstruction(provider.wallet.publicKey, NftTokenAccount, provider.wallet.publicKey, mintKey.publicKey),
      // );
      
      // console.log(provider.wallet.publicKey.toBase58())
      // const res = await provider.sendAndConfirmTransaction(mint_tx, [mintKey]);
      // const res = await anchor.web3.sendAndConfirmTransaction(provider.connection, mint_tx, [wallet.payer, mintKey]);

      // console.log("Account: ", res);
      const [updateAuthorityPDA, bump] = await getPDA([Buffer.from("update")], programID)

      console.log("updateAuthorityPDA-->", updateAuthorityPDA.toBase58(), " ", bump)
      console.log("Mint key: ", mintKey.publicKey.toString());
      console.log("User: ", provider.wallet.publicKey.toString());
      console.log("Metadata address: ", metadataAddress.toBase58());
      console.log("MasterEdition: ", masterEdition.toBase58());

      console.log((await subdomainData).toBase58())

      const tx = await program.rpc.mintNft(
          mintKey.publicKey,
          "https://arweave.net/9MY-M2zNET9rWKw0sn-MauUWQevFnPiVPcptreuC68Q",
          "Texaglo",
          // "test1230980"
          "update",
          {
              accounts: {
                mintAuthority: provider.wallet.publicKey,
                mint: mintKey.publicKey,
                tokenAccount: NftTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
                metadata: metadataAddress,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                masterEdition: masterEdition,
                contractData: await contractDataPublic,
                userData: await getUserData(provider.wallet.publicKey),
                treasury: await treasuryDataPublic,
                subdomains: await subdomainData,
              },
              signers: [mintKey],
              instructions: [
                anchor.web3.SystemProgram.createAccount({
                      fromPubkey: wallet.publicKey,
                      newAccountPubkey: mintKey.publicKey,
                      space: MINT_SIZE,
                      programId: TOKEN_PROGRAM_ID,
                      lamports,
                }),
                createInitializeMintInstruction(mintKey.publicKey, 0, provider.wallet.publicKey, provider.wallet.publicKey),
                createAssociatedTokenAccountInstruction(provider.wallet.publicKey, NftTokenAccount, provider.wallet.publicKey, mintKey.publicKey),
               ],
          }
      );

      console.log("Your transaction signature", tx);

      // console.log(await connection.getParsedTransaction(tx))

      // console.log(await connection.confirmTransaction({ signature: tx }));

      console.log("mint finished")
  } catch (error) {
      console.log(error)
      console.log("error: mint Skip")
  }
    
}

async function ma() {
  try{
    const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(walletKeypair))
    .use(bundlrStorage({
      address: 'https://devnet.bundlr.network',
      providerUrl: "https://api.devnet.solana.com",
      timeout: 60000,
     }));

    let nft = (await metaplex.nfts().create({
      uri: `ss`,
      name: `TRAITS COLLECTION`,
      sellerFeeBasisPoints: 500, // Represents 5.00%.
  }).nft)
  console.log(nft)
  // const [updateAuthorityPDA, bump] = PublicKey.findProgramAddressSync(
  //   [
  //     Buffer.from(anchor.utils.bytes.utf8.encode('update')),
  //   ],
  //   programID
  // );
  // //Change update authority to PDA updateAuthority
  console.log(await metaplex.nfts().update({nftOrSft: collectionAllTraits, newUpdateAuthority: updateAuthorityPDA}));
  
  console.log("finished ma~")
  }catch(err){
    console.log(err)
  }
}

async function mintCollection() {
  try{

      console.log("mint collection starting...")

      const lamports = await program.provider.connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      
      const mintKey = anchor.web3.Keypair.generate();
      console.log(wallet.publicKey.toBase58(), lamports, MINT_SIZE)
      const NftTokenAccount = await getAssociatedTokenAddress(mintKey.publicKey, wallet.publicKey);
      console.log("NFT Account: ", NftTokenAccount.toBase58());

      const metadataAddress = await getMetadata(mintKey.publicKey);
      const masterEdition = await getMasterEdition(mintKey.publicKey);

      // const [updateAuthorityPDA, bump] = anchor.web3.PublicKey.findProgramAddress(
      //   [
      //     Buffer.from("update"),
      //   ],
      //   new PublicKey("Amgxr2WGeKpBZzomvkTw9p5MGrTREUgCmjKzE4x5JGbt"),
      // );
      const [updateAuthorityPDA, bump] = await getPDA([Buffer.from("update")], programID)

      console.log("updateAuthorityPDA-->", updateAuthorityPDA.toBase58(), " ", bump)
      
      const authorityPda = new PublicKey("C8HXcXRqA6UjWAf1NTQXY7i4DMvMY9x3zbUhj9dyw2Yi"); //await findCandyMachineCreatorPda(programID, CANDY_PROGRAM_ID);
      console.log("authorityPda-->", authorityPda.toBase58())
      
      //new PublicKey("DmwJrEPwi39kmNSWZjyxU89pLLP1wTxtDneuoFXtJ7F1")
      const collectionAuthorityRecord = updateAuthorityPDA
      // await findCollectionAuthorityRecordPda(
      //   collection_mint,
      //   authorityPda,
      //   CANDY_PROGRAM_ID
      // );
      console.log("collectionAuthorityRecord--->", collectionAuthorityRecord.toBase58())
      return
      // console.log("~~~~~~~~~~~~")
      // console.log("collectionAuthorityRecord--->", collectionAuthorityRecord[0])
      
      // const mint_tx = new anchor.web3.Transaction().add(
      //   anchor.web3.SystemProgram.createAccount({
      //     fromPubkey: wallet.publicKey,
      //     newAccountPubkey: mintKey.publicKey,
      //     space: MINT_SIZE,
      //     programId: TOKEN_PROGRAM_ID,
      //     lamports,
      //   }),
      //   createInitializeMintInstruction(mintKey.publicKey, 0, provider.wallet.publicKey, provider.wallet.publicKey),
      //   createAssociatedTokenAccountInstruction(provider.wallet.publicKey, NftTokenAccount, provider.wallet.publicKey, mintKey.publicKey),
      // );
      
      // console.log(provider.wallet.publicKey.toBase58())
      // const res = await provider.sendAndConfirmTransaction(mint_tx, [mintKey]);
      // const res = await anchor.web3.sendAndConfirmTransaction(provider.connection, mint_tx, [wallet.payer, mintKey]);

      // console.log("Account: ", res);
      console.log("Mint key: ", mintKey.publicKey.toString());
      console.log("User: ", provider.wallet.publicKey.toString());

      // await async_fs.appendFile('./config.js', stakingMintVault.toBase58() + "\n", 'utf8');



      console.log("Metadata address: ", metadataAddress.toBase58());
      console.log("MasterEdition: ", masterEdition.toBase58());

      console.log((await subdomainData).toBase58())

      const tx = await program.rpc.mintNftcollection(
          mintKey.publicKey,
          "https://arweave.net/9MY-M2zNET9rWKw0sn-MauUWQevFnPiVPcptreuC68Q",
          "b1",
          // "test1230980"
          "update",
          {
              accounts: {
                mintAuthority: provider.wallet.publicKey,
                mint: mintKey.publicKey,
                tokenAccount: NftTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
                metadata: metadataAddress,//new PublicKey("BaKrmciZzdn9W75CGuyuhwhRxF4VAThQTXu8aWU7w6Kp"),
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                masterEdition: masterEdition,
                contractData: await contractDataPublic,
                userData: await getUserData(provider.wallet.publicKey),
                treasury: await treasuryDataPublic,
                subdomains: await subdomainData,
                collectionAuthorityRecord: collectionAuthorityRecord,
                collectionMint: collection_mint,
                collectionMetadata: collection_metadata,
                collectionMasterEdition: collection_master_edition,
                collectionUpdateAuthority: collectionAuthorityRecord,
              },
              signers: [mintKey],
              instructions: [
                anchor.web3.SystemProgram.createAccount({
                      fromPubkey: wallet.publicKey,
                      newAccountPubkey: mintKey.publicKey,
                      space: MINT_SIZE,
                      programId: TOKEN_PROGRAM_ID,
                      lamports,
                }),
                createInitializeMintInstruction(mintKey.publicKey, 0, provider.wallet.publicKey, provider.wallet.publicKey),
                createAssociatedTokenAccountInstruction(provider.wallet.publicKey, NftTokenAccount, provider.wallet.publicKey, mintKey.publicKey),
               ],
          }
      );
      
      console.log("Your transaction signature", tx);
      console.log("mint finished")
  } catch (error) {
      console.log(error)
      console.log("error: mint Skip")
  }
    
}

async function updateFee() {
  try{
      console.log("updateFee starting...")
      // await async_fs.appendFile('./config.js', stakingMintVault.toBase58() + "\n", 'utf8');
      console.log("contractDataPublic address ", (await contractDataPublic).toBase58());
      console.log("treasuryDataPublic address ", (await treasuryDataPublic).toBase58());

      const tx  = await program.rpc.updateFee(
          new anchor.BN(10),
          {
              accounts: {
                contractData: await contractDataPublic,
                authority: provider.wallet.publicKey,
              },
          }
      );
      console.log("Your transaction signature", tx);
      console.log("updateFee finished")
  } catch (error) {
      console.log(error)
      console.log("error: updateFee Skip")
  }

}

async function withdraw() {
  try{
      console.log("withdraw starting...")
      // await async_fs.appendFile('./config.js', stakingMintVault.toBase58() + "\n", 'utf8');
      const tx  = await program.rpc.withdraw(
          new anchor.BN(1),
          {
              accounts: {
                contractData: await contractDataPublic,
                treasury: await treasuryDataPublic,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
              }
          }
      );
      console.log("Your transaction signature", tx);
      console.log("withdraw finished")
  } catch (error) {
      console.log("error: withdraw Skip ", error.msg)
  }

}

async function finalize() {
  try{
      console.log("finalize starting...")
      // await async_fs.appendFile('./config.js', stakingMintVault.toBase58() + "\n", 'utf8');
      // let poolObject = await program.account.pool.all();

      return await program.rpc.finalize(
          {
              accounts: {
                contractData: await contractDataPublic,
                userData:await getUserData(provider.wallet.publicKey),
                treasury: await treasuryDataPublic,
                authority: provider.wallet.publicKey,
              }
          }
      );
      console.log("Your transaction signature", tx);
      console.log("finalize finished")
  } catch (error) {
      console.log(error)
      console.log("error: finalize Skip")
  }

}

async function updateInfo(data) {
  try{
      console.log("updateInfo starting...")

      let poolObject = await program.account.userInfo.all();
      let poolObject1 = await program.account.userInfo.fetch(await getUserDataInfo(provider.wallet.publicKey)).catch((err)=>{});
      // console.log(poolObject)
      // console.log(poolObject1)

      const tx = await program.rpc.updateInfo(
          "",
          {
              accounts: {
                mintAuthority: provider.wallet.publicKey,
                userInfo: await getUserDataInfo(provider.wallet.publicKey),
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                systemProgram: anchor.web3.SystemProgram.programId,
              }
          }
      );

      console.log("Your transaction signature", tx);
      console.log("updateInfo finished")
  } catch (error) {
      console.log(error)
      console.log("error: updateInfo Skip")
  }

}


const main = async()=>{
  contractDataPublic = await getPDAPublicKey([Buffer.from("contractdata")], programID);
  treasuryDataPublic = await getPDAPublicKey([Buffer.from("treasury")], programID);
  subdomainData = await getPDAPublicKey([Buffer.from("s123456789001e2201")], programID);
  // console.log("111", await getPDAPublicKey1([Buffer.from("test123098")], programID))
 
  // await initializePool();
  // await updateInfo("Here is data");
  // await updateFee()
  await mint()
  // await mintCollection();
  // await ma()
  // await withdraw()
  // await finalize()
}
main();
