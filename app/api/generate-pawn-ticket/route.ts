import { NextResponse } from "next/server";
import { createCanvas, loadImage } from "canvas";
import { format } from "date-fns";
import QRCode from "qrcode";
import bwipjs from "bwip-js";
import path from "path";

import { toWords } from "number-to-words";

function capitalizeWords(text: string) {
  return text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function amountToWords(amount: number) {
  if (!amount && amount !== 0) return "";

  const words = toWords(amount);

  return capitalizeWords(`${words} only`);
}

function drawMultilineText(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  for (const word of words) {
    const testLine = line + word + " ";
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && line) {
      cursorY -= 15;
      ctx.fillText(line.trim(), x, cursorY);
      line = word + " ";
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line.trim(), x, cursorY);
  }
}

export async function POST(req: Request) {
  try {
    const { tokenId, tokenMetadata } = await req.json();

    const {
      pawnTicketId,
      pawnShopId,
      borrowerId,
      borrowerSSSId,
      assetType,
      assetDescription,
      assessedValue,
      principalAmount,
      loanStartDate,
      interestRate,
      totalTermsInMonths,
    } = tokenMetadata;

    const pawnShopAddress = `Legarda Branch
2274 Legarda St., Sampaloc, Manila, 
Metro Manila, Philippines`

  const pawnShopOfficer = "Michael Santos" 
   

    const start = new Date(loanStartDate);

    const maturity = new Date(start);
    maturity.setMonth(start.getMonth() + Number(totalTermsInMonths));

    /* ---------------- TEMPLATE ---------------- */

    const templatePath = path.join(
      process.cwd(),
      "public/pawn-templates/pawn-ticket-template.png"
    );

    const template = await loadImage(templatePath);

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(template, 0, 0);

    ctx.fillStyle = "#111827";
    ctx.font = "bold 26px Courier New";
    

/* ---------------- HEADER ---------------- */

ctx.fillText(pawnShopId ?? "Pawn Shop", 210, 185);

ctx.fillText(pawnTicketId, 1150, 105);

/* ---------------- DATES ---------------- */

ctx.fillText(format(start, "PPP"), 200, 230);

ctx.fillText(format(maturity, "PPP"), 1050, 230);

/* ---------------- BORROWER ---------------- */

ctx.fillText(borrowerId ?? "", 280, 345);

ctx.fillText(borrowerSSSId ?? "", 280, 390);

/* ---------------- COLLATERAL ---------------- */

ctx.fillText(assetType ?? "", 250, 475);

ctx.fillText(assetDescription ?? "", 250, 515);

/* ---------------- LOAN DETAILS ---------------- */

ctx.fillText(`₱${principalAmount}`, 900, 620);

drawMultilineText(
  ctx,
  amountToWords(principalAmount),
  220,
  610,
  700,   // max line width
  28     // line spacing
);

ctx.fillText(`${interestRate}%`, 280, 660);

ctx.fillText(`₱${assessedValue}`, 900, 665);

/* ---------------- FOOTER ---------------- */
ctx.fillText(pawnShopAddress ?? "", 220, 730);
ctx.fillText(pawnShopId ?? "", 280, 840);
ctx.fillText(pawnShopOfficer ?? "", 850, 780);

    /* ---------------- QR CODE ---------------- */

    // const qrData = await QRCode.toDataURL(tokenMetadata);

    // const qr = await loadImage(qrData);

    // ctx.drawImage(qr, 1150, 520, 120, 120);

    /* ---------------- BARCODE ---------------- */

    // const barcodeBuffer = await bwipjs.toBuffer({
    //   bcid: "code128",
    //   text: tokenMetadata,
    //   scale: 3,
    //   height: 12,
    //   includetext: true,
    // });

    // const barcode = await loadImage(barcodeBuffer);

    // ctx.drawImage(barcode, 900, 650, 350, 80);

    /* ---------------- WATERMARK ---------------- */

    ctx.save();

    // ctx.translate(canvas.width / 2, canvas.height / 2);

    // ctx.rotate(-Math.PI / 6);

    // ctx.globalAlpha = 0.08;

    // ctx.font = "bold 120px Arial";

    // ctx.textAlign = "center";

    // ctx.fillText("PAWN TICKET", 0, 0);

    // ctx.restore();

    /* ---------------- EXPORT ---------------- */

    const buffer = canvas.toBuffer("image/png");

    const base64 = buffer.toString("base64");

    return NextResponse.json({
      ok: true,
      imageBase64: `data:image/png;base64,${base64}`,
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      { ok: false, error: "Failed to generate pawn ticket" },
      { status: 500 }
    );
  }
}