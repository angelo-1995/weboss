export interface Network {
  id: string;
  code: string;
  name: string;
  parentNetworkId: string | null;
  createdAt: string;
  updatedAt: string;
  children?: Network[];
  leaders?: NetworkLeader[];
  _count?: { users: number; groups: number };
}

export interface NetworkLeader {
  id: string;
  userId: string;
  role: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
