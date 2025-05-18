"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount, usePublicClient } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { CharacterClass, CharacterMetadata } from "~~/types/game/character";
import { contracts } from "~~/utils/scaffold-eth/contract";

// Re-using enum from mint page for now

interface CharacterDisplayData {
  id: bigint;
  level: bigint;
  experience: bigint;
  characterClass: CharacterClass;
  strength: bigint;
  dexterity: bigint;
  intelligence: bigint;
  name: string;
  description: string;
  image: string;
  attributes: CharacterMetadata["attributes"];
}

const MyCharactersPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [ownedCharacters, setOwnedCharacters] = useState<CharacterDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: balance } = useScaffoldReadContract({
    contractName: "GameCharacter",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
  });

  const publicClient = usePublicClient();

  useEffect(() => {
    if (!isConnected || !connectedAddress || balance === undefined || !publicClient) {
      setOwnedCharacters([]);
      return;
    }

    const fetchCharacterDetails = async () => {
      setIsLoading(true);
      const numBalance = Number(balance);
      const characterDataPromises: Promise<CharacterDisplayData | null>[] = [];

      if (numBalance === 0) {
        setOwnedCharacters([]);
        setIsLoading(false);
        return;
      }

      const gameCharacterConfig = contracts?.[publicClient.chain.id]?.GameCharacter;
      if (!gameCharacterConfig || !gameCharacterConfig.address || !gameCharacterConfig.abi) {
        console.error("GameCharacter contract configuration not found for this chain.");
        setIsLoading(false);
        return;
      }
      const contractArgs = {
        address: gameCharacterConfig.address as `0x${string}`,
        abi: gameCharacterConfig.abi,
      } as const;

      const tokenIds: bigint[] = [];
      try {
        for (let i = 0; i < numBalance; i++) {
          const tokenId = await publicClient.readContract({
            ...contractArgs,
            functionName: "tokenOfOwnerByIndex",
            args: [connectedAddress, BigInt(i)],
          });
          tokenIds.push(tokenId as bigint);
        }
      } catch (error) {
        console.error("Error fetching token IDs:", error);
        setIsLoading(false);
        setOwnedCharacters([]);
        return;
      }

      for (const tokenId of tokenIds) {
        characterDataPromises.push(
          (async () => {
            try {
              // 1. Fetch on-chain stats (source of truth for game mechanics and fallback name/desc)
              const onChainStatsResult = (await publicClient.readContract({
                ...contractArgs,
                functionName: "characterStats",
                args: [tokenId],
              })) as readonly [string, string, bigint, bigint, CharacterClass, bigint, bigint, bigint];
              // Destructure for clarity: name, description, level, experience, class, strength, dexterity, intelligence
              const [
                onChainName,
                onChainDescription,
                level,
                experience,
                character_class_enum,
                strength,
                dexterity,
                intelligence,
              ] = onChainStatsResult;

              // 2. Fetch and parse Token URI
              let parsedMetadata: CharacterMetadata | null = null;
              try {
                const dataUri = (await publicClient.readContract({
                  ...contractArgs,
                  functionName: "tokenURI",
                  args: [tokenId],
                })) as string;

                if (dataUri && dataUri.startsWith("data:application/json;base64,")) {
                  const base64String = dataUri.substring("data:application/json;base64,".length);
                  const jsonString = Buffer.from(base64String, "base64").toString("utf-8");
                  parsedMetadata = JSON.parse(jsonString) as CharacterMetadata;
                } else {
                  console.warn(`Token ID ${tokenId} URI is not a valid Base64 data URI: ${dataUri}`);
                }
              } catch (uriError) {
                console.error(`Error fetching or parsing tokenURI for ${tokenId}:`, uriError);
              }

              return {
                id: tokenId,
                name: parsedMetadata?.name ?? onChainName,
                description: parsedMetadata?.description ?? onChainDescription,
                image: parsedMetadata?.image ?? "", // Fallback to empty string if no image in metadata
                level: level,
                experience: experience,
                characterClass: character_class_enum,
                strength: strength,
                dexterity: dexterity,
                intelligence: intelligence,
                attributes: parsedMetadata?.attributes ?? [],
              };
            } catch (error) {
              console.error(`Error fetching all details for token ID ${tokenId}:`, error);
              return null;
            }
          })(),
        );
      }

      const characters = (await Promise.all(characterDataPromises)).filter(
        (c): c is CharacterDisplayData => c !== null,
      );
      setOwnedCharacters(characters);
      setIsLoading(false);
    };

    fetchCharacterDetails();
  }, [connectedAddress, isConnected, balance, publicClient]);

  const getCharacterClassName = (classEnum: CharacterClass) => {
    return CharacterClass[classEnum];
  };

  if (!isConnected) {
    return <p className="text-center mt-10">Please connect your wallet to see your characters.</p>;
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">My Game Characters</h1>
      {isLoading && (
        <p className="text-center">
          <span className="loading loading-dots loading-lg"></span>
        </p>
      )}
      {!isLoading && balance === 0n && ownedCharacters.length === 0 && (
        <p className="text-center text-xl">You don't own any characters yet. Go mint one!</p>
      )}

      {!isLoading && balance !== undefined && balance > 0n && ownedCharacters.length === 0 && !isLoading && (
        <div className="text-center p-4 my-4 bg-info/10 border border-info rounded-md">
          <p className="font-semibold">Fetched {balance.toString()} character(s), but could not display details.</p>
          <p>This might be due to issues fetching or parsing their metadata from the blockchain.</p>
        </div>
      )}

      {ownedCharacters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownedCharacters.map(char => (
            <div key={char.id.toString()} className="card bg-base-100 shadow-xl flex flex-col">
              {char.image && (
                <figure className="px-4 pt-4 h-56 relative">
                  <img
                    src={
                      char.image.startsWith("ipfs://")
                        ? char.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                        : char.image
                    }
                    alt={char.name}
                    className="rounded-xl object-cover w-full h-full"
                  />
                </figure>
              )}
              <div className="card-body flex-grow p-4">
                {" "}
                {/* Adjusted padding */}
                <h2 className="card-title truncate text-lg" title={char.name}>
                  {char.name} (ID: {char.id.toString()})
                </h2>
                <p className="text-xs text-gray-500 mb-2 h-16 overflow-y-auto scrollbar-thin">{char.description}</p>
                <div className="text-xs space-y-0.5">
                  {" "}
                  {/* Consolidated stat display */}
                  <p>
                    <strong>Class:</strong> {getCharacterClassName(char.characterClass)}
                  </p>
                  <p>
                    <strong>Level:</strong> {char.level.toString()}
                  </p>
                  <p>
                    <strong>Exp:</strong> {char.experience.toString()}
                  </p>
                  <p>
                    <strong>Str:</strong> {char.strength.toString()}
                  </p>
                  <p>
                    <strong>Dex:</strong> {char.dexterity.toString()}
                  </p>
                  <p>
                    <strong>Int:</strong> {char.intelligence.toString()}
                  </p>
                </div>
                {char.attributes && char.attributes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-base-300">
                    <h3 className="font-semibold text-xs mb-1">Attributes:</h3>
                    <ul className="text-xs space-y-0.5 h-12 overflow-y-auto scrollbar-thin">
                      {char.attributes.map((attr, idx) => (
                        <li key={idx} className="truncate" title={`${attr.trait_type}: ${attr.value}`}>
                          {attr.trait_type}: {String(attr.value)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCharactersPage;
