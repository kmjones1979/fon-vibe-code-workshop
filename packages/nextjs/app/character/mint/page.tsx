"use client";

import { useState } from "react";
import type { NextPage } from "next";
// For a bit of sparkle
import { useAccount } from "wagmi";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { CharacterClass } from "~~/types/game/character";

// Import from shared types

// We'll need to get the CharacterClass enum values. For now, let's define them manually based on the contract.
// Ideally, these would come from TypeChain or a shared types package.
// enum CharacterClass { Warrior, Mage, Rogue, Archer } // Removed local definition

const MintCharacterPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [characterClass, setCharacterClass] = useState<CharacterClass>(CharacterClass.Warrior);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [strength, setStrength] = useState<string>("10");
  const [dexterity, setDexterity] = useState<string>("10");
  const [intelligence, setIntelligence] = useState<string>("10");

  const { writeContractAsync: mintCharacter, isPending: isMinting } = useScaffoldWriteContract({
    contractName: "GameLogic",
  });

  const handleMintCharacter = async () => {
    if (!connectedAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    if (name === "" || description === "" || strength === "" || dexterity === "" || intelligence === "") {
      alert("Please fill in all fields, including name and description.");
      return;
    }
    try {
      await mintCharacter({
        functionName: "playerMintNewCharacter",
        args: [name, description, characterClass, BigInt(strength), BigInt(dexterity), BigInt(intelligence)],
      });
      alert("✨ Character minted successfully! Adventure awaits! ✨");
      // Reset form or redirect user
      setName("");
      setDescription("");
      setStrength("10");
      setDexterity("10");
      setIntelligence("10");
      setCharacterClass(CharacterClass.Warrior);
    } catch (error) {
      console.error("Error minting character:", error);
      alert("Error minting character. See console for details.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(spacing.24))] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/70 via-base-300 to-accent/70">
      <div className="w-full max-w-2xl mx-auto bg-base-100/95 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl space-y-8">
        <div className="text-center">
          <SparklesIcon className="h-12 w-12 text-accent inline-block mb-3" />
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-3">
            Forge Your Hero
          </h1>
          <p className="text-base-content/70 text-lg">Fill in the details to bring your champion to life!</p>
        </div>

        {connectedAddress ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleMintCharacter();
            }}
            className="space-y-7"
          >
            <div className="mb-6 p-4 border border-base-300 rounded-lg bg-base-200/40 shadow-inner">
              <p className="font-medium text-center text-sm text-base-content/70 mb-1">MINTING AS:</p>
              <Address address={connectedAddress} size="lg" />
            </div>

            <div>
              <label htmlFor="name" className="block text-md font-semibold mb-2 text-base-content/90">
                <span role="img" aria-label="name tag">
                  📛
                </span>{" "}
                Name your Hero:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input input-bordered input-primary w-full text-lg focus:ring-2 focus:ring-primary/50 shadow-sm"
                placeholder="Sir Reginald the Brave"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-md font-semibold mb-2 text-base-content/90">
                <span role="img" aria-label="scroll">
                  📜
                </span>{" "}
                Chronicle their Legend (Description):
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="textarea textarea-bordered textarea-primary w-full text-lg focus:ring-2 focus:ring-primary/50 shadow-sm"
                placeholder="A valiant knight, known for their courage and slightly oversized helmet..."
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="characterClass" className="block text-md font-semibold mb-2 text-base-content/90">
                <span role="img" aria-label="shield">
                  🛡️
                </span>{" "}
                Choose a Class:
              </label>
              <select
                id="characterClass"
                value={characterClass}
                onChange={e => setCharacterClass(Number(e.target.value) as CharacterClass)}
                className="select select-bordered select-primary w-full text-lg focus:ring-2 focus:ring-primary/50 shadow-sm"
              >
                {Object.keys(CharacterClass)
                  .filter(key => isNaN(Number(key)))
                  .map((key, index) => (
                    <option key={key} value={index}>
                      {key}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <label htmlFor="strength" className="block text-md font-semibold mb-2 text-base-content/90">
                  <span role="img" aria-label="muscle">
                    💪
                  </span>{" "}
                  Strength:
                </label>
                <input
                  type="number"
                  id="strength"
                  value={strength}
                  onChange={e => setStrength(e.target.value)}
                  className="input input-bordered input-secondary w-full text-lg focus:ring-2 focus:ring-secondary/50 shadow-sm"
                  placeholder="10"
                  required
                />
              </div>
              <div>
                <label htmlFor="dexterity" className="block text-md font-semibold mb-2 text-base-content/90">
                  <span role="img" aria-label="running shoe">
                    👟
                  </span>{" "}
                  Dexterity:
                </label>
                <input
                  type="number"
                  id="dexterity"
                  value={dexterity}
                  onChange={e => setDexterity(e.target.value)}
                  className="input input-bordered input-secondary w-full text-lg focus:ring-2 focus:ring-secondary/50 shadow-sm"
                  placeholder="10"
                  required
                />
              </div>
              <div>
                <label htmlFor="intelligence" className="block text-md font-semibold mb-2 text-base-content/90">
                  <span role="img" aria-label="brain">
                    🧠
                  </span>{" "}
                  Intelligence:
                </label>
                <input
                  type="number"
                  id="intelligence"
                  value={intelligence}
                  onChange={e => setIntelligence(e.target.value)}
                  className="input input-bordered input-secondary w-full text-lg focus:ring-2 focus:ring-secondary/50 shadow-sm"
                  placeholder="10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-accent btn-lg w-full mt-10 text-base-100 font-bold tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 transition-all duration-150 ease-in-out"
              disabled={isMinting}
            >
              {isMinting ? (
                <>
                  <span className="loading loading-spinner"></span>Forging Hero...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-6 w-6 mr-2" /> Create My Hero!
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl font-semibold text-warning mb-4">Wallet Not Connected</p>
            <p className="text-base-content/70 text-lg">Adventurer, please connect your wallet to begin your quest!</p>
            {/* Optionally, add a connect button here if not using global one, though RainbowKitCustomConnectButton is usually in header */}
          </div>
        )}
      </div>
    </div>
  );
};

export default MintCharacterPage;
