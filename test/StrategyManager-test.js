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
  let mockERC20;
  beforeEach(async () => {
    ({
      mockIStrategy,
      mockIHarvestStrategy,
      mockIStrategy1,
      mockIVault,
      owner,
      addr1,
      addr2,
      mockCollector,
      mockERC20
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
    await strategyManager.registerHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    const collectorName = "GET-ALL-FEE";
    await mockCollector.mock.isCollector.returns(true);

    await strategyManager.registerCollector(
      collectorName,
      mockCollector.address);
    await expect(strategyManager.createStrategyGroup(
      "First Strategy",
      [mockIStrategy.address, mockIStrategy1.address],
      harvestStrategy,
      collectorName)).to.be
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
    await strategyManager.registerHarvestStrategy(
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
    const collectorName = "GET-ALL-FEE";
    await mockCollector.mock.isCollector.returns(true);

    await strategyManager.registerCollector(
      collectorName,
      mockCollector.address);
    await strategyManager.registerFarmStrategy(
      farmStrategy,
      mockIStrategy.address);
    await strategyManager.registerHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);

    await strategyManager.createStrategyGroup(
      strategyGroupName,
      [farmStrategy],
      harvestStrategy,
      collectorName);
    await expect(strategyManager.createStrategyGroup(
      strategyGroupName,
      [farmStrategy],
      harvestStrategy,
      collectorName)).to.be
      .reverted.revertedWith("Already exist a strategy with that name");
  });
  it("createStrategyGroup : Should create a StrategyGroup", async function () {
    const strategyGroupName = "First Strategy";
    const farmStrategy = "Curve liquid";
    const harvestStrategy = "GET-ALL-FEE";

    await mockIStrategy.mock.isStrategy.returns(true);
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);
    await mockCollector.mock.isCollector.returns(true);
    const collectorName = "GET-ALL-FEE";
    await mockCollector.mock.isCollector.returns(true);

    await strategyManager.registerCollector(
      collectorName,
      mockCollector.address);
    await strategyManager.registerHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    await strategyManager.registerFarmStrategy(
      farmStrategy,
      mockIStrategy.address);
    await strategyManager.createStrategyGroup(
      "First Strategy",
      [farmStrategy],
      harvestStrategy,
      collectorName);
    const [, , , exist] = await strategyManager.strategiesGroup(strategyGroupName);
    expect(exist).to.equal(true);
  });

  it("registerFarmStrategy : revert if the address is not a IStrategy", async function () {
    await mockIStrategy.mock.isStrategy.returns(false);
    await expect(strategyManager.registerFarmStrategy(
      "Curve liquid",
      mockIStrategy.address)).to.be
      .reverted.revertedWith("The address is not a IStrategy");
  });

  it("registerFarmStrategy : Should add reference to farmStrategy", async function () {
    const farmStrategy = "Curve liquid";
    await mockIStrategy.mock.isStrategy.returns(true);
    await strategyManager.registerFarmStrategy(
      "Curve liquid",
      mockIStrategy.address);
    const strategy = await strategyManager.farmStrategies(farmStrategy);
    expect(strategy).to.equal(mockIStrategy.address);
  });

  it("registerFarmStrategy : Should add reference to farmStrategy", async function () {
    const farmStrategy = "Curve liquid";
    await mockIStrategy.mock.isStrategy.returns(true);
    await strategyManager.registerFarmStrategy(
      farmStrategy,
      mockIStrategy.address);
    await expect(strategyManager.registerFarmStrategy(
      farmStrategy,
      mockIStrategy.address)).to.be
      .reverted.revertedWith("Already exist a farm strategy with that name");
  });

  it("registerHarvestStrategy : revert if the address is not a IHarvestStrategy", async function () {
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(false);
    await expect(strategyManager.registerHarvestStrategy(
      "GET-ALL-FEE",
      mockIHarvestStrategy.address)).to.be
      .reverted.revertedWith("The address is not a IHarvestStrategy");
  });

  it("registerHarvestStrategy : Should add reference to farmStrategy", async function () {
    const harvestStrategy = "GET-ALL-FEE";
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);
    await strategyManager.registerHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    const strategy = await strategyManager.harvestStrategies(harvestStrategy);
    expect(strategy).to.equal(mockIHarvestStrategy.address);
  });

  it("registerHarvestStrategy : should revert if exist other harvest strategy with the same name", async function () {
    const harvestStrategy = "GET-ALL-FEE";
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);

    await strategyManager.registerHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    await expect(strategyManager.registerHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address)).to.be
      .reverted.revertedWith("Already exist a Harvest strategy with that name");
  });


  it("registerCollector : revert if the address is not a ICollector", async function () {
    await mockCollector.mock.isCollector.returns(false);

    await expect(strategyManager.registerCollector(
      "GET-ALL-FEE",
      mockCollector.address)).to.be
      .reverted.revertedWith("The address is not a ICollector");
  });

  it("registerCollector : Should add reference to collector", async function () {
    const collectorName = "GET-ALL-FEE";
    await mockCollector.mock.isCollector.returns(true);
    await strategyManager.registerCollector(
      collectorName,
      mockCollector.address);
    const collector = await strategyManager.collectors(collectorName);
    expect(collector).to.equal(mockCollector.address);
  });

  it("registerCollector : should revert if exist other collector with the same name", async function () {
    const collectorName = "GET-ALL-FEE";
    await mockCollector.mock.isCollector.returns(true);

    await strategyManager.registerCollector(
      collectorName,
      mockCollector.address);
    await expect(strategyManager.registerCollector(
      collectorName,
      mockCollector.address)).to.be
      .reverted.revertedWith("Already exist a Collector with that name");
  });

  it("execute : Should revet if the strategy name does not exist", async function () {
    await expect(strategyManager.execute("Strategy group name",
      mockERC20.address,
      200)).to.be
      .reverted.revertedWith("There is not a strategy group with that name");
  });
  it("execute : Should revet if the strategy is not approve to execute transferFrom", async function () {
    const strategyGroupName = "First Strategy";
    const farmStrategy = "Curve liquid";
    const harvestStrategy = "GET-ALL-FEE";
    const collectorName = "GET-ALL-FEE";

    await mockIStrategy.mock.isStrategy.returns(true);
    await mockIStrategy.mock.execute.returns(9000);
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);
    await mockCollector.mock.isCollector.returns(true);

    await mockERC20.mock.transferFrom.returns(false);
    await strategyManager.registerCollector(
      collectorName,
      mockCollector.address);
    await strategyManager.registerHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    await strategyManager.registerFarmStrategy(
      farmStrategy,
      mockIStrategy.address);

    await strategyManager.createStrategyGroup(
      strategyGroupName,
      [farmStrategy],
      harvestStrategy,
      collectorName);
    const [, , vault,] = await strategyManager.strategiesGroup(strategyGroupName);

    await expect(strategyManager.execute(strategyGroupName,
      mockERC20.address,
      200)).to.be
      .reverted.revertedWith("SafeERC20: ERC20 operation did not succeed");
  });
  it("execute : Should rise event", async function () {
    const strategyGroupName = "First Strategy";
    const farmStrategy = "Curve liquid";
    const harvestStrategy = "GET-ALL-FEE";
    const collectorName = "GET-ALL-FEE";

    await mockIStrategy.mock.isStrategy.returns(true);
    await mockIStrategy.mock.execute.returns(9000);
    await mockIHarvestStrategy.mock.isHarvestStrategy.returns(true);
    await mockCollector.mock.isCollector.returns(true);

    await mockERC20.mock.transferFrom.returns(true);
    await strategyManager.registerCollector(
      collectorName,
      mockCollector.address);
    await strategyManager.registerHarvestStrategy(
      harvestStrategy,
      mockIHarvestStrategy.address);
    await strategyManager.registerFarmStrategy(
      farmStrategy,
      mockIStrategy.address);


    await strategyManager.createStrategyGroup(
      strategyGroupName,
      [farmStrategy],
      harvestStrategy,
      collectorName);
    const [, , vault,] = await strategyManager.strategiesGroup(strategyGroupName);


    await expect(strategyManager.execute(strategyGroupName,
      mockERC20.address,
      200)).to.emit(strategyManager, 'ExecuteStrategy')
      .withArgs(strategyGroupName, 200, vault);
  });

});


