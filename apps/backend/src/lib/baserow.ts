import { fetch, Agent } from 'undici';

export interface BaserowTable {
  id: number;
  name: string;
  database_id: number;
}

export interface TableMapping {
  [prefix: string]: {
    [agencyCode: string]: number;
  };
}

class BaserowClient {
  private baseUrl: string;
  private token: string;
  private tableMapping: TableMapping = {};
  private lastFetch = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private agent: Agent;

  constructor() {
    this.baseUrl = process.env.BASEROW_URL || 'https://baserow.becoming-more.com';
    this.token = process.env.BASEROW_TOKEN || '';
    // Create agent that ignores SSL certificate errors
    this.agent = new Agent({
      connect: {
        rejectUnauthorized: false
      }
    });
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Token ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  private async fetchTables(): Promise<BaserowTable[]> {
    const response = await fetch(`${this.baseUrl}/api/database/tables/`, {
      headers: this.getAuthHeaders(),
      dispatcher: this.agent
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.status}`);
    }

    const data = await response.json() as { results: BaserowTable[] };
    return data.results;
  }

  private parseTableName(tableName: string): { prefix: string; agencyCode: string | null } {
    const normalized = tableName.toLowerCase().replace(/\s+/g, '_');
    
    // Look for pattern: prefix_AGENCY_CODE (e.g., clients_welcome_TT001)
    const match = normalized.match(/^(.+)_([A-Z]{2}\d{3})$/i);
    if (match && match[1] && match[2]) {
      return { prefix: match[1], agencyCode: match[2].toUpperCase() };
    }

    // Special case for users table (global, no suffix)
    if (normalized === 'users') {
      return { prefix: 'users', agencyCode: null };
    }

    return { prefix: normalized, agencyCode: null };
  }

  async refreshTableMapping(): Promise<void> {
    const now = Date.now();
    if (now - this.lastFetch < this.CACHE_TTL) {
      return; // Cache still valid
    }

    try {
      const tables = await this.fetchTables();
      const newMapping: TableMapping = {};

      for (const table of tables) {
        const { prefix, agencyCode } = this.parseTableName(table.name);
        
        if (!newMapping[prefix]) {
          newMapping[prefix] = {};
        }

        if (agencyCode) {
          newMapping[prefix][agencyCode] = table.id;
        } else {
          // Global tables (like users)
          newMapping[prefix]['GLOBAL'] = table.id;
        }
      }

      this.tableMapping = newMapping;
      this.lastFetch = now;
      console.log('Table mapping refreshed:', Object.keys(this.tableMapping));
    } catch (error) {
      console.error('Failed to refresh table mapping:', error);
      throw error;
    }
  }

  async getTableId(prefix: string, agencyCode?: string): Promise<number | null> {
    await this.refreshTableMapping();

    const tableGroup = this.tableMapping[prefix];
    if (!tableGroup) {
      return null;
    }

    // For global tables like users
    if (!agencyCode) {
      return tableGroup['GLOBAL'] || null;
    }

    return tableGroup[agencyCode] || null;
  }

  async listRows(tableId: number, filters?: Record<string, any>): Promise<any[]> {
    let url = `${this.baseUrl}/api/database/rows/table/${tableId}/?user_field_names=true`;
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      url += `&${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      dispatcher: this.agent
    });

    if (!response.ok) {
      throw new Error(`Failed to list rows: ${response.status}`);
    }

    const data = await response.json() as { results: any[] };
    return data.results;
  }

  async createRow(tableId: number, data: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/database/rows/table/${tableId}/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
      dispatcher: this.agent
    });

    if (!response.ok) {
      throw new Error(`Failed to create row: ${response.status}`);
    }

    return response.json();
  }

  async updateRow(tableId: number, rowId: number, data: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/database/rows/table/${tableId}/${rowId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
      dispatcher: this.agent
    });

    if (!response.ok) {
      throw new Error(`Failed to update row: ${response.status}`);
    }

    return response.json();
  }

  async getRow(tableId: number, rowId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`, {
      headers: this.getAuthHeaders(),
      dispatcher: this.agent
    });

    if (!response.ok) {
      throw new Error(`Failed to get row: ${response.status}`);
    }

    return response.json();
  }
}

export const baserowClient = new BaserowClient();
