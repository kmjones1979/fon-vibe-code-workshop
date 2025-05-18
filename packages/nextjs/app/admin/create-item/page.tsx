"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address, EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

// Not for item supply, but good to have for EtherInput related things

const CreateItemPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [itemName, setItemName] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [initialSupply, setInitialSupply] = useState<string>("0");

  const { writeContractAsync: createItemType, isPending } = useScaffoldWriteContract({
    contractName: "GameItem",
    // functionName: "createItemType", // Will be set in the call
  });

  const handleCreateItem = async () => {
    if (!connectedAddress) {
      alert("Please connect your wallet.");
      return;
    }
    if (!itemName || !itemDescription) {
      alert("Please fill in item name and description.");
      return;
    }
    const supply = BigInt(initialSupply);
    if (supply < 0n) {
      // Though type=number input usually prevents negative, good to check
      alert("Initial supply cannot be negative.");
      return;
    }

    try {
      await createItemType({
        functionName: "createItemType",
        args: [itemName, itemDescription, supply, connectedAddress], // Mint initial supply to self (owner/admin)
      });
      alert("Item type created successfully!");
      setItemName("");
      setItemDescription("");
      setInitialSupply("0");
    } catch (error) {
      console.error("Error creating item type:", error);
      alert("Error creating item type. See console.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(spacing.24))] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-secondary/70 via-base-300 to-accent/70">
      <div className="w-full max-w-xl mx-auto bg-base-100/95 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent mb-4">
            Create New Game Item Type
          </h1>
          <p className="text-base-content/70">Define a new item that can be minted in the game.</p>
        </div>

        {connectedAddress ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleCreateItem();
            }}
            className="space-y-5"
          >
            <div className="mb-4 p-3 border border-base-300 rounded-lg bg-base-200/30 shadow-inner">
              <p className="font-medium text-center text-xs text-base-content/70 mb-1">ADMIN ACTION AS:</p>
              <Address address={connectedAddress} size="sm" />
            </div>

            <div>
              <label htmlFor="itemName" className="block text-sm font-semibold mb-1.5 text-base-content/90">
                Item Name:
              </label>
              <input
                type="text"
                id="itemName"
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                className="input input-bordered input-secondary w-full focus:ring-2 focus:ring-secondary/50 shadow-sm"
                placeholder="Health Potion"
                required
              />
            </div>

            <div>
              <label htmlFor="itemDescription" className="block text-sm font-semibold mb-1.5 text-base-content/90">
                Item Description:
              </label>
              <textarea
                id="itemDescription"
                value={itemDescription}
                onChange={e => setItemDescription(e.target.value)}
                className="textarea textarea-bordered textarea-secondary w-full focus:ring-2 focus:ring-secondary/50 shadow-sm"
                placeholder="Restores 50 health points."
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="initialSupply" className="block text-sm font-semibold mb-1.5 text-base-content/90">
                Initial Supply (minted to you):
              </label>
              <input
                type="number"
                id="initialSupply"
                value={initialSupply}
                onChange={e => setInitialSupply(e.target.value)}
                className="input input-bordered input-secondary w-full focus:ring-2 focus:ring-secondary/50 shadow-sm"
                placeholder="e.g., 100"
                min="0"
              />
            </div>

            <button
              type="submit"
              className="btn btn-accent btn-md w-full mt-6 !text-base-100 font-semibold tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 transition-all duration-150 ease-in-out"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>Creating Item...
                </>
              ) : (
                "Create Item Type"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg font-semibold text-warning mb-3">Wallet Not Connected</p>
            <p className="text-base-content/70">Please connect your wallet (must be contract owner/admin).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateItemPage;
