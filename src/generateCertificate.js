const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fetch = require("node-fetch");

async function generateCertificate({
  name,
  courseTitle,
  completionDate,
  logoUrl,
  skills = [],
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const subFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Draw border
  page.drawRectangle({
    x: 10,
    y: 10,
    width: 580,
    height: 780,
    borderColor: rgb(0.6, 0.6, 0.6),
    borderWidth: 1.5,
  });

  // Embed logo
  if (logoUrl) {
    const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImage, {
      x: (600 - 110) / 2,
      y: 700,
      width: 110,
      height: 60,
    });
  }

  const drawCenteredText = (text, y, size, font, color = rgb(0, 0, 0)) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (600 - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  // Certificate text
  drawCenteredText("CERTIFICATE OF COMPLETION", 650, 14, titleFont);
  drawCenteredText("THIS CERTIFIES THAT", 620, 10, subFont);
  drawCenteredText(name.toUpperCase(), 590, 26, titleFont);
  drawCenteredText(
    "Has successfully completed",
    560,
    10,
    subFont,
    rgb(0.15, 0.35, 0.7)
  );

  const words = courseTitle.split(" ");
  const mid = Math.ceil(words.length / 2);
  drawCenteredText(words.slice(0, mid).join(" "), 540, 14, titleFont);
  drawCenteredText(words.slice(mid).join(" "), 520, 14, titleFont);

  drawCenteredText(
    "By: Prof. John Smith",
    500,
    10,
    italicFont,
    rgb(0.25, 0.25, 0.25)
  );

  const pillY = 470;
  const fontSize = 10;
  const spacing = 12;
  const pills = skills.slice(0, 3).map((skill) => {
    const width = titleFont.widthOfTextAtSize(skill, fontSize) + 24;
    return { skill, width };
  });

  let totalWidth =
    pills.reduce((sum, p) => sum + p.width, 0) + (pills.length - 1) * spacing;
  let startX = (600 - totalWidth) / 2;

  pills.forEach(({ skill, width }) => {
    page.drawRectangle({
      x: startX,
      y: pillY,
      width,
      height: 20,
      color: rgb(0.9, 0.9, 0.95),
    });
    page.drawText(skill, {
      x: startX + 12,
      y: pillY + 5,
      size: fontSize,
      font: titleFont,
      color: rgb(0.1, 0.1, 0.3),
    });
    startX += width + spacing;
  });

  // Footer
  page.drawText(`COMPLETION DATE:   ${completionDate}`, {
    x: 30,
    y: 80,
    size: 10,
    font: subFont,
    color: rgb(0, 0, 0),
  });

  const creditsText = "CREDITS: 1.0 SA-CME";
  const creditWidth = subFont.widthOfTextAtSize(creditsText, 10);
  page.drawText(creditsText, {
    x: 600 - creditWidth - 30,
    y: 80,
    size: 10,
    font: subFont,
    color: rgb(0, 0, 0),
  });

  drawCenteredText("COMPANY NAME", 60, 10, titleFont);
  drawCenteredText("Certificate Information Text", 45, 10, subFont);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes; // ✅ This is now returned
}

module.exports = { generateCertificate };
