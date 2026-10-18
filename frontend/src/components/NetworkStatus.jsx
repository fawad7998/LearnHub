import { useSyncExternalStore } from "react";
import { subscribeRequests, getPendingRequests } from "../services/api";

export default function NetworkStatus() {
  const pending = useSyncExternalStore(subscribeRequests, getPendingRequests);
  return pending > 0 ? (
    <div className="network-progress" role="status" aria-label="Loading">
      <span />
    </div>
  ) : null;
}
