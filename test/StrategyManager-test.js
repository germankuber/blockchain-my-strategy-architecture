const { expect } = require("chai");
const { deployMockContract } = require('@ethereum-waffle/mock-contract');
const { setupTest } = require("./utils.js");

describe("StrategyManager", function () {
  let strategyManager;
  let owner;
  let addr1;
  let addr2;
  let mockIStrategy;
  let mockIStrategy1;
  let mockIVault;
  let mockIHarvestStrategy;
  let mockCollector;
  beforeEach(async () => {
    ({
      mockIStrategy,
      mockIHarvestStrategy,
      mockIStrategy1,
      mockIVault,
      owner,
      addr1,
      addr2,
      mockCollector
    } = await setupTest());

    const StrategyManager = await ethers.getContractFactory("StrategyManager");
    strategyManager = await StrategyManager.deploy();
    await strategyManager.deployed();
  })
  it("createStrategyGroup : Should revert if a farm address is not a strategy", async function () {
    await mockIStrategy.mock.isStrategy.returns(true);
    await mockIStrategy1.mock.isStrategy.returns(false);
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);
    await mockCollector.mock.isCollector.returns(true);
    const harvestStrategy = "GET-ALL-FEE";
    await strategyManager.addHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    await expect(strategyManager.createStrategyGroup(
      "First Strategy",
      [mockIStrategy.address, mockIStrategy1.address],
      harvestStrategy,
      mockCollector.address)).to.be
      .reverted.revertedWith("There is address that is not a IStrategy");
  });

  it("createStrategyGroup : Should revert if a harvest address is not a IHarvestCollector", async function () {
    await mockIStrategy.mock.isStrategy.returns(true);
    const harvestStrategy = "GET-ALL-FEE";


    await expect(strategyManager.createStrategyGroup(
      "First Strategy",
      [mockIStrategy.address],
      harvestStrategy,
      owner.address)).to.be
      .reverted.revertedWith("There is address that is not a IHarvestStrategy");
  });

  it("createStrategyGroup : Should revert if a collector address is not a ICollector", async function () {
    await mockIStrategy.mock.isStrategy.returns(true);
    await mockCollector.mock.isCollector.returns(false);
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);

    const harvestStrategy = "GET-ALL-FEE";
    await strategyManager.addHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    await expect(strategyManager.createStrategyGroup(
      "First Strategy",
      [mockIStrategy.address],
      harvestStrategy,
      mockCollector.address)).to.be
      .reverted.revertedWith("The address of collector is not a ICollector");
  });
  it("createStrategyGroup : revert if we want to create a strategy with the same name", async function () {
    const strategyGroupName = "First Strategy";
    const farmStrategy = "Curve liquid";
    const harvestStrategy = "GET-ALL-FEE";
    await mockIStrategy.mock.isStrategy.returns(true);
    await mockCollector.mock.isCollector.returns(true);
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);

    await strategyManager.addFarmStrategy(
      farmStrategy,
      mockIStrategy.address);
    await strategyManager.addHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);

    await strategyManager.createStrategyGroup(
      strategyGroupName,
      [farmStrategy],
      harvestStrategy,
      mockCollector.address);
    await expect(strategyManager.createStrategyGroup(
      strategyGroupName,
      [farmStrategy],
      harvestStrategy,
      mockCollector.address)).to.be
      .reverted.revertedWith("Already exist a strategy with that name");
  });
  it("createStrategyGroup : Should create a StrategyGroup", async function () {
    const strategyGroupName = "First Strategy";
    const farmStrategy = "Curve liquid";
    const harvestStrategy = "GET-ALL-FEE";

    await mockIStrategy.mock.isStrategy.returns(true);
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);
    await mockCollector.mock.isCollector.returns(true);

    await strategyManager.addHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    await strategyManager.addFarmStrategy(
      farmStrategy,
      mockIStrategy.address);
    await strategyManager.createStrategyGroup(
      "First Strategy",
      [farmStrategy],
      harvestStrategy,
      mockCollector.address);
    const [, , , exist] = await strategyManager.strategiesGroup(strategyGroupName);
    expect(exist).to.equal(true);
  });

  it("addFarmStrategy : revert if the address is not a IStrategy", async function () {
    await mockIStrategy.mock.isStrategy.returns(false);
    await expect(strategyManager.addFarmStrategy(
      "Curve liquid",
      mockIStrategy.address)).to.be
      .reverted.revertedWith("The address is not a IStrategy");
  });

  it("addFarmStrategy : Should add reference to farmStrategy", async function () {
    const farmStrategy = "Curve liquid";
    await mockIStrategy.mock.isStrategy.returns(true);
    await strategyManager.addFarmStrategy(
      "Curve liquid",
      mockIStrategy.address);
    const strategy = await strategyManager.farmStrategies(farmStrategy);
    expect(strategy).to.equal(mockIStrategy.address);
  });

  it("addFarmStrategy : Should add reference to farmStrategy", async function () {
    const farmStrategy = "Curve liquid";
    await mockIStrategy.mock.isStrategy.returns(true);
    await strategyManager.addFarmStrategy(
      farmStrategy,
      mockIStrategy.address);
    await expect(strategyManager.addFarmStrategy(
      farmStrategy,
      mockIStrategy.address)).to.be
      .reverted.revertedWith("Already exist a farm strategy with that name");
  });

  it("addHarvestStrategy : revert if the address is not a IHarvestStrategy", async function () {
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(false);
    await expect(strategyManager.addHarvestStrategy(
      "GET-ALL-FEE",
      mockIHarvestStrategy.address)).to.be
      .reverted.revertedWith("The address is not a IHarvestStrategy");
  });

  it("addHarvestStrategy : Should add reference to farmStrategy", async function () {
    const harvestStrategy = "GET-ALL-FEE";
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);
    await strategyManager.addHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    const strategy = await strategyManager.harvestStrategies(harvestStrategy);
    expect(strategy).to.equal(mockIHarvestStrategy.address);
  });

  it("addHarvestStrategy : should revert if exist other harvest strategy with the same name", async function () {
    const harvestStrategy = "GET-ALL-FEE";
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);

    await strategyManager.addHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    await expect(strategyManager.addHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address)).to.be
      .reverted.revertedWith("Already exist a Harvest strategy with that name");
  });

  // expect(await strategyManager.strategiesGroup(strategyGroupName).check()).to.equal(false);
});


