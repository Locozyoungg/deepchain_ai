// test/contracts/DeepChainVerification.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { utils } = ethers;

describe('DeepChain Verification System', () => {
  let verifier, reputation;
  let validator, user1, user2;
  let token;

  before(async () => {
    [validator, user1, user2] = await ethers.getSigners();
    
    // Deploy test ERC20 token
    const Token = await ethers.getContractFactory('ERC20Mock');
    token = await Token.deploy('Reputation Token', 'REP', validator.address, utils.parseEther('1000000'));
    await token.deployed();

    // Deploy Verifier
    const Verifier = await ethers.getContractFactory('DeepChainVerifier');
    verifier = await Verifier.deploy(validator.address);
    await verifier.deployed();

    // Deploy Reputation System
    const Reputation = await ethers.getContractFactory('DeepChainReputation');
    reputation = await Reputation.deploy(token.address);
    await reputation.deployed();
  });

  describe('DeepChainVerifier', () => {
    const testHash = utils.keccak256(utils.toUtf8Bytes('test-model'));
    let signature;

    before(async () => {
      // Generate validator signature
      const messageHash = utils.keccak256(utils.toUtf8Bytes(testHash));
      signature = await validator.signMessage(utils.arrayify(messageHash));
    });

    it('Should verify model with valid signature', async () => {
      await verifier.connect(user1).verifyModel(testHash, signature);
      expect(await verifier.verifiedModels(testHash)).to.be.true;
    });

    it('Should emit ModelVerified event', async () => {
      await expect(verifier.connect(user1).verifyModel(testHash, signature))
        .to.emit(verifier, 'ModelVerified')
        .withArgs(testHash, user1.address);
    });

    it('Should reject invalid signatures', async () => {
      const badSignature = await user1.signMessage(utils.arrayify(testHash));
      await expect(verifier.connect(user1).verifyModel(testHash, badSignature))
        .to.be.revertedWith('Invalid validator signature');
    });

    it('Should prevent double verification', async () => {
      await expect(verifier.connect(user1).verifyModel(testHash, signature))
        .to.be.revertedWith('Model already verified');
    });
  });

  describe('DeepChainReputation', () => {
    const stakeAmount = utils.parseEther('1000');

    before(async () => {
      // Transfer tokens to user1
      await token.connect(validator).transfer(user1.address, stakeAmount);
      await token.connect(user1).approve(reputation.address, stakeAmount);
    });

    it('Should calculate reputation correctly', async () => {
      const expectedReputation = Math.sqrt(Number(stakeAmount));
      
      await reputation.connect(user1).stakeForReputation(stakeAmount);
      
      expect(await reputation.reputationScore(user1.address))
        .to.equal(expectedReputation);
    });

    it('Should handle multiple stakes', async () => {
      const additionalStake = utils.parseEther('2500');
      await token.connect(validator).transfer(user1.address, additionalStake);
      await token.connect(user1).approve(reputation.address, additionalStake);

      await reputation.connect(user1).stakeForReputation(additionalStake);
      
      const totalStaked = Number(stakeAmount) + Number(additionalStake);
      const expectedRep = Math.sqrt(totalStaked);
      
      expect(await reputation.reputationScore(user1.address))
        .to.equal(expectedRep);
    });

    it('Should emit ReputationUpdated event', async () => {
      await token.connect(validator).transfer(user2.address, stakeAmount);
      await token.connect(user2).approve(reputation.address, stakeAmount);
      
      await expect(reputation.connect(user2).stakeForReputation(stakeAmount))
        .to.emit(reputation, 'ReputationUpdated')
        .withArgs(user2.address, Math.sqrt(Number(stakeAmount)));
    });

    it('Should reject invalid token transfers', async () => {
      await expect(reputation.connect(user1).stakeForReputation(0))
        .to.be.revertedWith('Token transfer failed');
    });

    it('Should prevent unauthorized token registry changes', async () => {
      await expect(reputation.connect(user1).setTokenRegistry(ethers.constants.AddressZero))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Integration Tests', () => {
    it('Should combine verification and reputation', async () => {
      // 1. Verify a model
      const modelHash = utils.keccak256(utils.toUtf8Bytes('integration-model'));
      const signature = await validator.signMessage(utils.arrayify(modelHash));
      await verifier.connect(user1).verifyModel(modelHash, signature);

      // 2. Stake for reputation
      const stakeAmount = utils.parseEther('10000');
      await token.connect(validator).transfer(user1.address, stakeAmount);
      await token.connect(user1).approve(reputation.address, stakeAmount);
      await reputation.connect(user1).stakeForReputation(stakeAmount);

      // Verify combined state
      expect(await verifier.verifiedModels(modelHash)).to.be.true;
      expect(await reputation.reputationScore(user1.address))
        .to.equal(Math.sqrt(Number(stakeAmount)));
    });
  });
});