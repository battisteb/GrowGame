/**
 * Mock Supabase client for testing
 */

export type MockSupabaseResponse<T> = {
  data: T | null;
  error: { message: string } | null;
  count?: number;
};

/**
 * Factory to create chainable query builder mock
 */
export const createQueryBuilderMock = <T>(response: MockSupabaseResponse<T>) => {
  const builder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(response),
    then: jest.fn((resolve) => resolve(response)),
  };
  return builder;
};

/**
 * Create a mock Supabase client
 */
export const createMockSupabaseClient = () => {
  const mockRpc = jest.fn();
  const mockFrom = jest.fn();

  const client = {
    from: mockFrom,
    rpc: mockRpc,
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      }),
    },
  };

  return {
    client,
    mockFrom,
    mockRpc,
    /**
     * Helper to set up specific table responses
     */
    mockTable: <T>(tableName: string, response: MockSupabaseResponse<T>) => {
      const queryBuilder = createQueryBuilderMock(response);
      mockFrom.mockImplementation((name: string) => {
        if (name === tableName) return queryBuilder;
        return createQueryBuilderMock({ data: null, error: null });
      });
      return queryBuilder;
    },
    /**
     * Helper to set up RPC responses
     */
    mockRpcCall: <T>(funcName: string, response: MockSupabaseResponse<T>) => {
      mockRpc.mockImplementation((name: string) => {
        if (name === funcName) return Promise.resolve(response);
        return Promise.resolve({ data: null, error: null });
      });
    },
  };
};

// Default mock for jest.mock
export const supabase = createMockSupabaseClient().client;
