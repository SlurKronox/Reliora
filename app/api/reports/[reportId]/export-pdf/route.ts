import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { generateReportPDF } from '@/lib/pdf/generator'
import { checkPdfPermission } from '@/lib/plan-limits'

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true }
    })

    if (!member) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const report = await prisma.report.findFirst({
      where: {
        id: params.reportId,
        client: {
          workspaceId: member.workspaceId
        }
      },
      include: {
        client: {
          include: {
            workspace: {
              select: {
                name: true,
                brandPrimary: true,
                brandAccent: true,
                brandLogoUrl: true
              }
            }
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Relatório não encontrado ou você não tem permissão' },
        { status: 404 }
      )
    }

    try {
      await checkPdfPermission(member.workspaceId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sem permissão para exportar PDF'
      return NextResponse.json({ error: message }, { status: 403 })
    }

    const pdfBuffer = await generateReportPDF({
      id: report.id,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      aiSummaryText: report.aiSummaryText,
      rawDataJson: report.rawDataJson,
      createdAt: report.createdAt,
      clientName: report.client.name,
      workspaceName: report.client.workspace.name,
      brandPrimary: report.client.workspace.brandPrimary,
      brandAccent: report.client.workspace.brandAccent,
      brandLogoUrl: report.client.workspace.brandLogoUrl
    })

    const filename = `relatorio-${report.client.name.toLowerCase().replace(/\s+/g, '-')}-${report.id.slice(0, 8)}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    )
  }
}
