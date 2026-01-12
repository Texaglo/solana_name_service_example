use crate::{state::*};
use anchor_lang::prelude::*;

pub fn update_info(
    ctx: Context<UpdateInfo>,
    data: String,
) -> Result<()> {
    let data_info = &mut ctx.accounts.user_info;
    data_info.data_info = data;

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateInfo<'info> {
    #[account(mut)]
    mint_authority: Signer<'info>,
    system_program: Program<'info, System>,
    rent: Sysvar<'info, Rent>,
    #[account(init_if_needed,  seeds = [UserInfo::SEED, mint_authority.key().as_ref()], payer = mint_authority, bump, space = 8 + UserInfo::SPACE)]
    user_info: Account<'info, UserInfo>,
}