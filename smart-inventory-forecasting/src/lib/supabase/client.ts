/**
 * Mock Supabase Client for Testing
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

export function createClient() {
  const createMockQueryBuilder = (): any => {
    const builder: any = {
      eq: (column: string, value: any) => createMockQueryBuilder(),
      neq: (column: string, value: any) => createMockQueryBuilder(),
      gt: (column: string, value: any) => createMockQueryBuilder(),
      gte: (column: string, value: any) => createMockQueryBuilder(),
      lt: (column: string, value: any) => createMockQueryBuilder(),
      lte: (column: string, value: any) => createMockQueryBuilder(),
      like: (column: string, value: any) => createMockQueryBuilder(),
      ilike: (column: string, value: any) => createMockQueryBuilder(),
      in: (column: string, values: any[]) => createMockQueryBuilder(),
      is: (column: string, value: any) => createMockQueryBuilder(),
      order: (column: string, options?: any) => createMockQueryBuilder(),
      limit: (count: number) => createMockQueryBuilder(),
      range: (from: number, to: number) => createMockQueryBuilder(),
      single: () => Promise.resolve({ data: null, error: null }),
      select: (columns?: string, options?: any) => createMockQueryBuilder(),
      update: (data: any) => createMockQueryBuilder(),
      then: (onfulfilled?: any, onrejected?: any) => 
        Promise.resolve({ data: null, error: null }).then(onfulfilled, onrejected),
      catch: (onrejected?: any) => 
        Promise.resolve({ data: null, error: null }).catch(onrejected),
      finally: (onfinally?: any) => 
        Promise.resolve({ data: null, error: null }).finally(onfinally)
    };
    return builder;
  };
  
  const mockQueryBuilder = createMockQueryBuilder();

  return {
    from: (table: string) => ({
      select: (columns?: string, options?: any) => createMockQueryBuilder(),
      insert: (data: any) => {
        const insertBuilder: any = {
          select: (columns?: string) => createMockQueryBuilder(),
          single: () => Promise.resolve({ data: null, error: null }),
          then: (onfulfilled?: any, onrejected?: any) => 
            Promise.resolve({ data: null, error: null }).then(onfulfilled, onrejected),
          catch: (onrejected?: any) => 
            Promise.resolve({ data: null, error: null }).catch(onrejected),
          finally: (onfinally?: any) => 
            Promise.resolve({ data: null, error: null }).finally(onfinally)
        };
        return insertBuilder;
      },
      upsert: (data: any, options?: any) => {
        const upsertBuilder: any = {
          then: (onfulfilled?: any, onrejected?: any) => 
            Promise.resolve({ data: null, error: null }).then(onfulfilled, onrejected),
          catch: (onrejected?: any) => 
            Promise.resolve({ data: null, error: null }).catch(onrejected),
          finally: (onfinally?: any) => 
            Promise.resolve({ data: null, error: null }).finally(onfinally)
        };
        return upsertBuilder;
      },
      update: (data: any) => createMockQueryBuilder(),
      delete: () => createMockQueryBuilder()
    }),
    auth: {
      getUser: () => Promise.resolve({ 
        data: { user: { id: 'test-user', email: 'test@example.com' } }, 
        error: null 
      }),
      getSession: () => Promise.resolve({ 
        data: { session: null }, 
        error: null 
      }),
      updateUser: (data: any) => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      })
    },
    channel: (name: string) => ({
      on: (event: string, options: any, callback: Function) => ({
        subscribe: () => ({})
      })
    })
  }
}