import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    await prisma.waitlistEmail.create({
      data: { email },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao cadastrar email' },
      { status: 500 }
    )
  }
}
