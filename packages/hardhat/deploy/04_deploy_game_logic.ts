import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const ADMIN_ADDRESS = "0xBe1bC6a126Ae4176Af8a1d0Fa77bf59Ba476B48A";

/**
 * Deploys the GameLogic contract and configures it.
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployGameLogic: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // Owner for GameLogic will always be ADMIN_ADDRESS
  // The deployer account executes the deployment, but GameLogic is owned by ADMIN_ADDRESS.
  const ownerForGameLogic = ADMIN_ADDRESS;
  console.log(`\nDeploying GameLogic with owner: ${ownerForGameLogic} (Network: ${hre.network.name})...`);

  await deploy("GameLogic", {
    from: deployer,
    args: [ownerForGameLogic],
    log: true,
    autoMine: true,
  });

  const gameLogic = await hre.ethers.getContract<Contract>("GameLogic", deployer);
  const gameCharacterDeployment = await get("GameCharacter");
  const gameItemDeployment = await get("GameItem");

  // Configuration calls (setGameCharacterContract, setGameItemContract) must be done by GameLogic's new owner.
  // This requires ADMIN_ADDRESS to be able to sign, or these calls moved to a separate script run by ADMIN_ADDRESS.
  // For simplicity here, we log what needs to be done if deployer is not ADMIN_ADDRESS.
  // If ADMIN_ADDRESS is the deployer, these will succeed.

  if (deployer.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
    console.log("Deployer is ADMIN_ADDRESS, proceeding with GameLogic configuration...");

    console.log(`\nSetting GameCharacter contract address (${gameCharacterDeployment.address}) in GameLogic...`);
    await gameLogic.setGameCharacterContract(gameCharacterDeployment.address);
    console.log("GameCharacter contract address set in GameLogic.");

    console.log(`\nSetting GameItem contract address (${gameItemDeployment.address}) in GameLogic...`);
    await gameLogic.setGameItemContract(gameItemDeployment.address);
    console.log("GameItem contract address set in GameLogic.");
  } else {
    console.warn(`\nACTION REQUIRED: GameLogic owner is ${ADMIN_ADDRESS}, but deployer is ${deployer}.`);
    console.warn(`  The following configurations for GameLogic must be done by ${ADMIN_ADDRESS}:`);
    console.warn(`  - Call setGameCharacterContract with ${gameCharacterDeployment.address}`);
    console.warn(`  - Call setGameItemContract with ${gameItemDeployment.address}`);
  }

  // Authorize GameLogic as a minter on GameCharacter & GameItem
  // This also needs to be done by the respective owners of GameCharacter & GameItem (which should now be ADMIN_ADDRESS)
  // Similar to above, if deployer is not ADMIN_ADDRESS, these calls will fail and must be done by ADMIN_ADDRESS.

  if (deployer.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
    console.log("Deployer is ADMIN_ADDRESS, proceeding with minter authorization...");
    const gameCharacter = await hre.ethers.getContractAt(
      "GameCharacter",
      gameCharacterDeployment.address,
      await hre.ethers.getSigner(deployer),
    );
    console.log(`\nAuthorizing GameLogic contract (${await gameLogic.getAddress()}) as a minter on GameCharacter...`);
    const txCharMinter = await gameCharacter.setMinter(await gameLogic.getAddress());
    await txCharMinter.wait();
    console.log("GameLogic contract authorized as a minter on GameCharacter.");

    const gameItem = await hre.ethers.getContractAt(
      "GameItem",
      gameItemDeployment.address,
      await hre.ethers.getSigner(deployer),
    );
    console.log(`\nAuthorizing GameLogic contract (${await gameLogic.getAddress()}) as a minter on GameItem...`);
    const txItemMinter = await gameItem.setMinter(await gameLogic.getAddress());
    await txItemMinter.wait();
    console.log("GameLogic contract authorized as a minter on GameItem.");
  } else {
    console.warn(`\nACTION REQUIRED: GameCharacter & GameItem owner is ${ADMIN_ADDRESS}, but deployer is ${deployer}.`);
    console.warn(`  The following minter authorizations must be done by ${ADMIN_ADDRESS}:`);
    const gameLogicAddress = (await get("GameLogic")).address; // Get deployed GameLogic address
    console.warn(`  - On GameCharacter (${gameCharacterDeployment.address}), call setMinter(${gameLogicAddress})`);
    console.warn(`  - On GameItem (${gameItemDeployment.address}), call setMinter(${gameLogicAddress})`);
  }

  console.log("\nGameLogic deployment script phase complete.");
};

export default deployGameLogic;

deployGameLogic.tags = ["GameLogic"];
// Ensure GameCharacter is deployed before GameLogic
deployGameLogic.dependencies = ["GameCharacter", "GameItem"];
