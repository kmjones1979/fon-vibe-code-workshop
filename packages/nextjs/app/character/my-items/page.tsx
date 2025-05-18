"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount, usePublicClient } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface OwnedItemData {
  id: bigint;
  name: string;
  description: string;
  uri: string;
  balance: bigint;
  // Add metadata fields once fetched, e.g., image: string
}

const MyItemsPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [ownedItems, setOwnedItems] = useState<OwnedItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get the total number of item types created so far
  const { data: nextItemTypeId } = useScaffoldReadContract({
    contractName: "GameItem",
    functionName: "nextTokenId",
    watch: true, // Watch for new item types being created
  });

  const publicClient = usePublicClient();

  useEffect(() => {
    if (!isConnected || !connectedAddress || nextItemTypeId === undefined || !publicClient) {
      setOwnedItems([]);
      if (isConnected && connectedAddress && nextItemTypeId !== undefined) setIsLoading(false); // Stop loading if conditions met but nothing to fetch
      return;
    }

    const fetchOwnedItems = async () => {
      setIsLoading(true);
      const itemsToDisplay: OwnedItemData[] = [];
      const numTotalItemTypes = Number(nextItemTypeId);

      const gameItemConfig = contracts?.[publicClient.chain.id]?.GameItem;
      if (!gameItemConfig) {
        console.error("GameItem contract configuration not found for this chain.");
        setIsLoading(false);
        return;
      }
      const contractArgs = {
        address: gameItemConfig.address as `0x${string}`,
        abi: gameItemConfig.abi,
      } as const;

      const itemDetailPromises = [];

      for (let i = 1n; i < numTotalItemTypes; i++) {
        itemDetailPromises.push(
          (async () => {
            try {
              const balance = (await publicClient.readContract({
                ...contractArgs,
                functionName: "balanceOf",
                args: [connectedAddress, i],
              })) as bigint;

              if (balance > 0n) {
                const itemData = (await publicClient.readContract({
                  ...contractArgs,
                  functionName: "itemTypes",
                  args: [i],
                })) as readonly [string, string]; // name, description

                const itemUri = (await publicClient.readContract({
                  ...contractArgs,
                  functionName: "uri",
                  args: [i],
                })) as string;

                return {
                  id: i,
                  name: itemData[0],
                  description: itemData[1],
                  uri: itemUri,
                  balance: balance,
                };
              }
              return null; // Not owned or error
            } catch (error) {
              console.error(`Error fetching details for item ID ${i}:`, error);
              return null;
            }
          })(),
        );
      }

      const resolvedItems = (await Promise.all(itemDetailPromises)).filter(
        (item): item is OwnedItemData => item !== null,
      );

      setOwnedItems(resolvedItems);
      setIsLoading(false);
    };

    fetchOwnedItems();
  }, [connectedAddress, isConnected, nextItemTypeId, publicClient]);

  if (!isConnected) {
    return <p className="text-center mt-10">Please connect your wallet to see your items.</p>;
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-accent">My Game Items / Inventory</h1>
      {isLoading && (
        <p className="text-center">
          <span className="loading loading-dots loading-lg"></span>
        </p>
      )}
      {!isLoading && ownedItems.length === 0 && <p className="text-center text-xl">You don't own any items yet.</p>}
      {ownedItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ownedItems.map(item => (
            <div key={item.id.toString()} className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
              {/* TODO: Fetch and display image from item.uri if it points to metadata */}
              <div className="card-body p-5">
                <h2 className="card-title text-lg truncate" title={item.name}>
                  {item.name} (x{item.balance.toString()})
                </h2>
                <p className="text-xs text-base-content/70 mb-2 h-12 overflow-y-auto scrollbar-thin">
                  {item.description}
                </p>
                <p className="text-xs mt-1 truncate">
                  <strong>ID:</strong> {item.id.toString()}
                </p>
                {/* <p className="text-xs mt-1 truncate"><strong>URI:</strong> {item.uri}</p> */}
                {/* Add actions like 'Use Item' if applicable */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItemsPage;
