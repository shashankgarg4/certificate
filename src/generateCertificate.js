const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fetch = require("node-fetch");

async function embedImage(pdfDoc, url) {
  const res = await fetch(url);
  const contentType = res.headers.get("content-type");
  const buffer = await res.arrayBuffer();

  if (contentType.includes("png")) {
    return await pdfDoc.embedPng(buffer);
  } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
    return await pdfDoc.embedJpg(buffer);
  } else {
    throw new Error(`Unsupported image format: ${contentType}`);
  }
}

async function generateCertificate(data) {
  const {
    name,
    courseTitle,
    completionDate,
    logoUrl,
    signatureUrl,
    skills = [],
    certificateTitle,
    footerLeftLogo,
    footerRightLogo,
  } = data;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 Landscape

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawCenteredText = (text, y, size, font = timesRomanFont) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = (page.getWidth() - textWidth) / 2;
    page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
  };

  // Border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: page.getWidth() - 60,
    height: page.getHeight() - 60,
    borderColor: rgb(0.7, 0.85, 0.95),
    borderWidth: 4,
  });

  // Header Logo
  if (logoUrl) {
    const logoImg = await embedImage(pdfDoc, logoUrl);
    page.drawImage(logoImg, {
      x: (page.getWidth() - 100) / 2,
      y: 500,
      width: 100,
      height: 30,
    });
  }

  // Course Title
  drawCenteredText(courseTitle, 440, 26, boldFont);

  // Completion Info
  drawCenteredText(`Course completed by ${name}`, 410, 16);
  drawCenteredText(`${completionDate}`, 390, 14);

  // Top Skills Covered Title
  if (certificateTitle) {
    drawCenteredText(certificateTitle, 355, 12);
  }

  // Skills Pill
  if (skills.length > 0) {
    const skill = skills[0];
    const fontSize = 14;
    const padding = 14;
    const skillWidth = boldFont.widthOfTextAtSize(skill, fontSize);
    const pillWidth = skillWidth + padding * 2;
    const pillHeight = 28;
    const x = (page.getWidth() - pillWidth) / 2;
    const y = 325;

    // Filled pill (light gray)
    page.drawRectangle({
      x,
      y,
      width: pillWidth,
      height: pillHeight,
      color: rgb(0.93, 0.93, 0.93),
      borderRadius: 14,
    });

    // Skill text
    page.drawText(skill, {
      x: x + padding,
      y: y + 8,
      size: fontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
  }

  // Signature block
  if (signatureUrl) {
    const signImg = await embedImage(pdfDoc, signatureUrl);
    const signWidth = 130;
    const signHeight = 40;
    const signX = (page.getWidth() - signWidth) / 2;

    page.drawImage(signImg, {
      x: signX,
      y: 160,
      width: signWidth,
      height: signHeight,
    });

    drawCenteredText("Head of Content Strategy, Learning", 140, 10);
  }

  // Footer logos
  if (footerLeftLogo) {
    const leftLogo = await embedImage(pdfDoc, footerLeftLogo);
    page.drawImage(leftLogo, { x: 50, y: 50, width: 60, height: 60 });
  }

  if (footerRightLogo) {
    const rightLogo = await embedImage(pdfDoc, footerRightLogo);
    page.drawImage(rightLogo, {
      x: page.getWidth() - 110,
      y: 50,
      width: 60,
      height: 60,
    });
  }

  return await pdfDoc.save();
}

module.exports = { generateCertificate };
