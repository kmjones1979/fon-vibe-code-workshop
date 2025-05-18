"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { usePublicClient } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface ItemTypeData {
  id: bigint;
  name: string;
  description: string;
  uri: string;
  // Potentially add off-chain metadata later: image, attributes etc.
}

const ViewItemsPage: NextPage = () => {
  const [itemTypes, setItemTypes] = useState<ItemTypeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: nextTokenId } = useScaffoldReadContract({
    contractName: "GameItem",
    functionName: "nextTokenId",
    watch: true,
  });

  const publicClient = usePublicClient();

  useEffect(() => {
    if (nextTokenId === undefined || !publicClient) {
      return;
    }

    const fetchItemTypes = async () => {
      setIsLoading(true);
      const items: ItemTypeData[] = [];
      const numNextTokenId = Number(nextTokenId);

      const gameItemConfig = contracts?.[publicClient.chain.id]?.GameItem;
      if (!gameItemConfig || !gameItemConfig.address || !gameItemConfig.abi) {
        console.error("GameItem contract configuration not found for this chain.");
        setIsLoading(false);
        return;
      }
      const contractArgs = {
        address: gameItemConfig.address as `0x${string}`,
        abi: gameItemConfig.abi,
      } as const;

      for (let i = 1n; i < numNextTokenId; i++) {
        try {
          const itemData = (await publicClient.readContract({
            ...contractArgs,
            functionName: "itemTypes",
            args: [i],
          })) as readonly [string, string]; // struct ItemType { string name; string description; ... }

          const itemUri = (await publicClient.readContract({
            ...contractArgs,
            functionName: "uri",
            args: [i],
          })) as string;

          items.push({
            id: i,
            name: itemData[0],
            description: itemData[1],
            uri: itemUri,
          });
        } catch (error) {
          console.error(`Error fetching item type ID ${i}:`, error);
        }
      }
      setItemTypes(items);
      setIsLoading(false);
    };

    fetchItemTypes();
  }, [nextTokenId, publicClient]);

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">Available Game Items</h1>
      {isLoading && (
        <p className="text-center">
          <span className="loading loading-dots loading-lg"></span>
        </p>
      )}
      {!isLoading && itemTypes.length === 0 && (
        <p className="text-center text-xl">No item types found or defined yet.</p>
      )}
      {itemTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {itemTypes.map(item => (
            <div key={item.id.toString()} className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
              {/* Placeholder for item image - will use URI later */}
              {/* <figure className="px-4 pt-4 h-40 bg-base-300 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">🎁</span> 
              </figure> */}
              <div className="card-body p-5">
                <h2 className="card-title text-lg truncate" title={item.name}>
                  {item.name} (ID: {item.id.toString()})
                </h2>
                <p className="text-xs text-base-content/70 mb-2 h-12 overflow-y-auto scrollbar-thin">
                  {item.description}
                </p>
                <p className="text-xs mt-1 truncate">
                  <strong>Metadata URI:</strong> {item.uri}
                </p>
                {/* Add more details or actions (e.g., view on marketplace, admin manage) */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewItemsPage;
