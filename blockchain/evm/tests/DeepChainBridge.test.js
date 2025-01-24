// test/contracts/DeepChainBridge.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('DeepChainBridge', () => {
  let bridge;
  let owner, oracle, user;
  let token;

  beforeEach(async () => {
    [owner, oracle, user] = await ethers.getSigners();

    // Deploy test ERC20 token
    const Token = await ethers.getContractFactory('ERC20Mock');
    token = await Token.deploy('Test Token', 'TKN', owner.address, ethers.utils.parseEther('1000'));
    await token.deployed();

    // Deploy bridge contract
    const Bridge = await ethers.getContractFactory('DeepChainBridge');
    bridge = await Bridge.deploy(oracle.address);
    await bridge.deployed();

    // Register test token
    await bridge.connect(owner).setTokenRegistry(
      token.address,
      ethers.utils.formatBytes32String('TKN')
    );
  });

  describe('Configuration', () => {
    it('Should initialize with correct parameters', async () => {
      expect(await bridge.oracle()).to.equal(oracle.address);
      expect(await bridge.getCrossChainId(token.address))
        .to.equal(ethers.utils.formatBytes32String('TKN'));
    });

    it('Should update cross-chain fee', async () => {
      await bridge.connect(owner).setCrossChainFee(100);
      expect(await bridge.crossChainFee()).to.equal(100);
    });

    it('Should prevent non-owners from updating fee', async () => {
      await expect(bridge.connect(user).setCrossChainFee(100))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('ETH Deposits', () => {
    const depositAmount = ethers.utils.parseEther('1');

    it('Should handle ETH deposits correctly', async () => {
      const tx = await bridge.connect(user).depositTokens(
        ethers.constants.AddressZero,
        depositAmount,
        ethers.utils.formatBytes32String(user.address),
        { value: depositAmount }
      );

      await expect(tx).to.emit(bridge, 'TokensDeposited')
        .withArgs(user.address, ethers.constants.AddressZero, depositAmount.mul(9950).div(10000), ethers.utils.formatBytes32String(user.address));
    });

    it('Should reject ETH deposits below minimum', async () => {
      await expect(bridge.connect(user).depositTokens(
        ethers.constants.AddressZero,
        ethers.utils.parseEther('0.005'),
        ethers.utils.formatBytes32String(user.address),
        { value: ethers.utils.parseEther('0.005') }
      )).to.be.revertedWithCustomError(bridge, 'InvalidAmount');
    });
  });

  describe('ERC20 Deposits', () => {
    const depositAmount = ethers.utils.parseEther('10');

    beforeEach(async () => {
      await token.connect(owner).transfer(user.address, depositAmount);
      await token.connect(user).approve(bridge.address, depositAmount);
    });

    it('Should handle ERC20 deposits correctly', async () => {
      await expect(bridge.connect(user).depositTokens(
        token.address,
        depositAmount,
        ethers.utils.formatBytes32String(user.address)
      )).to.emit(bridge, 'TokensDeposited')
        .withArgs(user.address, token.address, depositAmount.mul(9950).div(10000), ethers.utils.formatBytes32String(user.address));
    });

    it('Should reject unregistered tokens', async () => {
      const unregisteredToken = await (await ethers.getContractFactory('ERC20Mock'))
        .deploy('Bad Token', 'BAD', owner.address, 1000);
      
      await expect(bridge.connect(user).depositTokens(
        unregisteredToken.address,
        1000,
        ethers.utils.formatBytes32String(user.address)
      )).to.be.revertedWithCustomError(bridge, 'UnregisteredToken');
    });
  });

  describe('Token Claims', () => {
    const claimAmount = ethers.utils.parseEther('5');

    it('Should allow oracle to claim ETH', async () => {
      const userBalanceBefore = await ethers.provider.getBalance(user.address);
      
      await bridge.connect(oracle).claimTokens(
        '0x', // Dummy proof
        ethers.constants.AddressZero,
        user.address,
        claimAmount,
        { value: claimAmount }
      );

      const userBalanceAfter = await ethers.provider.getBalance(user.address);
      expect(userBalanceAfter.sub(userBalanceBefore)).to.equal(claimAmount);
    });

    it('Should allow oracle to claim ERC20', async () => {
      await token.connect(owner).transfer(bridge.address, claimAmount);
      
      await bridge.connect(oracle).claimTokens(
        '0x', // Dummy proof
        token.address,
        user.address,
        claimAmount
      );

      expect(await token.balanceOf(user.address)).to.equal(claimAmount);
    });

    it('Should prevent non-oracle claims', async () => {
      await expect(bridge.connect(user).claimTokens(
        '0x',
        token.address,
        user.address,
        claimAmount
      )).to.be.revertedWithCustomError(bridge, 'UnauthorizedOracle');
    });
  });

  describe('Security', () => {
    it('Should reject direct ETH transfers', async () => {
      await expect(user.sendTransaction({
        to: bridge.address,
        value: ethers.utils.parseEther('1')
      })).to.be.revertedWith('Use depositTokens for ETH bridging');
    });

    it('Should validate constructor parameters', async () => {
      await expect(ethers.getContractFactory('DeepChainBridge')
        .then(f => f.deploy(ethers.constants.AddressZero))
      ).to.be.revertedWithCustomError(bridge, 'InvalidAddress');
    });
  });
});