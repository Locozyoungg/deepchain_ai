// cross-chain/wormhole/solana/src/lib.rs
use anchor_lang::prelude::*;

declare_id!("WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrDbwDhD");

#[program]
pub mod wormhole_bridge {
    use super::*;

    pub fn lock_tokens(
        ctx: Context<LockTokens>,
        amount: u64,
        target_chain: u16
    ) -> Result<()> {
        // Verify chain ID
        require!(target_chain != 0, BridgeError::InvalidChain);
        
        // Transfer tokens
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.source.to_account_info(),
                    to: ctx.accounts.custody.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
        )?;

        // Emit VAA
        emit!(TokenLocked {
            sender: ctx.accounts.owner.key(),
            amount,
            target_chain,
            timestamp: Clock::get()?.unix_timestamp
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct LockTokens<'info> {
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub custody: Account<'info, TokenAccount>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[event]
pub struct TokenLocked {
    pub sender: Pubkey,
    pub amount: u64,
    pub target_chain: u16,
    pub timestamp: i64,
}

#[error_code]
pub enum BridgeError {
    #[msg("Invalid target chain ID")]
    InvalidChain,
}