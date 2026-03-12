import { HttpAgent } from "@icp-sdk/core/agent";
import type { Identity } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

export function useStorageClient(identity?: Identity) {
  const [client, setClient] = useState<StorageClient | null>(null);

  useEffect(() => {
    loadConfig().then((config) => {
      const agent = new HttpAgent({
        identity: identity || undefined,
        host: config.backend_host,
      });
      const sc = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      setClient(sc);
    });
  }, [identity]);

  return client;
}

export async function getImageUrl(imageId: string): Promise<string> {
  if (!imageId) return "";
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  const sc = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  return sc.getDirectURL(imageId);
}
