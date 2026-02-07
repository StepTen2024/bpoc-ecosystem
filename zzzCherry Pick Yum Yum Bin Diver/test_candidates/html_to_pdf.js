#!/usr/bin/env node
/**
 * Convert HTML resumes to PDF using Puppeteer
 */
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function convertHtmlToPdf(htmlPath, pdfPath) {
    const absoluteHtmlPath = path.resolve(htmlPath);
    const absolutePdfPath = path.resolve(pdfPath);

    // Use Chrome headless to print to PDF
    const osascript = `
    tell application "Google Chrome"
      open POSIX file "${absoluteHtmlPath}"
      delay 2
    end tell
  `;

    console.log(`Converting ${path.basename(htmlPath)}...`);

    // Alternative: use system print command
    try {
        execSync(`/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --headless --disable-gpu --print-to-pdf="${absolutePdfPath}" "${absoluteHtmlPath}"`, {
            stdio: 'pipe'
        });
        console.log(`✓ ${path.basename(pdfPath)}`);
        return true;
    } catch (err) {
        return false;
    }
}

async function main() {
    const data = JSON.parse(await fs.readFile('candidate_data.json', 'utf8'));

    console.log('Converting HTML resumes to PDF using Chrome headless...\n');

    let success = 0;
    for (const candidate of data.candidates) {
        const first = candidate.first_name.toLowerCase();
        const last = candidate.last_name.toLowerCase();

        const htmlFile = `resumes/${first}_${last}_resume.html`;
        const pdfFile = `resumes/${first}_${last}_resume.pdf`;

        if (await convertHtmlToPdf(htmlFile, pdfFile)) {
            success++;
        }
    }

    console.log(`\n✓ Converted ${success}/${data.candidates.length} resumes to PDF`);
}

main().catch(console.error);
