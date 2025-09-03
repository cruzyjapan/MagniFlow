export class ArticleSummarizer {
  private readonly openaiApiKey = process.env.OPENAI_API_KEY
  private readonly enableAISummary = process.env.ENABLE_AI_SUMMARY === 'true'

  async summarizeArticle(content: string, maxLength: number = 200): Promise<string> {
    if (!this.enableAISummary || !this.openaiApiKey) {
      // Fallback to simple truncation
      return this.truncateSummary(content, maxLength)
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a news summarizer. Create a concise summary of the article in ${maxLength} characters or less. Focus on the key facts and main points.`,
            },
            {
              role: 'user',
              content: content,
            },
          ],
          max_tokens: Math.ceil(maxLength / 4), // Rough estimate
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const summary = data.choices[0]?.message?.content || ''
      
      return this.truncateSummary(summary, maxLength)
    } catch (error) {
      console.error('Error generating AI summary:', error)
      return this.truncateSummary(content, maxLength)
    }
  }

  private truncateSummary(text: string, maxLength: number): string {
    // Clean up the text
    const cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/<[^>]*>/g, '')
      .trim()

    if (cleaned.length <= maxLength) {
      return cleaned
    }

    // Try to cut at sentence boundary
    const truncated = cleaned.substring(0, maxLength)
    const lastPeriod = truncated.lastIndexOf('.')
    const lastSpace = truncated.lastIndexOf(' ')

    if (lastPeriod > maxLength * 0.8) {
      return truncated.substring(0, lastPeriod + 1)
    } else if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...'
    } else {
      return truncated + '...'
    }
  }
}