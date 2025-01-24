// tests/deepchain-registry.ts
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { DeepchainRegistry } from '../target/types/deepchain_registry';

describe('DeepChain Registry', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.DeepchainRegistry as Program<DeepchainRegistry>;
  const modelHash = new Uint8Array(32).fill(1); // Test hash

  it('Registers new AI model', async () => {
    const [modelPDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("model"), provider.wallet.publicKey.toBuffer(), modelHash],
      program.programId
    );

    await program.methods.registerModel(
      modelHash,
      "ipfs://QmTestHash"
    ).accounts({
      modelAccount: modelPDA,
      payer: provider.wallet.publicKey,
    }).rpc();

    const modelAccount = await program.account.modelAccount.fetch(modelPDA);
    expect(modelAccount.owner.equals(provider.wallet.publicKey)).is.true;
    expect(modelAccount.modelUri).to.equal("ipfs://QmTestHash");
  });

  it('Updates verification status', async () => {
    const [authPDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("verification_auth")],
      program.programId
    );

    await program.methods.verifyModel(true).accounts({
      modelAccount: modelPDA,
      authority: authPDA,
    }).rpc();

    const updatedAccount = await program.account.modelAccount.fetch(modelPDA);
    expect(updatedAccount.isVerified).is.true;
    expect(updatedAccount.verificationCount).to.equal(1);
  });
});