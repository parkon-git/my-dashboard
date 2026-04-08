exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: `당신은 e스포츠 리그 운영팀의 데이터 분석 담당자입니다.
주어진 수치 데이터를 바탕으로 간결하고 전문적인 한국어 서술을 작성하세요.
- 불필요한 수식어나 감탄사 없이 사실 기반으로 작성
- 존댓말 사용 금지, 간결한 명사형으로 마무리
- 숫자는 그대로 사용
- JSON이나 마크다운 없이 순수 텍스트만 반환`,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const rawText = await response.text();
    console.log('Anthropic raw response:', rawText);

    const data = JSON.parse(rawText);
    console.log('Parsed data:', JSON.stringify(data));

    let text = '';
    if (data.content && Array.isArray(data.content) && data.content.length > 0) {
      text = data.content[0].text || '';
    } else if (data.error) {
      console.error('Anthropic API error:', data.error);
      text = '';
    }

    console.log('Extracted text:', text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    console.error('Handler error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};