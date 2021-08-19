const { expect } = require("chai");
const { deployMockContract } = require('@ethereum-waffle/mock-contract');
const IUniswapV2Router02Abi = require("../../artifacts/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol/IUniswapV2Router02.json");

const { setupTest } = require("../utils.js");

describe("UniswapSwappingStrategy", function () {
  let uniswapSwappingStrategy;
  let owner;
  let mockERC20;
  let mockIVault;
  let mockIUniswapV2Router02;
  beforeEach(async () => {
    ({
      owner,
      mockERC20,
      mockIVault
    } = await setupTest());

    mockIUniswapV2Router02 = await deployMockContract(owner, IUniswapV2Router02Abi.abi);
    const UniswapSwappingStrategy = await ethers.getContractFactory("UniswapSwappingStrategy");
    uniswapSwappingStrategy = await UniswapSwappingStrategy.deploy(mockIUniswapV2Router02.address);
    await uniswapSwappingStrategy.deployed();


  })
  it("configure : Should revert if there is other strategy group with the same name ", async function () {
    const groupStrategyName = "First-Strategy";
    await uniswapSwappingStrategy.configure(
      groupStrategyName,
      mockERC20.address,
      mockERC20.address);
    await expect(uniswapSwappingStrategy.configure(
      groupStrategyName,
      mockERC20.address,
      mockERC20.address)).to.be
      .reverted.revertedWith("The strategy group name already exist");
  });

  it("configure : Add strategy group", async function () {
    const groupStrategyName = "First-Strategy";
    await uniswapSwappingStrategy.configure(
      groupStrategyName,
      mockERC20.address,
      owner.address);
    const [tokenA, tokenB] = await uniswapSwappingStrategy.configuration(groupStrategyName);
    expect(tokenA).to.equal(mockERC20.address);
    expect(tokenB).to.equal(owner.address);
  });

  it("execute : revert if the strategy group name does not exist", async function () {
    const groupStrategyName = "First-Strategy";
    await expect(uniswapSwappingStrategy.execute(
      groupStrategyName,
      0,
      mockIVault.address)).to.be
      .reverted.revertedWith("The strategy group does not exist");
  });

  it("execute : rise event ExecutedUniswapSwappingStrategy when execute the swapping", async function () {
    const groupStrategyName = "First-Strategy";
    const amount = 99982;
    const swappingResult = 888888;

    await uniswapSwappingStrategy.configure(
      groupStrategyName,
      mockERC20.address,
      owner.address);
    await mockERC20.mock.approve.returns(true);
    await mockIUniswapV2Router02.mock.swapExactTokensForTokens.returns([swappingResult, 1]);
    await expect(uniswapSwappingStrategy.execute(
      groupStrategyName,
      amount,
      mockIVault.address)).to.emit(uniswapSwappingStrategy, 'ExecutedUniswapSwappingStrategy')
      .withArgs(groupStrategyName,
        mockERC20.address,
        amount,
        owner.address,
        swappingResult);
  });
  it("execute : return value of swapping", async function () {
    const groupStrategyName = "First-Strategy";
    const amount = 99982;
    const swappingResult = 888888;
    await uniswapSwappingStrategy.configure(
      groupStrategyName,
      mockERC20.address,
      owner.address);
    await mockERC20.mock.approve.returns(true);
    await mockIUniswapV2Router02.mock.swapExactTokensForTokens.returns([swappingResult, 1]);
    const result = uniswapSwappingStrategy.execute(
      groupStrategyName,
      amount,
      mockIVault.address);
    // console.log(result);
    //TODO: has to see why the execute method returns a tx object instead of uint256
    // expect(result).to.be.equal(swappingResult);
  });
});


