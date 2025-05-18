import { ethers, network } from "hardhat";
import { deployments } from "hardhat";

// --- Configuration ---
// Define the items you want to mint.
// Ensure these item IDs correspond to item types already created via createItemType.
const itemsToMint = [
  { id: 1, amount: 10, recipient: "" }, // recipient can be empty to default to deployer
  { id: 2, amount: 5, recipient: "" },
  // Add more items as needed, e.g.:
  // { id: 3, amount: 20, recipient: "0xYourOtherAddress" },
];
// ---------------------

async function main() {
  const { get } = deployments;
  const { deployer } = await ethers.getNamedSigners();
  const deployerAddress = await deployer.getAddress();

  console.log(`Batch minting items on network: ${network.name}`);
  console.log(`Signer (deployer) address: ${deployerAddress}\n`);

  const gameItemDeployment = await get("GameItem");
  const gameItem = await ethers.getContractAt("GameItem", gameItemDeployment.address, deployer);

  console.log(`Connected to GameItem at: ${await gameItem.getAddress()}`);

  for (const item of itemsToMint) {
    const recipientAddress = item.recipient || deployerAddress;
    const itemIdAsBigInt = BigInt(item.id);
    const itemAmountAsBigInt = BigInt(item.amount);

    console.log(
      `Minting item ID: ${itemIdAsBigInt}, Amount: ${itemAmountAsBigInt} to Recipient: ${recipientAddress} (using mintItem)`,
    );
    try {
      const tx = await gameItem.mintItem(recipientAddress, itemIdAsBigInt, itemAmountAsBigInt, "0x");
      await tx.wait();
      console.log(
        `  Successfully minted ${itemAmountAsBigInt} of item ID ${itemIdAsBigInt} to ${recipientAddress}. Tx: ${tx.hash}`,
      );
    } catch (error) {
      console.error(`  Failed to mint item ID ${itemIdAsBigInt}:`, error);
    }
  }

  console.log("\nBatch minting process complete.");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
