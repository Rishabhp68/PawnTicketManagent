export type PawnTicketStatus =
  | "Created"
  | "Active"
  | "Renewed"
  | "Redeemed"
  | "Closed"
  | "Defaulted";

export type PawnTicketTermSchedule = {
  termId: string;
  term: string;
  termPaymentDate: string;
  renewAmount: number;
  redeemAmount: number;
};

export type PawnTicketMetadata = {
  pawnTicketId: string;

  pawnShopId: string;
  pawnShopOrgId: string;
  pawnShopUserId: string;

  borrowerId: string;
  borrowerOrgId: string;
  borrowerUserId: string;
  borrowerSSSId?: string;

  assetType: string;
  assetDescription: string;

  assessedValue: number;

  principalAmount: number;

  loanStartDate: string;

  interestRate: number;
  interestType: "simple" | "compound" | string;

  totalTermsInMonths: number;
};

export type PawnTicketRoles = {
  minter_role_name: string;
  burner_role_name: string;
};

export type PawnTicketToken = {
  tokenId: string;

  tokenName?: string;
  tokenDesc?: string;

  tokenStandard?: string;
  tokenType?: "nonfungible" | "fungible";
  tokenUnit?: "whole" | string;

  assetType?: string;

  status: PawnTicketStatus;

  quantity?: number;

  owner?: string;
  createdBy?: string;

  creationDate?: string;

  tokenUri?: string;

  maturityDate?: string;

  isBurned?: boolean;
  isLocked?: boolean;

  interestPaid?: number;
  totalAmountPaid?: number;

  behaviors?: string[];

  roles?: PawnTicketRoles;

  mintable?: {
    max_mint_quantity: number;
  };

  tokenMetadata: PawnTicketMetadata;

  termSchedules?: PawnTicketTermSchedule[];
};

export type AccountDetails = {
  userAccountId: string;
  associatedFTAccounts?: Array<{ accountId: string; tokenId: string; balance: number }>;
  associatedNFTAccount?: { accountId: string; associatedNFTs?: Array<{ nftTokenId: string }> };
};
