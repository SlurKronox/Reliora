import { ExternalAPIError, ConfigError } from '@/lib/errors'

export interface AIProvider {
  name: string
  generateSummary(metrics: any, periodStart: Date, periodEnd: Date): Promise<string>
  estimateCost(): number
}

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI'

  async generateSummary(metrics: any, periodStart: Date, periodEnd: Date): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new ConfigError('OPENAI_API_KEY não configurada')
    }

    const prompt = this.buildPrompt(metrics, periodStart, periodEnd)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um analista de marketing digital especializado em relatórios de performance.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      throw new ExternalAPIError(
        `Falha ao gerar resumo com OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'OpenAI',
        error
      )
    }
  }

  estimateCost(): number {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    if (model.includes('gpt-4o-mini')) return 1
    if (model.includes('gpt-4')) return 10
    return 5
  }

  private buildPrompt(metrics: any, periodStart: Date, periodEnd: Date): string {
    return `Analise os dados de marketing do período de ${periodStart.toLocaleDateString('pt-BR')} a ${periodEnd.toLocaleDateString('pt-BR')}:

Métricas:
- Sessões: ${metrics.sessions || 'N/A'}
- Usuários: ${metrics.users || 'N/A'}
- Conversões: ${metrics.conversions || 'N/A'}
- Receita: ${metrics.revenue ? `R$ ${metrics.revenue}` : 'N/A'}

Gere um relatório executivo com:
1. Resumo do desempenho geral
2. Principais insights e tendências
3. Recomendações estratégicas
4. Áreas de atenção

Seja direto, profissional e focado em ações práticas. Máximo de 1000 palavras.`
  }
}

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic'

  async generateSummary(metrics: any, periodStart: Date, periodEnd: Date): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      throw new ConfigError('ANTHROPIC_API_KEY não configurada')
    }

    const prompt = this.buildPrompt(metrics, periodStart, periodEnd)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
          max_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Anthropic API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      return data.content[0].text
    } catch (error) {
      throw new ExternalAPIError(
        `Falha ao gerar resumo com Anthropic: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Anthropic',
        error
      )
    }
  }

  estimateCost(): number {
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
    if (model.includes('haiku')) return 2
    if (model.includes('sonnet')) return 5
    return 3
  }

  private buildPrompt(metrics: any, periodStart: Date, periodEnd: Date): string {
    return `Você é um analista de marketing digital. Analise os dados abaixo do período de ${periodStart.toLocaleDateString('pt-BR')} a ${periodEnd.toLocaleDateString('pt-BR')}:

Sessões: ${metrics.sessions || 'N/A'}
Usuários: ${metrics.users || 'N/A'}
Conversões: ${metrics.conversions || 'N/A'}
Receita: ${metrics.revenue ? `R$ ${metrics.revenue}` : 'N/A'}

Gere um relatório executivo profissional com resumo, insights, recomendações e áreas de atenção. Máximo de 1000 palavras.`
  }
}

export class GoogleProvider implements AIProvider {
  name = 'Google'

  async generateSummary(metrics: any, periodStart: Date, periodEnd: Date): Promise<string> {
    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      throw new ConfigError('GOOGLE_AI_API_KEY não configurada')
    }

    const prompt = this.buildPrompt(metrics, periodStart, periodEnd)

    try {
      const model = process.env.GOOGLE_AI_MODEL || 'gemini-pro'
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Google AI API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      return data.candidates[0].content.parts[0].text
    } catch (error) {
      throw new ExternalAPIError(
        `Falha ao gerar resumo com Google AI: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Google',
        error
      )
    }
  }

  estimateCost(): number {
    const model = process.env.GOOGLE_AI_MODEL || 'gemini-pro'
    if (model.includes('flash')) return 1
    if (model.includes('pro')) return 3
    return 2
  }

  private buildPrompt(metrics: any, periodStart: Date, periodEnd: Date): string {
    return `Como analista de marketing, analise os dados de ${periodStart.toLocaleDateString('pt-BR')} a ${periodEnd.toLocaleDateString('pt-BR')}:

Sessões: ${metrics.sessions || 'N/A'}
Usuários: ${metrics.users || 'N/A'}
Conversões: ${metrics.conversions || 'N/A'}
Receita: ${metrics.revenue ? `R$ ${metrics.revenue}` : 'N/A'}

Gere relatório executivo com: resumo, insights, recomendações e áreas de atenção. Máximo 1000 palavras.`
  }
}

export async function generateWithFallback(
  metrics: any,
  periodStart: Date,
  periodEnd: Date
): Promise<{ summary: string; provider: string; cost: number }> {
  const providers: AIProvider[] = []

  if (process.env.OPENAI_API_KEY) providers.push(new OpenAIProvider())
  if (process.env.ANTHROPIC_API_KEY) providers.push(new AnthropicProvider())
  if (process.env.GOOGLE_AI_API_KEY) providers.push(new GoogleProvider())

  if (providers.length === 0) {
    throw new ConfigError('Nenhum provider de IA configurado')
  }

  const errors: Error[] = []

  for (const provider of providers) {
    try {
      console.log(`[AI] Tentando provider: ${provider.name}`)
      const summary = await provider.generateSummary(metrics, periodStart, periodEnd)
      const cost = provider.estimateCost()

      console.log(`[AI] Sucesso com ${provider.name}, custo: ${cost} créditos`)

      return {
        summary,
        provider: provider.name,
        cost
      }
    } catch (error) {
      console.error(`[AI] Falha com ${provider.name}:`, error)
      errors.push(error as Error)
    }
  }

  throw new ExternalAPIError(
    `Todos os providers de IA falharam: ${errors.map(e => e.message).join('; ')}`,
    'AI_PROVIDERS'
  )
}
