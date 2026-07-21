import type { Prisma } from "@prisma/client";

export type PortalListing = Prisma.ListingGetPayload<{
  include: {
    images: true;
    agent: { select: { id: true; name: true; email: true; phone: true } };
  };
}>;

export type PortalConnectionStatus = {
  portal: string;
  implemented: boolean;
  configured: boolean;
  reachable: boolean;
  version?: string;
  message: string;
};

export type PortalSyncResult = {
  externalId: string;
  remoteUrl?: string;
  remoteStatus: string;
  published: boolean;
  message: string;
};

export type PortalSyncContext = {
  localId: number;
};

export interface PortalConnector {
  portal: string;
  inspect(): Promise<PortalConnectionStatus>;
  sync(listing: PortalListing, context: PortalSyncContext): Promise<PortalSyncResult>;
}

export class PortalConnectorError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "PortalConnectorError";
  }
}
