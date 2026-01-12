#!/usr/bin/env npx tsx
// ============================================
// AI COMPREHENSIVE TEST SCRIPT
// Run with: npx tsx test-ai-comprehensive.ts [numGames]
// ============================================

import { analyzeAI, formatAnalysisReport } from './src/game/ai/analyzer';

const numGames = parseInt(process.argv[2] || '500', 10);

console.log(`\n🎴 Running AI analysis on ${numGames} hands...\n`);
console.log('This may take a moment...\n');

const startTime = Date.now();
const result = analyzeAI(numGames);
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

console.log(formatAnalysisReport(result));
console.log(`\n⏱️  Analysis completed in ${elapsed}s`);
console.log(`   (${(numGames / parseFloat(elapsed)).toFixed(0)} hands/second)\n`);

// Exit with error if critical issues found
if (result.issues.some(i => i.severity === 'critical')) {
  console.log('❌ CRITICAL ISSUES FOUND - AI has bugs!\n');
  process.exit(1);
}

// Warn if too many high issues
const highIssueRate = result.issues.filter(i => i.severity === 'high').length / result.stats.totalPicks;
if (highIssueRate > 0.1) {
  console.log(`⚠️  HIGH ISSUE RATE: ${(highIssueRate * 100).toFixed(1)}% of hands had high-severity issues\n`);
  process.exit(1);
}

// Check picker win rate is reasonable (historical is ~65-70%)
const pickerWinRate = result.stats.pickerWins / result.stats.totalPicks;
if (pickerWinRate < 0.50 || pickerWinRate > 0.80) {
  console.log(`⚠️  UNUSUAL PICKER WIN RATE: ${(pickerWinRate * 100).toFixed(1)}% (expected 55-75%)\n`);
}

console.log('✅ AI analysis complete - no critical issues found\n');
