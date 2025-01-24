// programs/deepchain-registry/src/lib.rs
use anchor_lang::prelude::*;
use arrayref::array_ref;

declare_id!("DEEPCNZnzaV5BmiVxC2XqTbS3DqFWBS8fN1KA7W5hMvJ");

#[program]
pub mod deepchain_registry {
    use super::*;

    /// Initialize a new AI model registry entry
    /// Accounts:
    /// 0. payer:          Signer paying for account creation
    /// 1. model_account:  Uninitialized model account (PDA)
    /// 2. system_program: System program
    #[access_control(CheckModelMetadata::validate(&ctx.accounts, &ctx))]
    pub fn register_model(
        ctx: Context<RegisterModel>,
        model_hash: [u8; 32],      // SHA-256 hash of model binary
        model_uri: String,         // URI to model storage (IPFS/Arweave)
    ) -> Result<()> {
        let model = &mut ctx.accounts.model_account;
        
        // Set model metadata
        model.owner = *ctx.accounts.payer.key;
        model.model_hash = model_hash;
        model.model_uri = model_uri;
        model.timestamp = Clock::get()?.unix_timestamp;
        model.is_verified = false;
        
        // Initialize verification counters
        model.verification_count = 0;
        model.last_verified = 0;

        Ok(())
    }

    /// Update model verification status
    /// Accounts:
    /// 0. authority:      Verification authority (PDA)
    /// 1. model_account:  Existing model account
    #[access_control(CheckVerificationAuth::validate(&ctx.accounts))]
    pub fn verify_model(
        ctx: Context<VerifyModel>,
        is_valid: bool,
    ) -> Result<()> {
        let model = &mut ctx.accounts.model_account;
        
        model.is_verified = is_valid;
        model.verification_count = model.verification_count.saturating_add(1);
        model.last_verified = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

// =====================
//  Accounts Structures
// =====================

/// Model registry account storing AI model metadata
/// Size: 32(owner) + 32(hash) + 4 + 256(uri) + 8(timestamp) + 1 + 4 + 8 = 349
#[account]
#[derive(Default)]
pub struct ModelAccount {
    pub owner: Pubkey,            // Model owner public key
    pub model_hash: [u8; 32],     // Content-addressed hash
    pub model_uri: String,        // Storage URI (max 256 chars)
    pub timestamp: i64,           // Registration timestamp
    pub is_verified: bool,        // Verification status
    pub verification_count: u32,  // Total verifications
    pub last_verified: i64,       // Last verification timestamp
}

// =====================
//  Context Definitions
// =====================

/// Context for model registration
#[derive(Accounts)]
pub struct RegisterModel<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + 349,  // 8-byte discriminator + struct size
        seeds = [b"model", payer.key().as_ref(), &model_hash],
        bump
    )]
    pub model_account: Account<'info, ModelAccount>,
    
    pub system_program: Program<'info, System>,
}

/// Context for model verification
#[derive(Accounts)]
pub struct VerifyModel<'info> {
    #[account(
        mut,
        has_one = owner @ DeepchainError::UnauthorizedAccess
    )]
    pub model_account: Account<'info, ModelAccount>,
    
    #[account(
        seeds = [b"verification_auth"],
        bump,
        constraint = authority.key() == VERIFICATION_AUTH_PUBKEY
    )]
    pub authority: Signer<'info>,
}

// =====================
//  Validation Logic
// =====================

/// Validate model registration parameters
pub struct CheckModelMetadata;
impl<'info> Validate<'info> for CheckModelMetadata {
    fn validate(
        ctx: &Context<RegisterModel>,
    ) -> Result<()> {
        // Validate URI length (max 256 characters)
        require!(
            ctx.model_uri.len() <= 256,
            DeepchainError::UriTooLong
        );
        
        // Validate hash format
        require!(
            ctx.model_hash.iter().any(|&b| b != 0),
            DeepchainError::InvalidHash
        );

        Ok(())
    }
}

// =====================
//  Error Handling
// =====================

#[error_code]
pub enum DeepchainError {
    #[msg("URI exceeds maximum length (256 characters)")]
    UriTooLong,
    #[msg("Invalid model hash format")]
    InvalidHash,
    #[msg("Unauthorized access attempt")]
    UnauthorizedAccess,
    #[msg("Verification authority mismatch")]
    InvalidVerificationAuthority,
}