import PDFDocument from 'pdfkit';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { prisma } from '../db.js';

export class ExportService {
  /**
   * 1. Screenplay PDF Export (Industry Standard Courier 12pt, exact indentation)
   */
  static async exportScreenplayPDF(documentId: string): Promise<Buffer> {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        project: { include: { owner: true } },
      },
    });

    if (!doc) throw new Error('Document not found');

    return new Promise((resolve, reject) => {
      const pdf = new PDFDocument({
        size: 'LETTER',
        margins: { top: 72, bottom: 72, left: 108, right: 72 }, // Left 1.5", Right 1.0", Top/Bottom 1.0"
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      pdf.on('data', (chunk) => chunks.push(chunk));
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', reject);

      // Title Page
      pdf.font('Courier-Bold').fontSize(24).text(doc.project.name.toUpperCase(), { align: 'center' });
      pdf.moveDown(0.5);
      pdf.font('Courier').fontSize(14).text('Written by', { align: 'center' });
      pdf.moveDown(0.5);
      pdf.font('Courier-Bold').fontSize(14).text(doc.project.owner.name, { align: 'center' });

      if (doc.project.logline) {
        pdf.moveDown(4);
        pdf.font('Courier-Oblique').fontSize(11).text(`"${doc.project.logline}"`, { align: 'center' });
      }

      pdf.moveDown(10);
      pdf.font('Courier').fontSize(10).text(`Draft Version ${doc.currentVersion} • ScriptForge Studio`, { align: 'center' });

      // Begin Screenplay Body
      pdf.addPage();
      pdf.font('Courier').fontSize(12);

      const lines = doc.content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          pdf.moveDown(0.5);
          continue;
        }

        // Scene Heading (INT. / EXT.)
        if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(line)) {
          pdf.moveDown(0.8);
          pdf.font('Courier-Bold').text(line.toUpperCase(), { align: 'left', lineGap: 2 });
        }
        // Transition (CUT TO:, DISSOLVE TO:, FADE OUT.)
        else if (/^(CUT TO:|FADE TO:|DISSOLVE TO:|FLASH CUT TO:|FADE OUT\.|BACK TO)/i.test(line)) {
          pdf.moveDown(0.5);
          pdf.font('Courier-Bold').text(line.toUpperCase(), { align: 'right' });
        }
        // Character Name (e.g. MAYA, DANIEL (O.S.))
        else if (line === line.toUpperCase() && line.length < 35 && !line.includes('.')) {
          pdf.moveDown(0.6);
          pdf.font('Courier-Bold').text(line, { indent: 144 }); // 2.0" from left margin
        }
        // Parenthetical (quietly)
        else if (line.startsWith('(') && line.endsWith(')')) {
          pdf.font('Courier-Oblique').text(line, { indent: 108 }); // 1.5" from left
        }
        // Dialogue
        else if (i > 0 && lines[i - 1].trim() === lines[i - 1].trim().toUpperCase() && lines[i - 1].trim().length < 35) {
          pdf.font('Courier').text(line, { indent: 72, width: 250 }); // 1.0" indent, ~3.5" wide
        }
        // Standard Action line
        else {
          pdf.font('Courier').text(line, { align: 'left', lineGap: 2 });
        }
      }

      // Add Page Numbers (WGA: Top right on subsequent pages)
      const range = pdf.bufferedPageRange();
      for (let i = 1; i < range.count; i++) {
        pdf.switchToPage(i);
        pdf.font('Courier').fontSize(10).text(`${i + 1}.`, 500, 36, { align: 'right' });
      }

      pdf.end();
    });
  }

  /**
   * 2. Final Draft XML (FDX) Export
   */
  static async exportFDX(documentId: string): Promise<string> {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { project: { include: { owner: true } } },
    });

    if (!doc) throw new Error('Document not found');

    const lines = doc.content.split('\n');
    let paragraphsXml = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let type = 'Action';
      if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(line)) {
        type = 'Scene Heading';
      } else if (/^(CUT TO:|FADE TO:|DISSOLVE TO:|FLASH CUT TO:|FADE OUT\.)/i.test(line)) {
        type = 'Transition';
      } else if (line === line.toUpperCase() && line.length < 35 && !line.includes('.')) {
        type = 'Character';
      } else if (line.startsWith('(') && line.endsWith(')')) {
        type = 'Parenthetical';
      } else if (i > 0 && lines[i - 1].trim() === lines[i - 1].trim().toUpperCase() && lines[i - 1].trim().length < 35) {
        type = 'Dialogue';
      }

      const escapedText = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      paragraphsXml += `    <Paragraph Type="${type}">\n      <Text>${escapedText}</Text>\n    </Paragraph>\n`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>
${paragraphsXml}  </Content>
  <HeaderAndFooter>
    <Header>
      <Paragraph Alignment="Right">
        <Text>${doc.project.name.toUpperCase()}</Text>
      </Paragraph>
    </Header>
  </HeaderAndFooter>
</FinalDraft>`;
  }

  /**
   * 3. Fountain Format Export
   */
  static async exportFountain(documentId: string): Promise<string> {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { project: { include: { owner: true } } },
    });

    if (!doc) throw new Error('Document not found');

    const header = `Title: ${doc.project.name}
Credit: Written by
Author: ${doc.project.owner.name}
Draft date: ${new Date().toLocaleDateString()}
Contact: ScriptForge Collaborative Studio

===

`;

    return header + doc.content;
  }

  /**
   * 4. DOCX Export
   */
  static async exportDOCX(documentId: string): Promise<Buffer> {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { project: { include: { owner: true } } },
    });

    if (!doc) throw new Error('Document not found');

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: doc.project.name.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Written by ${doc.project.owner.name}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }),
    ];

    const lines = doc.content.split('\n');
    lines.forEach((line) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: 'Courier New',
              size: 24, // 12pt
              bold: /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(line.trim()),
            }),
          ],
        })
      );
    });

    const docx = new DocxDocument({
      sections: [{ properties: {}, children: paragraphs }],
    });

    return Packer.toBuffer(docx);
  }

  /**
   * 5. Shot List PDF Export
   */
  static async exportShotListPDF(sceneId: string): Promise<Buffer> {
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        shots: { orderBy: { shotNumber: 'asc' } },
        document: { include: { project: true } },
      },
    });

    if (!scene) throw new Error('Scene not found');

    return new Promise((resolve, reject) => {
      const pdf = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      pdf.on('data', (chunk) => chunks.push(chunk));
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', reject);

      pdf.font('Helvetica-Bold').fontSize(18).text(`SHOT LIST: ${scene.title}`);
      pdf.font('Helvetica').fontSize(10).text(`Project: ${scene.document.project.name} • Scene #${scene.sceneNumber || 1}`);
      pdf.moveDown(1);

      // Table Header
      pdf.font('Helvetica-Bold').fontSize(10);
      pdf.text('#', 40, 90, { width: 30 });
      pdf.text('Type', 75, 90, { width: 85 });
      pdf.text('Lens', 165, 90, { width: 50 });
      pdf.text('Movement', 220, 90, { width: 75 });
      pdf.text('Dur.', 300, 90, { width: 40 });
      pdf.text('Description / Action', 345, 90, { width: 210 });

      pdf.moveTo(40, 105).lineTo(555, 105).stroke();

      let y = 115;
      pdf.font('Helvetica').fontSize(9);

      scene.shots.forEach((shot) => {
        pdf.text(shot.shotNumber.toString(), 40, y);
        pdf.text(shot.shotType, 75, y);
        pdf.text(shot.lens, 165, y);
        pdf.text(shot.movement, 220, y);
        pdf.text(`${shot.duration}s`, 300, y);
        pdf.text(shot.description || shot.purpose || '—', 345, y, { width: 210 });
        y += 28;
      });

      pdf.end();
    });
  }
}
