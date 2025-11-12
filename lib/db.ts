import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export const prisma = {
  user: {
    findUnique: async (args: any) => {
      const { data } = await supabase
        .from('User')
        .select('*')
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0])
        .maybeSingle()
      return data
    },
    findFirst: async (args: any) => {
      const { data } = await supabase
        .from('User')
        .select('*')
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0])
        .maybeSingle()
      return data
    },
    create: async (args: any) => {
      const { data } = await supabase
        .from('User')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    count: async () => {
      const { count } = await supabase
        .from('User')
        .select('*', { count: 'exact', head: true })
      return count || 0
    }
  },
  workspace: {
    create: async (args: any) => {
      const { data } = await supabase
        .from('Workspace')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    findFirst: async (args: any) => {
      let query = supabase.from('Workspace').select('*')

      if (args.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data } = await query.maybeSingle()
      return data
    }
  },
  workspaceMember: {
    create: async (args: any) => {
      const { data } = await supabase
        .from('WorkspaceMember')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    findFirst: async (args: any) => {
      const { data } = await supabase
        .from('WorkspaceMember')
        .select('*, workspace:Workspace(*)')
        .eq('userId', args.where.userId)
        .maybeSingle()
      return data
    }
  },
  client: {
    count: async (args?: any) => {
      let query = supabase.from('Client').select('*', { count: 'exact', head: true })

      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }

      const { count } = await query
      return count || 0
    },
    findMany: async (args: any) => {
      let query = supabase.from('Client').select('*')

      if (args.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value)
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
      let query = supabase.from('Client').select('*, reports:Report(*)')

      if (args.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value)
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
      const { data } = await supabase
        .from('Client')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    update: async (args: any) => {
      const { data } = await supabase
        .from('Client')
        .update(args.data)
        .eq('id', args.where.id)
        .select()
        .single()
      return data
    },
    delete: async (args: any) => {
      const { data } = await supabase
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
      let query = supabase.from('Report').select('*, client:Client!inner(*)', { count: 'exact', head: true })

      if (args?.where?.client?.workspaceId) {
        query = query.eq('client.workspaceId', args.where.client.workspaceId)
      }

      const { count } = await query
      return count || 0
    }
  },
  waitlistEmail: {
    create: async (args: any) => {
      const { data } = await supabase
        .from('WaitlistEmail')
        .insert(args.data)
        .select()
        .single()
      return data
    }
  },
  session: {
    findUnique: async (args: any) => {
      const { data } = await supabase
        .from('Session')
        .select('*, user:User(*)')
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0])
        .maybeSingle()
      return data
    },
    create: async (args: any) => {
      const { data } = await supabase
        .from('Session')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    update: async (args: any) => {
      const { data } = await supabase
        .from('Session')
        .update(args.data)
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0])
        .select()
        .single()
      return data
    },
    delete: async (args: any) => {
      await supabase
        .from('Session')
        .delete()
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0])
    },
    deleteMany: async (args: any) => {
      await supabase
        .from('Session')
        .delete()
        .lt('expires', args.where.expires.lt.toISOString())
    }
  },
  account: {
    findFirst: async (args: any) => {
      let query = supabase.from('Account').select('*')

      if (args.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data } = await query.maybeSingle()
      return data
    },
    create: async (args: any) => {
      const { data } = await supabase
        .from('Account')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    delete: async (args: any) => {
      await supabase
        .from('Account')
        .delete()
        .eq(Object.keys(args.where)[0], Object.values(args.where)[0])
    }
  },
  verificationToken: {
    findUnique: async (args: any) => {
      const { data } = await supabase
        .from('VerificationToken')
        .select('*')
        .eq('identifier', args.where.identifier_token.identifier)
        .eq('token', args.where.identifier_token.token)
        .maybeSingle()
      return data
    },
    create: async (args: any) => {
      const { data } = await supabase
        .from('VerificationToken')
        .insert(args.data)
        .select()
        .single()
      return data
    },
    delete: async (args: any) => {
      await supabase
        .from('VerificationToken')
        .delete()
        .eq('identifier', args.where.identifier_token.identifier)
        .eq('token', args.where.identifier_token.token)
    }
  }
}
