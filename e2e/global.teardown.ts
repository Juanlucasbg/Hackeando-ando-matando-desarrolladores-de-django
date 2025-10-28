import { FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global Playwright teardown...')

  try {
    // Collect and aggregate test results
    const outputDir = config.projects?.[0]?.outputDir || 'test-results'
    const testResultsPath = path.join(outputDir, 'test-results.json')

    if (fs.existsSync(testResultsPath)) {
      console.log('📊 Processing test results...')

      const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'))

      // Generate summary report
      const summary = {
        timestamp: new Date().toISOString(),
        total: testResults.suites?.reduce((sum: number, suite: any) =>
          sum + suite.specs?.length || 0, 0) || 0,
        passed: testResults.suites?.reduce((sum: number, suite: any) =>
          sum + (suite.specs?.filter((spec: any) => spec.ok).length || 0), 0) || 0,
        failed: testResults.suites?.reduce((sum: number, suite: any) =>
          sum + (suite.specs?.filter((spec: any) => !spec.ok).length || 0), 0) || 0,
        flaky: testResults.suites?.reduce((sum: number, suite: any) =>
          sum + (suite.specs?.filter((spec: any) => spec.results?.some((r: any) => r.retry > 0)).length || 0), 0) || 0,
        duration: testResults.suites?.reduce((sum: number, suite: any) =>
          Math.max(sum, suite.specs?.reduce((max: number, spec: any) =>
            Math.max(max, spec.results?.reduce((specMax: number, result: any) =>
              Math.max(specMax, result.duration || 0), 0) || 0), 0) || 0), 0) || 0
      }

      console.log('📈 Test Summary:', {
        total: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        flaky: summary.flaky,
        passRate: ((summary.passed / summary.total) * 100).toFixed(2) + '%',
        duration: `${(summary.duration / 1000).toFixed(2)}s`
      })

      // Save summary report
      fs.writeFileSync(
        path.join(outputDir, 'test-summary.json'),
        JSON.stringify(summary, null, 2)
      )

      // Generate HTML summary report
      const htmlReport = generateHtmlSummary(summary, testResults)
      fs.writeFileSync(
        path.join(outputDir, 'summary.html'),
        htmlReport
      )

      console.log('📄 Summary reports generated')
    }

    // Clean up temporary files and directories
    const tempDirs = [
      path.join(outputDir, 'temp'),
      path.join(outputDir, 'cache'),
      path.join(process.cwd(), 'test-temp')
    ]

    for (const tempDir of tempDirs) {
      if (fs.existsSync(tempDir)) {
        console.log(`🗑️  Cleaning up temporary directory: ${tempDir}`)
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
    }

    // Archive test artifacts if configured
    if (process.env.ARCHIVE_TESTS === 'true') {
      console.log('📦 Archiving test artifacts...')

      const archiveDir = path.join(outputDir, `archive-${Date.now()}`)
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true })
      }

      const artifactsToArchive = [
        'screenshots',
        'videos',
        'traces',
        'coverage'
      ]

      for (const artifact of artifactsToArchive) {
        const sourcePath = path.join(outputDir, artifact)
        const destPath = path.join(archiveDir, artifact)

        if (fs.existsSync(sourcePath)) {
          fs.renameSync(sourcePath, destPath)
        }
      }
    }

    // Clean up old test results (keep last 5 runs)
    const testResultsDirs = fs.readdirSync(outputDir)
      .filter(dir => dir.startsWith('test-results-'))
      .map(dir => ({
        name: dir,
        path: path.join(outputDir, dir),
        time: fs.statSync(path.join(outputDir, dir)).mtime
      }))
      .sort((a, b) => b.time.getTime() - a.time.getTime())

    if (testResultsDirs.length > 5) {
      console.log('🗑️  Cleaning up old test results...')

      const dirsToDelete = testResultsDirs.slice(5)
      for (const dir of dirsToDelete) {
        fs.rmSync(dir.path, { recursive: true, force: true })
        console.log(`   Deleted: ${dir.name}`)
      }
    }

    // Generate performance report if performance tests were run
    const performanceReportPath = path.join(outputDir, 'performance-report.json')
    if (fs.existsSync(performanceReportPath)) {
      console.log('⚡ Processing performance results...')

      const performanceData = JSON.parse(fs.readFileSync(performanceReportPath, 'utf8'))
      const performanceSummary = analyzePerformanceData(performanceData)

      fs.writeFileSync(
        path.join(outputDir, 'performance-summary.json'),
        JSON.stringify(performanceSummary, null, 2)
      )

      console.log('📊 Performance Summary:', {
        averageLoadTime: `${performanceSummary.averageLoadTime.toFixed(2)}ms`,
        averageFCP: `${performanceSummary.averageFCP.toFixed(2)}ms`,
        averageLCP: `${performanceSummary.averageLCP.toFixed(2)}ms`,
        memoryUsage: `${(performanceSummary.averageMemoryUsage / 1024 / 1024).toFixed(2)}MB`
      })
    }

    // Generate accessibility report if accessibility tests were run
    const accessibilityReportPath = path.join(outputDir, 'accessibility-report.json')
    if (fs.existsSync(accessibilityReportPath)) {
      console.log('♿ Processing accessibility results...')

      const accessibilityData = JSON.parse(fs.readFileSync(accessibilityReportPath, 'utf8'))
      const accessibilitySummary = analyzeAccessibilityData(accessibilityData)

      fs.writeFileSync(
        path.join(outputDir, 'accessibility-summary.json'),
        JSON.stringify(accessibilitySummary, null, 2)
      )

      console.log('♿ Accessibility Summary:', {
        violations: accessibilitySummary.totalViolations,
        criticalIssues: accessibilitySummary.criticalIssues,
        passes: accessibilitySummary.totalPasses
      })
    }

    // Send notifications if configured
    if (process.env.NOTIFICATION_WEBHOOK) {
      console.log('📬 Sending test completion notification...')

      await sendNotification({
        status: summary?.failed > 0 ? 'FAILED' : 'PASSED',
        summary: summary || {},
        timestamp: new Date().toISOString(),
        url: process.env.BUILD_URL || 'N/A'
      })
    }

    // Upload artifacts to external storage if configured
    if (process.env.UPLOAD_ARTIFACTS === 'true') {
      console.log('☁️  Uploading test artifacts...')

      await uploadArtifacts(outputDir, {
        destination: process.env.ARTIFACT_DESTINATION,
        retention: process.env.ARTIFACT_RETENTION || '30d'
      })
    }

    console.log('✅ Global teardown completed successfully')

  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    throw error
  }
}

function generateHtmlSummary(summary: any, testResults: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Summary Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e8f4fd; padding: 15px; border-radius: 5px; text-align: center; }
        .metric.failed { background: #ffebee; }
        .metric.passed { background: #e8f5e8; }
        .details { margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Test Execution Summary</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>

      <div class="summary">
        <div class="metric">
          <h3>Total Tests</h3>
          <p style="font-size: 24px;">${summary.total}</p>
        </div>
        <div class="metric passed">
          <h3>Passed</h3>
          <p style="font-size: 24px;">${summary.passed}</p>
        </div>
        <div class="metric failed">
          <h3>Failed</h3>
          <p style="font-size: 24px;">${summary.failed}</p>
        </div>
        <div class="metric">
          <h3>Pass Rate</h3>
          <p style="font-size: 24px;">${((summary.passed / summary.total) * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div class="details">
        <h2>Test Details</h2>
        <table>
          <tr>
            <th>Test Suite</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Retries</th>
          </tr>
          ${testResults.suites?.map((suite: any) =>
            suite.specs?.map((spec: any) => `
              <tr>
                <td>${spec.title}</td>
                <td>${spec.ok ? '✅ PASSED' : '❌ FAILED'}</td>
                <td>${(spec.duration || 0).toFixed(2)}ms</td>
                <td>${spec.results?.[0]?.retry || 0}</td>
              </tr>
            `).join('') || ''
          ).join('') || ''}
        </table>
      </div>
    </body>
    </html>
  `
}

function analyzePerformanceData(data: any): any {
  const runs = data.runs || []

  return {
    averageLoadTime: runs.reduce((sum: number, run: any) => sum + (run.loadTime || 0), 0) / runs.length,
    averageFCP: runs.reduce((sum: number, run: any) => sum + (run.fcp || 0), 0) / runs.length,
    averageLCP: runs.reduce((sum: number, run: any) => sum + (run.lcp || 0), 0) / runs.length,
    averageMemoryUsage: runs.reduce((sum: number, run: any) => sum + (run.memoryUsage || 0), 0) / runs.length,
    slowestRun: runs.reduce((slowest: any, run: any) =>
      (run.loadTime || 0) > (slowest.loadTime || 0) ? run : slowest, {}),
    fastestRun: runs.reduce((fastest: any, run: any) =>
      (!fastest.loadTime || (run.loadTime || 0) < fastest.loadTime) ? run : fastest, {})
  }
}

function analyzeAccessibilityData(data: any): any {
  const violations = data.violations || []

  return {
    totalViolations: violations.reduce((sum: number, test: any) => sum + test.nodes.length, 0),
    criticalIssues: violations.filter((v: any) => v.impact === 'critical').length,
    seriousIssues: violations.filter((v: any) => v.impact === 'serious').length,
    moderateIssues: violations.filter((v: any) => v.impact === 'moderate').length,
    minorIssues: violations.filter((v: any) => v.impact === 'minor').length,
    totalPasses: data.passes?.length || 0,
    incomplete: data.incomplete?.length || 0,
    notApplicable: data.notApplicable?.length || 0
  }
}

async function sendNotification(data: any): Promise<void> {
  if (!process.env.NOTIFICATION_WEBHOOK) return

  try {
    await fetch(process.env.NOTIFICATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Test ${data.status}: ${data.summary.passed}/${data.summary.total} passed`,
        attachments: [{
          color: data.status === 'PASSED' ? 'good' : 'danger',
          fields: [
            { title: 'Status', value: data.status, short: true },
            { title: 'Pass Rate', value: `${((data.summary.passed / data.summary.total) * 100).toFixed(1)}%`, short: true },
            { title: 'Duration', value: `${(data.summary.duration / 1000).toFixed(2)}s`, short: true },
            { title: 'Timestamp', value: data.timestamp, short: true }
          ]
        }]
      })
    })
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}

async function uploadArtifacts(outputDir: string, config: any): Promise<void> {
  // Implementation for uploading artifacts to external storage
  // This would integrate with services like AWS S3, Google Cloud Storage, etc.
  console.log('Artifact upload not implemented in this setup')
}

export default globalTeardown