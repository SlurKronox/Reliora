import { format } from 'date-fns'

type ReportData = {
  id: string
  periodStart: Date
  periodEnd: Date
  aiSummaryText: string
  rawDataJson: string
  createdAt: Date
  clientName: string
  workspaceName: string
  brandPrimary?: string | null
  brandAccent?: string | null
  brandLogoUrl?: string | null
}

export async function generateReportPDF(report: ReportData): Promise<Buffer> {
  const puppeteer = (await import('puppeteer-core')).default
  const chromium = (await import('@sparticuz/chromium')).default

  let browser = null

  try {
    let metrics: any = {}
    try {
      metrics = typeof report.rawDataJson === 'string'
        ? JSON.parse(report.rawDataJson)
        : report.rawDataJson
    } catch (e) {
      console.error('Failed to parse metrics:', e)
    }

    const brandPrimary = report.brandPrimary || '#14B8A6'
    const brandAccent = report.brandAccent || '#0F766E'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      padding: 40px;
      background: white;
    }

    .header {
      border-bottom: 3px solid ${brandPrimary};
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 28px;
      font-weight: bold;
      color: ${brandPrimary};
    }

    .header-info {
      text-align: right;
    }

    .header-info h2 {
      font-size: 14px;
      color: #6b7280;
      font-weight: normal;
    }

    .header-info p {
      font-size: 12px;
      color: #9ca3af;
    }

    .title-section {
      margin-bottom: 30px;
    }

    .title-section h1 {
      font-size: 32px;
      color: #111827;
      margin-bottom: 8px;
    }

    .title-section .period {
      color: #6b7280;
      font-size: 14px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      background: #f9fafb;
    }

    .metric-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: ${brandPrimary};
      margin-bottom: 4px;
    }

    .metric-description {
      font-size: 11px;
      color: #9ca3af;
    }

    .insights-section {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 30px;
      background: white;
    }

    .insights-section h2 {
      font-size: 20px;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .insights-content {
      font-size: 14px;
      line-height: 1.8;
      color: #374151;
      white-space: pre-wrap;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: #9ca3af;
    }

    .footer .powered {
      font-weight: 600;
      color: ${brandPrimary};
    }

    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${report.workspaceName}</div>
    <div class="header-info">
      <h2>Relatório de Marketing</h2>
      <p>${format(new Date(report.periodStart), 'dd/MM/yyyy')} - ${format(new Date(report.periodEnd), 'dd/MM/yyyy')}</p>
    </div>
  </div>

  <div class="title-section">
    <h1>${report.clientName}</h1>
    <p class="period">
      Período: ${format(new Date(report.periodStart), 'dd/MM/yyyy')} a ${format(new Date(report.periodEnd), 'dd/MM/yyyy')}
    </p>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-label">Sessões</div>
      <div class="metric-value">${metrics.sessions?.toLocaleString('pt-BR') || 'N/A'}</div>
      <div class="metric-description">Total de visitas ao site</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Usuários</div>
      <div class="metric-value">${metrics.users?.toLocaleString('pt-BR') || 'N/A'}</div>
      <div class="metric-description">Visitantes únicos</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Conversões</div>
      <div class="metric-value">${metrics.conversions?.toLocaleString('pt-BR') || 'N/A'}</div>
      <div class="metric-description">Ações concluídas</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Receita</div>
      <div class="metric-value">${metrics.revenue ? `R$ ${metrics.revenue.toLocaleString('pt-BR')}` : 'N/A'}</div>
      <div class="metric-description">Total no período</div>
    </div>
  </div>

  <div class="insights-section">
    <h2>Análise e Insights</h2>
    <div class="insights-content">${report.aiSummaryText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  </div>

  <div class="footer">
    <p>Powered by <span class="powered">Reliora</span></p>
    <p style="margin-top: 4px;">Relatórios inteligentes de marketing com IA</p>
    <p style="margin-top: 8px; font-size: 10px;">
      Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
    </p>
  </div>
</body>
</html>
    `

    const isProduction = process.env.NODE_ENV === 'production'

    browser = await puppeteer.launch({
      args: isProduction ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      executablePath: isProduction
        ? await chromium.executablePath()
        : process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome',
      headless: true,
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px',
      },
    })

    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error('Falha ao gerar PDF')
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
