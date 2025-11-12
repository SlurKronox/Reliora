type SummaryParams = {
  periodStart: string
  periodEnd: string
  totals: {
    impressions: number
    clicks: number
    ctr: number
    conversions: number
    cost: number
    revenue?: number
    cpc?: number
    cpa?: number
    roas?: number
  }
  daily?: Array<{
    date: string
    impressions: number
    clicks: number
    conversions: number
    cost: number
    revenue?: number
  }>
  compare?: {
    impressions?: number
    clicks?: number
    ctr?: number
    conversions?: number
    cost?: number
    revenue?: number
    cpc?: number
    cpa?: number
    roas?: number
  }
  outputFormat?: 'json' | 'texto'
  tone?: 'profissional' | 'consultivo' | 'enxuto'
  maxWords?: number
  clientName?: string
  segment?: string
  objective?: string
  channels?: string
}

const SYSTEM_PROMPT = `Você é um Analista Sênior de Marketing de Performance. Sua tarefa é transformar métricas em um resumo executivo claro, objetivo e acionável, em português do Brasil. Não invente dados; use apenas o que for fornecido. Sempre que possível, apresente variações relativas (%), destaque oportunidades e riscos, e finalize com próximos passos práticos. Seja conciso, direto e sem jargões. Se faltar dado essencial, liste em "lacunas de dados". Responda apenas no formato solicitado pelo usuário.`

function buildUserPrompt(params: SummaryParams): string {
  const {
    periodStart,
    periodEnd,
    totals,
    daily,
    compare,
    outputFormat = 'texto',
    tone = 'profissional',
    maxWords = 200,
    clientName = 'Cliente',
    segment = 'Marketing Digital',
    objective = 'gerar leads e otimizar CAC',
    channels = 'Meta Ads, Google Ads',
  } = params

  const dailyJson = daily ? JSON.stringify(daily) : 'N/A'
  const compareJson = compare ? JSON.stringify(compare) : 'N/A'

  let prompt = `Contexto do cliente:
• Nome/segmento: ${clientName} – ${segment}
• Objetivo principal: ${objective}
• Canais monitorados: ${channels}

Período analisado:
• De ${periodStart} a ${periodEnd}
• Período de comparação (opcional): N/A

Métricas agregadas (JSON):
${JSON.stringify(totals)}

Série diária (opcional, JSON):
${dailyJson}

Métricas do período comparativo (opcional, JSON):
${compareJson}

Parâmetros de saída:
• formato_saida: ${outputFormat}
• tom: ${tone}
• max_palavras_texto: ${maxWords}
• moeda: BRL
• casas_decimais: 1
`

  if (outputFormat === 'json') {
    prompt += `
Esquema quando formato_saida = "json":
{
  "resumo": "string (80–140 palavras, cite números absolutos e variações %)",
  "destaques": ["3 bullets curtos com ganhos/perdas relevantes"],
  "recomendacoes": ["3 ações práticas e específicas para próximo ciclo"],
  "riscos": ["1–2 pontos de atenção (ex.: queda de CTR, CPA alto)"],
  "proximos_passos": ["1–2 próximos passos com prazo e responsável sugerido"],
  "lacunas_de_dados": ["liste dados faltantes, se houver"]
}

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional antes ou depois.
`
  } else {
    prompt += `
Por favor, gere um resumo executivo em texto corrido (máximo ${maxWords} palavras) com:
1. Overview do período com números principais
2. 2-3 destaques (positivos ou negativos)
3. 2-3 recomendações práticas
4. Próximos passos sugeridos

Use tom ${tone} e seja direto.
`
  }

  return prompt
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.AI_MODEL || 'gpt-4'

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 800,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiBase = process.env.ANTHROPIC_API_BASE || 'https://api.anthropic.com'
  const apiKey = process.env.ANTHROPIC_API_KEY
  const model = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022'

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const response = await fetch(`${apiBase}/v1/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      temperature: 0.4,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

async function callGoogle(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiBase = process.env.GOOGLE_API_BASE || 'https://generativelanguage.googleapis.com'
  const apiKey = process.env.GOOGLE_API_KEY
  const model = process.env.AI_MODEL || 'gemini-2.0-flash-exp'

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not configured')
  }

  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`

  const response = await fetch(`${apiBase}/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: combinedPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.candidates[0]?.content?.parts[0]?.text || ''
}

export async function generateMarketingSummary(params: SummaryParams): Promise<string> {
  const provider = process.env.AI_PROVIDER || 'openai'
  const systemPrompt = SYSTEM_PROMPT
  const userPrompt = buildUserPrompt(params)

  let result: string

  try {
    switch (provider.toLowerCase()) {
      case 'openai':
        result = await callOpenAI(systemPrompt, userPrompt)
        break
      case 'anthropic':
        result = await callAnthropic(systemPrompt, userPrompt)
        break
      case 'google':
        result = await callGoogle(systemPrompt, userPrompt)
        break
      default:
        throw new Error(`Unknown AI provider: ${provider}`)
    }

    // If JSON format requested, validate and retry if needed
    if (params.outputFormat === 'json') {
      try {
        JSON.parse(result)
      } catch {
        // Retry with explicit instruction
        const retryPrompt = userPrompt + '\n\nATENÇÃO: Você deve retornar APENAS JSON válido, sem texto adicional. Retorne exatamente no esquema solicitado.'

        switch (provider.toLowerCase()) {
          case 'openai':
            result = await callOpenAI(systemPrompt, retryPrompt)
            break
          case 'anthropic':
            result = await callAnthropic(systemPrompt, retryPrompt)
            break
          case 'google':
            result = await callGoogle(systemPrompt, retryPrompt)
            break
        }
      }
    }

    return result.trim()
  } catch (error) {
    console.error('AI Summary generation error:', error)
    throw new Error(`Failed to generate AI summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
