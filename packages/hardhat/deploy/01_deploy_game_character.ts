import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const ADMIN_ADDRESS = "0xBe1bC6a126Ae4176Af8a1d0Fa77bf59Ba476B48A";

const deployGameCharacter: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployment = await deploy("GameCharacter", {
    from: deployer,
    args: ["https://yourgame.com/images/characters/"],
    log: true,
    autoMine: true,
  });

  // Transfer ownership if ADMIN_ADDRESS is different from deployer
  if (deployer.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
    console.log(
      `\nAttempting to transfer ownership of GameCharacter to: ${ADMIN_ADDRESS}... (Network: ${hre.network.name})`,
    );
    const gameCharacter = await hre.ethers.getContractAt(
      "GameCharacter",
      deployment.address,
      await hre.ethers.getSigner(deployer),
    );
    try {
      const tx = await gameCharacter.transferOwnership(ADMIN_ADDRESS);
      await tx.wait();
      console.log(`GameCharacter ownership transferred to ${ADMIN_ADDRESS}`);
    } catch (e) {
      console.error(`Failed to transfer ownership of GameCharacter: `, e);
    }
  } else {
    console.log(`\nGameCharacter deployer is already the admin: ${ADMIN_ADDRESS}. No ownership transfer needed.`);
  }
};

export default deployGameCharacter;

deployGameCharacter.tags = ["GameCharacter"];
