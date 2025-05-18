import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const ADMIN_ADDRESS = "0xBe1bC6a126Ae4176Af8a1d0Fa77bf59Ba476B48A";

/**
 * Deploys the GameItem contract.
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployGameItem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployment = await deploy("GameItem", {
    from: deployer,
    // args: ["YOUR_GAME_ITEM_BASE_URI_HERE/"], // Constructor argument: baseURI for item metadata
    // Example: "https://api.yourgame.com/items/" (ensure it ends with a / if your contract expects to append {id}.json)
    // The ERC1155 standard suggests the URI should be such that appending the token ID (hex-padded) results in the metadata URL.
    // So, if your metadata for token 1 is at "https://api.yourgame.com/items/0000000000000000000000000000000000000000000000000000000000000001.json",
    // then the baseURI should be "https://api.yourgame.com/items/".
    // Our GameItem.sol currently has a commented out `uri` function that would append {id} if not overridden,
    // but the default ERC1155 behavior is to substitute {id} in the base URI string.
    // Let's assume for now the metadata server handles the URI like: "baseURI{id}.json" or similar that OpenZeppelin supports.
    // We will use a placeholder that expects the {id} substitution.
    args: ["https://api.yourgame.com/items/{id}.json"], // Placeholder baseURI, {id} will be replaced by token ID in hex.
    log: true,
    autoMine: true, // Speeds up deployment on local networks
  });

  // Transfer ownership if ADMIN_ADDRESS is different from deployer
  if (deployer.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
    console.log(
      `\nAttempting to transfer ownership of GameItem to: ${ADMIN_ADDRESS}... (Network: ${hre.network.name})`,
    );
    const gameItem = await hre.ethers.getContractAt(
      "GameItem",
      deployment.address,
      await hre.ethers.getSigner(deployer),
    );
    try {
      const tx = await gameItem.transferOwnership(ADMIN_ADDRESS);
      await tx.wait();
      console.log(`GameItem ownership transferred to ${ADMIN_ADDRESS}`);
    } catch (e) {
      console.error(`Failed to transfer ownership of GameItem: `, e);
    }
  } else {
    console.log(`\nGameItem deployer is already the admin: ${ADMIN_ADDRESS}. No ownership transfer needed.`);
  }

  // Get the deployed contract to interact with it after deployment (optional)
  // const gameItem = await hre.ethers.getContract<Contract>("GameItem", deployer);
  // console.log("👋 GameItem deployed to:", await gameItem.getAddress());
  // Example: Create an item type after deployment (if needed for setup)
  // console.log("Creating a sample item type...");
  // const tx = await gameItem.createItemType("Health Potion", "Restores 50 HP", 10, deployer);
  // await tx.wait();
  // console.log("Sample item type created!");
};

export default deployGameItem;

// Tags are useful for running specific deployment scripts selectively
deployGameItem.tags = ["GameItem"];
