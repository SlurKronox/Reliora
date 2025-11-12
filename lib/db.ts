// @ts-nocheck
import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof supabaseCreateClient> | null = null

function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    supabaseInstance = supabaseCreateClient(supabaseUrl, supabaseKey)
  }
  return supabaseInstance
}

export function createClient() {
  return getSupabase()
}

export const supabase = {
  get from() {
    return getSupabase().from.bind(getSupabase())
  }
}

export const prisma = {
  user: {
    findUnique: async (args: any) => {
      const { data } = await getSupabase()
        .from('User')
        .select('*')
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0] as any)
        .maybeSingle()
      return data
    },
    findFirst: async (args: any) => {
      const { data } = await getSupabase()
        .from('User')
        .select('*')
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0] as any)
        .maybeSingle()
      return data
    },
    create: async (args: any) => {
      const { data } = await getSupabase()
        .from('User')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    count: async () => {
      const { count } = await getSupabase()
        .from('User')
        .select('*', { count: 'exact', head: true })
      return count || 0
    }
  },
  workspace: {
    create: async (args: any) => {
      const { data } = await getSupabase()
        .from('Workspace')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    findFirst: async (args: any) => {
      let query = getSupabase().from('Workspace').select('*')

      if (args.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }

      const { data } = await query.maybeSingle()
      return data
    }
  },
  workspaceMember: {
    create: async (args: any) => {
      const { data } = await getSupabase()
        .from('WorkspaceMember')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    findFirst: async (args: any) => {
      const { data } = await getSupabase()
        .from('WorkspaceMember')
        .select('*, workspace:Workspace(*)')
        .eq('userId', args.where.userId)
        .maybeSingle()
      return data
    }
  },
  client: {
    count: async (args?: any) => {
      let query = getSupabase().from('Client').select('*', { count: 'exact', head: true })

      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }

      const { count } = await query
      return count || 0
    },
    findMany: async (args: any) => {
      let query = getSupabase().from('Client').select('*')

      if (args.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }

      if (args.orderBy) {
        const field = Object.keys(args.orderBy)[0]
        const direction = args.orderBy[field] === 'desc' ? false : true
        query = query.order(field, { ascending: direction })
      }

      const { data } = await query
      return data || []
    },
    findFirst: async (args: any) => {
      let query = getSupabase().from('Client').select('*, reports:Report(*)')

      if (args.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }

      if (args.include?.reports && args.include.reports.orderBy) {
        const field = Object.keys(args.include.reports.orderBy)[0]
        const direction = args.include.reports.orderBy[field] === 'desc' ? false : true
        query = query.order(field, { foreignTable: 'reports', ascending: direction })
      }

      const { data } = await query.maybeSingle()
      return data
    },
    create: async (args: any) => {
      const { data } = await getSupabase()
        .from('Client')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    update: async (args: any) => {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('Client')
        .update(args.data)
        .eq('id', args.where.id)
        .select()
        .single()
      return data
    },
    delete: async (args: any) => {
      const { data } = await getSupabase()
        .from('Client')
        .delete()
        .eq('id', args.where.id)
        .select()
        .single()
      return data
    }
  },
  report: {
    count: async (args?: any) => {
      let query = getSupabase().from('Report').select('*, client:Client!inner(*)', { count: 'exact', head: true })

      if (args?.where?.client?.workspaceId) {
        query = query.eq('client.workspaceId', args.where.client.workspaceId)
      }

      const { count } = await query
      return count || 0
    },
    create: async (args: any) => {
      const { data } = await getSupabase()
        .from('Report')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    findFirst: async (args: any) => {
      let query = getSupabase().from('Report').select('*')

      if (args.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }

      const { data } = await query.maybeSingle()
      return data
    }
  },
  waitlistEmail: {
    create: async (args: any) => {
      const { data } = await getSupabase()
        .from('WaitlistEmail')
        .insert(args.data)
        .select()
        .single()
      return data
    }
  },
  session: {
    findUnique: async (args: any) => {
      const { data } = await getSupabase()
        .from('Session')
        .select('*, user:User(*)')
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0] as any)
        .maybeSingle()
      return data
    },
    create: async (args: any) => {
      const { data } = await getSupabase()
        .from('Session')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    update: async (args: any) => {
      const { data } = await getSupabase()
        .from('Session')
        .update(args.data)
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0] as any)
        .select()
        .single()
      return data
    },
    delete: async (args: any) => {
      await getSupabase()
        .from('Session')
        .delete()
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0] as any)
    },
    deleteMany: async (args: any) => {
      await getSupabase()
        .from('Session')
        .delete()
        .lt('expires', args.where.expires.lt.toISOString())
    }
  },
  account: {
    findFirst: async (args: any) => {
      let query = getSupabase().from('Account').select('*')

      if (args.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }

      const { data } = await query.maybeSingle()
      return data
    },
    create: async (args: any) => {
      const { data } = await getSupabase()
        .from('Account')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    delete: async (args: any) => {
      await getSupabase()
        .from('Account')
        .delete()
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0] as any)
    }
  },
  verificationToken: {
    findUnique: async (args: any) => {
      const { data } = await getSupabase()
        .from('VerificationToken')
        .select('*')
        .eq('identifier', args.where.identifier_token.identifier)
        .eq('token', args.where.identifier_token.token)
        .maybeSingle()
      return data
    },
    create: async (args: any) => {
      const { data} = await getSupabase()
        .from('VerificationToken')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    delete: async (args: any) => {
      await getSupabase()
        .from('VerificationToken')
        .delete()
        .eq('identifier', args.where.identifier_token.identifier)
        .eq('token', args.where.identifier_token.token)
    }
  }
}
