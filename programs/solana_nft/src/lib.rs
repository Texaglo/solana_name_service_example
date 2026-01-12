use crate::instructions::*;
use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

declare_id!("Amgxr2WGeKpBZzomvkTw9p5MGrTREUgCmjKzE4x5JGbt");

#[program]
pub mod solana_nft {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, mint_fee: u64) -> Result<()> {
        instructions::initialize(ctx, mint_fee)
    }

    pub fn finalize(ctx: Context<Finalize>) -> Result<()> {
        instructions::finalize(ctx)
    }

    pub fn update_fee(ctx: Context<UpdateFee>, mint_fee: u64) -> Result<()> {
        instructions::update_fee(ctx, mint_fee)
    }

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        creator_key: Pubkey,
        uri: String,
        title: String,
        subdomain: String,
    ) -> Result<()> {
        instructions::mint_nft(ctx, creator_key, uri, title, subdomain)
    }

    pub fn mint_nftcollection(
        ctx: Context<MintNFTCollection>,
        creator_key: Pubkey,
        uri: String,
        title: String,
        subdomain: String,
    ) -> Result<()> {
        instructions::mint_nftcollection(ctx, creator_key, uri, title, subdomain)
    }

    pub fn update_info(
        ctx: Context<UpdateInfo>,
        data: String,
    ) -> Result<()> {
        instructions::update_info(ctx, data)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        instructions::withdraw(ctx, amount)
    }
}
