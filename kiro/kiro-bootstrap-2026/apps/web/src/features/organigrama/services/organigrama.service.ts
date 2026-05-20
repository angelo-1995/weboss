const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((error as { message?: string }).message ?? 'Error al procesar la solicitud');
  }
  return res.json() as Promise<T>;
}

export interface OrganigramaNode {
  id: string;
  fullName: string;
  role: string;
  networkId: string | null;
  networkName: string | null;
  phone: string | null;
}

export interface OrganigramaEdge {
  id: string;
  source: string;
  target: string;
}

export interface OrganigramaResponse {
  nodes: OrganigramaNode[];
  edges: OrganigramaEdge[];
}

export interface NetworkTreeNode {
  id: string;
  code: string;
  name: string;
  children: NetworkTreeNode[];
}

export const organigramaService = {
  getOrganigrama: (token: string) =>
    request<OrganigramaResponse>('/users/organigrama', token),

  getNetworks: (token: string) =>
    request<NetworkTreeNode[]>('/networks', token),
};
