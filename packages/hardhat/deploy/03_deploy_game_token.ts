import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "ethers"; // Correctly import ethers

const ADMIN_ADDRESS = "0xBe1bC6a126Ae4176Af8a1d0Fa77bf59Ba476B48A";

/**
 * Deploys the GameToken contract.
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployGameToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Define the initial supply for the token.
  // ERC20 tokens typically have 18 decimal places.
  // So, for 1,000,000 tokens, initialSupply should be 1,000,000 * 10^18.
  const initialSupply = ethers.parseUnits("1000000", 18); // 1 million tokens with 18 decimals

  const deployment = await deploy("GameToken", {
    from: deployer,
    args: [initialSupply], // Constructor argument: initialSupply
    log: true,
    autoMine: true, // Speeds up deployment on local networks
  });

  // Transfer ownership if ADMIN_ADDRESS is different from deployer
  if (deployer.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
    console.log(
      `\nAttempting to transfer ownership of GameToken to: ${ADMIN_ADDRESS}... (Network: ${hre.network.name})`,
    );
    const gameToken = await hre.ethers.getContractAt(
      "GameToken",
      deployment.address,
      await hre.ethers.getSigner(deployer),
    );
    try {
      const tx = await gameToken.transferOwnership(ADMIN_ADDRESS);
      await tx.wait();
      console.log(`GameToken ownership transferred to ${ADMIN_ADDRESS}`);
    } catch (e) {
      console.error(`Failed to transfer ownership of GameToken: `, e);
    }
  } else {
    console.log(`\nGameToken deployer is already the admin: ${ADMIN_ADDRESS}. No ownership transfer needed.`);
  }

  // Get the deployed contract to interact with it after deployment (optional)
  // const gameToken = await hre.ethers.getContract("GameToken", deployer);
  // console.log("💰 GameToken deployed to:", await gameToken.getAddress());
  // console.log(`Supply: ${ethers.formatUnits(await gameToken.totalSupply(), 18)} tokens`);
};

export default deployGameToken;

// Tags are useful for running specific deployment scripts selectively
deployGameToken.tags = ["GameToken"];
