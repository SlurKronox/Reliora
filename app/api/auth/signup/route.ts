import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { data: user, error: userError } = await (supabase as any)
      .from('User')
      .insert({
        email,
        name: name || null,
        passwordHash,
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Erro ao criar usuário: ' + userError.message },
        { status: 500 }
      )
    }

    const { data: workspace, error: workspaceError } = await (supabase as any)
      .from('Workspace')
      .insert({
        name: 'Meu workspace',
      })
      .select()
      .single()

    if (workspaceError) {
      console.error('Workspace creation error:', workspaceError)

      await (supabase as any).from('User').delete().eq('id', user.id)

      return NextResponse.json(
        { error: 'Erro ao criar workspace: ' + workspaceError.message },
        { status: 500 }
      )
    }

    const { error: memberError } = await (supabase as any)
      .from('WorkspaceMember')
      .insert({
        userId: user.id,
        workspaceId: workspace.id,
        role: 'owner',
      })

    if (memberError) {
      console.error('WorkspaceMember creation error:', memberError)

      await (supabase as any).from('User').delete().eq('id', user.id)
      await (supabase as any).from('Workspace').delete().eq('id', workspace.id)

      return NextResponse.json(
        { error: 'Erro ao criar membro do workspace: ' + memberError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta: ' + (error instanceof Error ? error.message : 'Unknown') },
      { status: 500 }
    )
  }
}
