import puppeteer from 'puppeteer'

interface ReportData {
  weekStartDate: Date
  weekEndDate: Date
  avgMoodScore: number
  avgStressLevel: number
  dominantMoods: string[]
  topThemes: string[]
  emotionArc: number[]
  aiSummary: string
  userName: string
}

export async function generateReportPDF(report: ReportData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  const html = buildReportHTML(report)
  await page.setContent(html, { waitUntil: 'load' })

  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '40px', right: '48px', bottom: '40px', left: '48px' },
    printBackground: true,
  })

  await browser.close()
  return Buffer.from(pdfBuffer)
}

function buildReportHTML(report: ReportData): string {
  const startDate = new Date(report.weekStartDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long',
  })
  const endDate = new Date(report.weekEndDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const arc = report.emotionArc || []
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const bars = arc.map((score, i) => {
    const height = Math.max(Math.round(score * 8), 4)
    const color = score >= 7 ? '#4a7c6f' : score >= 4 ? '#d4872a' : '#c4736a'
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
        <div style="height:${height}px;width:100%;background:${color};border-radius:4px 4px 0 0;opacity:0.8"></div>
        <span style="font-size:9px;color:#8a9aa8">${days[i] || ''}</span>
      </div>
    `
  }).join('')

  const moodTags = report.dominantMoods.map(m =>
    `<span style="padding:4px 12px;border-radius:20px;background:rgba(74,124,111,0.1);border:1px solid rgba(74,124,111,0.2);color:#4a7c6f;font-size:12px;text-transform:capitalize">${m}</span>`
  ).join('')

  const themeTags = report.topThemes.map(t =>
    `<span style="padding:4px 12px;border-radius:20px;border:1px solid rgba(44,58,68,0.15);color:#4a5c68;font-size:12px">${t}</span>`
  ).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1a2530;
      background: #faf8f5;
      padding: 0;
    }
    .page { padding: 40px 48px; }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 24px;
      margin-bottom: 28px;
      border-bottom: 1px solid rgba(44,58,68,0.1);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-icon {
      width: 28px; height: 28px;
      background: linear-gradient(135deg, #7aab9c, #d4872a);
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; color: white;
    }
    .logo-text {
      font-size: 18px;
      font-weight: 400;
      color: #4a7c6f;
    }
    .week-label {
      font-size: 11px;
      color: #8a9aa8;
      letter-spacing: 0.5px;
    }

    h1 {
      font-size: 28px;
      font-weight: 300;
      color: #1a2530;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 13px;
      color: #4a5c68;
      margin-bottom: 28px;
    }

    .stats-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat {
      flex: 1;
      background: #fff;
      border: 1px solid rgba(44,58,68,0.1);
      border-radius: 10px;
      padding: 14px 18px;
    }
    .stat-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #8a9aa8;
      margin-bottom: 4px;
      font-weight: 500;
    }
    .stat-value {
      font-size: 26px;
      font-weight: 300;
      color: #1a2530;
    }

    .section {
      background: #fff;
      border: 1px solid rgba(44,58,68,0.1);
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .section-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #8a9aa8;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .arc-container {
      display: flex;
      align-items: flex-end;
      gap: 6px;
      height: 70px;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .ai-summary {
      border-left: 3px solid #7aab9c;
      padding-left: 16px;
    }
    .ai-summary p {
      font-size: 13px;
      line-height: 1.8;
      color: #4a5c68;
      font-style: italic;
    }

    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid rgba(44,58,68,0.08);
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #8a9aa8;
    }
  </style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="logo">
      <div class="logo-icon">✦</div>
      <span class="logo-text">EchoMind</span>
    </div>
    <div class="week-label">Weekly Mental Map · ${startDate} – ${endDate}</div>
  </div>

  <h1>Your Week in Mind</h1>
  <div class="subtitle">A personal emotional report for ${report.userName}</div>

  <div class="stats-row">
    <div class="stat">
      <div class="stat-label">Avg Mood</div>
      <div class="stat-value" style="color:#4a7c6f">${report.avgMoodScore.toFixed(1)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Avg Stress</div>
      <div class="stat-value" style="color:#c4736a">${report.avgStressLevel.toFixed(1)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Dominant Mood</div>
      <div class="stat-value" style="font-size:16px;padding-top:6px;text-transform:capitalize">${report.dominantMoods[0] || '—'}</div>
    </div>
  </div>

  ${arc.length > 0 ? `
  <div class="section">
    <div class="section-label">Mood Arc — Mon to Sun</div>
    <div class="arc-container">${bars}</div>
  </div>` : ''}

  <div class="section">
    <div class="section-label">Dominant Moods</div>
    <div class="tags">${moodTags}</div>
  </div>

  <div class="section">
    <div class="section-label">Top Themes</div>
    <div class="tags">${themeTags}</div>
  </div>

  <div class="section ai-summary">
    <div class="section-label" style="color:#4a7c6f">AI Mental Summary</div>
    <p>${report.aiSummary}</p>
  </div>

  <div class="footer">
    <span>EchoMind · Private & Confidential</span>
    <span>Generated ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
  </div>

</div>
</body>
</html>`
}