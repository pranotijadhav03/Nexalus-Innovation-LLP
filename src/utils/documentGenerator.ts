import { PlanOrder, ReceiptSettings } from '../types';
import { NEXALUS_LOGO_BASE64 } from './companyLogoBase64';
import { getCachedReceiptSettings } from '../firebase/services';

export interface CompanyDetails {
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  logoBase64: string;
}

export const VERIFIED_COMPANY_DETAILS: CompanyDetails = {
  name: 'Nexalus Innovations LLP',
  tagline: 'Enterprise Infrastructure & High-Speed Optical Broadband',
  address: 'Shop No.5, Sankalp Enclave Chowk, 100 Feet Rd, near Dhamani Road, opposite Kokitkar Garden, Vishrambag',
  city: 'Sangli-Miraj-Kupwad',
  state: 'Maharashtra',
  pincode: '416415',
  phone: '+91 9158886444',
  email: 'innovations@nexalusinnovations.com',
  website: 'https://nexalusinnovations.com',
  logoBase64: NEXALUS_LOGO_BASE64
};

export function formatIndianCurrency(amount: number | string): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]/g, '')) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(num);
}

export function formatDateIndian(isoDateString?: string): string {
  if (!isoDateString) return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  try {
    const d = new Date(isoDateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoDateString;
  }
}

/**
 * Opens a dedicated print window with styled A4 document.
 */
export function printDocumentHtml(title: string, htmlContent: string) {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups to print or download documents.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Caveat:wght@600&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 portrait;
          margin: 6mm 10mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0;
          padding: 0;
          background-color: #f1f5f9;
        }
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1e293b;
          font-size: 11.5px;
          line-height: 1.35;
          padding: 16px;
        }
        .invoice-sheet {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 6px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          border: 1px solid #cbd5e1;
        }
        @media print {
          html, body {
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .invoice-sheet {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
          table, tr, td {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="max-width:800px; margin:0 auto 12px auto; background:#152238; color:#fff; padding:10px 18px; display:flex; align-items:center; justify-content:space-between; border-radius:8px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-weight:800; font-size:12.5px; letter-spacing:0.02em;">Official Document Print Preview</span>
          <span style="color:#94a3b8; font-size:11px;">(Single Page A4 Standard)</span>
        </div>
        <button onclick="window.print()" style="background:#2563eb; color:#fff; border:none; padding:7px 20px; border-radius:6px; font-weight:700; cursor:pointer; font-size:11.5px; box-shadow:0 2px 8px rgba(37,99,235,0.4);">
          Print / Save as PDF
        </button>
      </div>
      <div class="invoice-sheet">
        ${htmlContent}
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 450);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generate HTML string for COD Booking Confirmation Slip
 */
export function generateBookingSlipHtml(order: PlanOrder, customSettings?: ReceiptSettings): string {
  const settings = customSettings || getCachedReceiptSettings();
  const c = {
    ...VERIFIED_COMPANY_DETAILS,
    name: settings.companyName || VERIFIED_COMPANY_DETAILS.name,
    tagline: (settings.showTagline && (settings.tagline || VERIFIED_COMPANY_DETAILS.tagline)) || '',
    address: settings.address || VERIFIED_COMPANY_DETAILS.address,
    city: settings.city || VERIFIED_COMPANY_DETAILS.city,
    state: settings.state || VERIFIED_COMPANY_DETAILS.state,
    pincode: settings.pincode || VERIFIED_COMPANY_DETAILS.pincode,
    phone: settings.phone || VERIFIED_COMPANY_DETAILS.phone,
    email: settings.email || VERIFIED_COMPANY_DETAILS.email,
    website: settings.website || VERIFIED_COMPANY_DETAILS.website
  };
  const priceFormatted = formatIndianCurrency(order.price);
  const hasBottomContent = settings.showPaymentInfo !== false || settings.showOfficialNotice !== false || Boolean(settings.showSignatory);

  return `
    <div style="font-family:'Plus Jakarta Sans', -apple-system, sans-serif; color:#1e293b; background:#ffffff;">
      <!-- TOP DEEP NAVY HEADER BLOCK -->
      <div style="background-color:#152238; color:#ffffff; padding:16px 24px; position:relative; overflow:hidden;">
        <!-- Subtle decorative lines -->
        <div style="position:absolute; right:-20px; top:-20px; width:220px; height:180px; opacity:0.1; pointer-events:none;">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="#ffffff" stroke-width="4"/>
            <circle cx="100" cy="100" r="65" stroke="#ffffff" stroke-width="3"/>
            <circle cx="100" cy="100" r="40" stroke="#ffffff" stroke-width="2"/>
          </svg>
        </div>

        <table style="width:100%; border-collapse:collapse; position:relative; z-index:2;" cellpadding="0" cellspacing="0">
          <tr>
            <!-- Company Info Left -->
            <td style="vertical-align:top; width:58%;">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                <div style="background:#ffffff; border-radius:6px; padding:3px 6px; display:inline-block;">
                  <img src="${c.logoBase64}" alt="${c.name}" style="height:32px; width:auto; display:block; object-fit:contain;" />
                </div>
                <div>
                  <div style="font-size:15px; font-weight:800; letter-spacing:-0.02em; color:#ffffff; line-height:1.2;">${c.name}</div>
                  ${c.tagline ? `<div style="font-size:10px; color:#93c5fd; font-weight:600; margin-top:1px;">${c.tagline}</div>` : ''}
                </div>
              </div>
              <div style="font-size:10px; color:#cbd5e1; line-height:1.35; max-width:380px;">
                ${c.address}, ${c.city}, ${c.state} - ${c.pincode}<br>
                Tel: <strong style="color:#ffffff;">${c.phone}</strong> &bull; Email: ${c.email}
              </div>
            </td>

            <!-- Document Title & Details Right -->
            <td style="vertical-align:top; text-align:right; width:42%;">
              <div style="font-size:20px; font-weight:900; letter-spacing:0.04em; color:#ffffff; text-transform:uppercase;">
                BOOKING SLIP
              </div>
              <div style="font-size:11.5px; font-weight:700; color:#fde68a; margin-top:2px; font-family:monospace;">
                Ref No. #${order.id}
              </div>

              <div style="margin-top:8px; font-size:10.5px; color:#cbd5e1; line-height:1.45;">
                <div>Booking Date: <strong style="color:#ffffff;">${formatDateIndian(order.createdAt)}</strong></div>
                <div>Payment Terms: <span style="background:${order.paymentStatus === 'paid' ? '#dcfce7' : '#fef3c7'}; color:${order.paymentStatus === 'paid' ? '#166534' : '#92400e'}; padding:1px 6px; border-radius:3px; font-weight:800; font-size:9.5px; text-transform:uppercase;">${order.paymentStatus === 'paid' ? 'PAID &amp; CONFIRMED' : 'Pay on Install (COD)'}</span></div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- MAIN BODY CONTENT -->
      <div style="padding:16px 24px;">
        <!-- BILLED TO / INSTALLATION PREMISES -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top; width:${settings.showInstallationPremises !== false ? '50%' : '100%'}; padding-right:12px; padding-bottom:10px;">
              <div style="font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#0f172a; border-bottom:1.5px solid #0f172a; padding-bottom:2px; margin-bottom:5px; display:inline-block;">
                Billed To:
              </div>
              <div style="font-size:12.5px; font-weight:800; color:#0f172a;">${order.customerName}</div>
              <div style="font-size:10.5px; color:#475569; margin-top:2px;">Mobile: <strong style="color:#0f172a;">${order.phone}</strong></div>
              <div style="font-size:10.5px; color:#475569; margin-top:1px;">Email: ${order.email}</div>
              <div style="font-size:10px; color:#64748b; margin-top:1px;">Location: ${order.city}, Maharashtra</div>
            </td>

            ${settings.showInstallationPremises !== false ? `
            <td style="vertical-align:top; width:50%; padding-left:12px; padding-bottom:10px;">
              <div style="font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#0f172a; border-bottom:1.5px solid #0f172a; padding-bottom:2px; margin-bottom:5px; display:inline-block;">
                Service &amp; Installation Premises:
              </div>
              <div style="font-size:11px; font-weight:600; color:#0f172a; line-height:1.35;">${order.address}</div>
              <div style="font-size:10.5px; font-weight:700; color:#0f172a; margin-top:2px;">${order.city} - ${order.pincode}</div>
            </td>` : ''}
          </tr>
        </table>

        <!-- LINE ITEMS TABLE -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px;" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="background-color:#152238; color:#ffffff;">
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:center; width:32px;">No.</th>
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:left;">Description / Broadband Subscription</th>
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:left;">Provider</th>
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:center;">Speed</th>
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:center;">Billing Cycle</th>
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:right;">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
              <td style="padding:7px 10px; font-size:10.5px; text-align:center; color:#64748b; font-weight:600;">1</td>
              <td style="padding:7px 10px; font-size:11px;">
                <strong style="color:#0f172a; font-size:11.5px;">${order.planName}</strong>
                <div style="font-size:9.5px; color:#64748b; margin-top:1px;">
                  High-Speed Optical Fiber Internet (Truly Unlimited Data &amp; Wi-Fi Access)
                </div>
              </td>
              <td style="padding:7px 10px; font-size:10.5px; font-weight:600; color:#334155;">${order.providerName}</td>
              <td style="padding:7px 10px; font-size:10.5px; font-weight:800; color:#2563eb; text-align:center;">${order.speed}</td>
              <td style="padding:7px 10px; font-size:10.5px; text-transform:capitalize; color:#334155; text-align:center;">${order.billingPeriod.replace(/_/g, ' ')}</td>
              <td style="padding:7px 10px; font-size:11.5px; font-weight:800; color:#0f172a; text-align:right;">${priceFormatted}</td>
            </tr>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
              <td style="padding:6px 10px; font-size:10px; text-align:center; color:#64748b; font-weight:600;">2</td>
              <td style="padding:6px 10px; font-size:10px; color:#475569;" colSpan="4">
                Standard Optical FTTH Line Drop, ONU Modem Setup &amp; Verification
              </td>
              <td style="padding:6px 10px; font-size:10.5px; font-weight:700; color:#16a34a; text-align:right;">Included (₹0.00)</td>
            </tr>
          </tbody>
        </table>

        <!-- TOTALS BREAKDOWN -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:55%;"></td>
            <td style="width:45%; vertical-align:top;">
              <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:2px 0; font-size:10.5px; color:#475569;">Subtotal:</td>
                  <td style="padding:2px 0; font-size:10.5px; font-weight:700; color:#0f172a; text-align:right;">${priceFormatted}</td>
                </tr>
                <tr>
                  <td style="padding:2px 0; font-size:10.5px; color:#475569;">Installation / Setup:</td>
                  <td style="padding:2px 0; font-size:10.5px; font-weight:700; color:#16a34a; text-align:right;">Standard Included</td>
                </tr>
                ${settings.showGstRow !== false ? `
                <tr>
                  <td style="padding:2px 0; font-size:10.5px; color:#475569;">Taxes (GST ${settings.gstRate ?? 18}%):</td>
                  <td style="padding:2px 0; font-size:10px; color:#64748b; text-align:right;">
                    ${settings.gstInclusive !== false ? 'Inclusive in Tariff' : `Extra (${settings.gstRate ?? 18}%)`}
                    ${settings.gstNumber ? `<br><span style="font-size:9px; color:#64748b;">GSTIN: ${settings.gstNumber}</span>` : ''}
                  </td>
                </tr>` : ''}
${order.paymentStatus === 'paid' ? `
                <tr>
                  <td style="padding:2px 0; font-size:10.5px; color:#475569;">Payment Status:</td>
                  <td style="padding:2px 0; font-size:10.5px; font-weight:800; color:#16a34a; text-align:right;">PAID &amp; CONFIRMED</td>
                </tr>
                <tr>
                  <td style="padding:6px 0 2px 0; font-size:12px; font-weight:800; color:#0f172a;">Amount Due:</td>
                  <td style="padding:6px 0 2px 0; text-align:right;">
                    <div style="display:inline-block; background-color:#dcfce7; color:#166534; font-size:13.5px; font-weight:900; padding:4px 12px; border-radius:5px;">
                      ₹0.00 (Fully Settled)
                    </div>
                  </td>
                </tr>` : `
                <tr>
                  <td style="padding:6px 0 2px 0; font-size:12px; font-weight:800; color:#0f172a;">Amount Due:</td>
                  <td style="padding:6px 0 2px 0; text-align:right;">
                    <div style="display:inline-block; background-color:#e0e7ff; color:#1e1b4b; font-size:13.5px; font-weight:900; padding:4px 12px; border-radius:5px;">
                      ${priceFormatted}
                    </div>
                  </td>
                </tr>`}
              </table>
            </td>
          </tr>
        </table>

        <!-- PAYMENT INFO + NOTES + AUTHORIZED SIGNATURE (Conditional) -->
        ${hasBottomContent ? `
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px; border-top:1px solid #e2e8f0; padding-top:10px;" cellpadding="0" cellspacing="0">
          <tr>
            <!-- Left Info Block -->
            <td style="vertical-align:top; width:${settings.showSignatory ? '60%' : '100%'}; padding-right:${settings.showSignatory ? '16px' : '0'}; padding-top:8px;">
              ${settings.showPaymentInfo !== false ? `
              <div style="font-size:10px; font-weight:800; color:#0f172a; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:3px;">
                Payment Info
              </div>
              <div style="font-size:10px; color:#475569; line-height:1.4;">
                Account Name: <strong>${c.name}</strong><br>
                Payment Method: <strong style="text-transform:uppercase; color:#0f172a;">${(order.paymentDetails?.method || order.paymentMethod || 'cash_on_installation').replace(/_/g, ' ')}</strong><br>
                Payment Status: <strong style="color:${order.paymentStatus === 'paid' ? '#16a34a' : '#b45309'}; text-transform:uppercase;">${order.paymentStatus === 'paid' ? 'PAID &amp; CONFIRMED' : 'Due Upon Physical Installation'}</strong>
              </div>` : ''}

              ${settings.showOfficialNotice !== false ? `
              <div style="${settings.showPaymentInfo !== false ? 'margin-top:8px;' : ''}">
                <div style="font-size:10px; font-weight:800; color:#0f172a; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px;">
                  Official Notice
                </div>
                <div style="font-size:9.5px; color:#64748b; line-height:1.35;">
                  ${settings.bookingSlipNotice || 'This document confirms broadband reservation and technician scheduling. Payment must be made to our verified service engineer upon physical installation.'}
                </div>
              </div>` : ''}
            </td>

            <!-- Right Signature Block (Rendered ONLY if showSignatory is true) -->
            ${settings.showSignatory ? `
            <td style="vertical-align:bottom; text-align:right; width:40%; padding-top:8px;">
              <div style="display:inline-block; text-align:center;">
                ${settings.signatureImageUrl ? `
                <div style="margin-bottom:2px;">
                  <img src="${settings.signatureImageUrl}" alt="Authorized Signature" style="max-height:46px; max-width:160px; object-fit:contain; display:inline-block;" />
                </div>` : `
                <div style="font-family:'Caveat', 'Dancing Script', cursive; font-size:24px; color:#1e293b; line-height:1; margin-bottom:3px; letter-spacing:0.02em;">
                  ${settings.signatoryName || 'Authorized Signatory'}
                </div>`}
                <div style="border-top:1px solid #94a3b8; width:160px; margin:0 auto 3px auto;"></div>
                <div style="font-size:9.5px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.05em;">
                  ${settings.signatoryTitle || 'Authorized Signatory'}
                </div>
                ${settings.signatureImageUrl && settings.signatoryName && settings.signatoryName !== 'Authorized Signatory' ? `<div style="font-size:9px; color:#64748b; margin-top:1px;">${settings.signatoryName}</div>` : ''}
                ${settings.signatorySubtitle ? `<div style="font-size:8.5px; color:#94a3b8; margin-top:1px;">${settings.signatorySubtitle}</div>` : ''}
              </div>
            </td>` : ''}
          </tr>
        </table>` : ''}

        <!-- FOOTER BAR -->
        <table style="width:100%; border-collapse:collapse; border-top:1px solid #e2e8f0; padding-top:8px; font-size:9.5px; color:#64748b;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:left; font-weight:600; color:#334155;">
              ${settings.footerNote || 'Thank you for choosing ' + c.name}
            </td>
            <td style="text-align:right;">
              Email: ${c.email} &bull; Website: ${c.website} &bull; Tel: ${c.phone}
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
}

/**
 * Generate HTML string for Official Paid Payment Receipt
 */
export function generatePaidReceiptHtml(order: PlanOrder, customSettings?: ReceiptSettings): string {
  const settings = customSettings || getCachedReceiptSettings();
  const c = {
    ...VERIFIED_COMPANY_DETAILS,
    name: settings.companyName || VERIFIED_COMPANY_DETAILS.name,
    tagline: (settings.showTagline && (settings.tagline || VERIFIED_COMPANY_DETAILS.tagline)) || '',
    address: settings.address || VERIFIED_COMPANY_DETAILS.address,
    city: settings.city || VERIFIED_COMPANY_DETAILS.city,
    state: settings.state || VERIFIED_COMPANY_DETAILS.state,
    pincode: settings.pincode || VERIFIED_COMPANY_DETAILS.pincode,
    phone: settings.phone || VERIFIED_COMPANY_DETAILS.phone,
    email: settings.email || VERIFIED_COMPANY_DETAILS.email,
    website: settings.website || VERIFIED_COMPANY_DETAILS.website
  };
  const receiptNo = order.receiptNumber || order.paymentDetails?.receiptNumber || `RCP-2026-${order.id.replace('ORD-PLN-', '')}`;
  const paidAmount = order.paymentDetails?.amount || (typeof order.price === 'number' ? order.price : parseFloat(String(order.price)) || 0);
  const paidFormatted = formatIndianCurrency(paidAmount);
  const paymentDate = order.paymentDetails?.collectedAt || order.updatedAt;
  const hasBottomContent = settings.showPaymentInfo !== false || settings.showOfficialNotice !== false || Boolean(settings.showSignatory);

  return `
    <div style="font-family:'Plus Jakarta Sans', -apple-system, sans-serif; color:#1e293b; background:#ffffff;">
      <!-- TOP DEEP NAVY HEADER BLOCK -->
      <div style="background-color:#152238; color:#ffffff; padding:16px 24px; position:relative; overflow:hidden;">
        <!-- Subtle decorative lines -->
        <div style="position:absolute; right:-20px; top:-20px; width:220px; height:180px; opacity:0.1; pointer-events:none;">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="#ffffff" stroke-width="4"/>
            <circle cx="100" cy="100" r="65" stroke="#ffffff" stroke-width="3"/>
            <circle cx="100" cy="100" r="40" stroke="#ffffff" stroke-width="2"/>
          </svg>
        </div>

        <table style="width:100%; border-collapse:collapse; position:relative; z-index:2;" cellpadding="0" cellspacing="0">
          <tr>
            <!-- Company Info Left -->
            <td style="vertical-align:top; width:58%;">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                <div style="background:#ffffff; border-radius:6px; padding:3px 6px; display:inline-block;">
                  <img src="${c.logoBase64}" alt="${c.name}" style="height:32px; width:auto; display:block; object-fit:contain;" />
                </div>
                <div>
                  <div style="font-size:15px; font-weight:800; letter-spacing:-0.02em; color:#ffffff; line-height:1.2;">${c.name}</div>
                  ${c.tagline ? `<div style="font-size:10px; color:#93c5fd; font-weight:600; margin-top:1px;">${c.tagline}</div>` : ''}
                </div>
              </div>
              <div style="font-size:10px; color:#cbd5e1; line-height:1.35; max-width:380px;">
                ${c.address}, ${c.city}, ${c.state} - ${c.pincode}<br>
                Tel: <strong style="color:#ffffff;">${c.phone}</strong> &bull; Email: ${c.email}
              </div>
            </td>

            <!-- Document Title & Details Right -->
            <td style="vertical-align:top; text-align:right; width:42%;">
              <div style="font-size:20px; font-weight:900; letter-spacing:0.04em; color:#ffffff; text-transform:uppercase;">
                PAYMENT RECEIPT
              </div>
              <div style="font-size:11.5px; font-weight:700; color:#34d399; margin-top:2px; font-family:monospace;">
                Ref No. ${receiptNo}
              </div>

              <div style="margin-top:8px; font-size:10.5px; color:#cbd5e1; line-height:1.45;">
                <div>Invoice Date: <strong style="color:#ffffff;">${formatDateIndian(order.createdAt)}</strong></div>
                <div>Payment Date: <strong style="color:#ffffff;">${formatDateIndian(paymentDate)}</strong></div>
                <div>Payment Status: <span style="background:#d1fae5; color:#065f46; padding:1px 6px; border-radius:3px; font-weight:800; font-size:9.5px; text-transform:uppercase;">PAID &amp; CONFIRMED</span></div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- MAIN BODY CONTENT -->
      <div style="padding:16px 24px;">
        <!-- BILLED TO / INSTALLATION PREMISES -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top; width:${settings.showInstallationPremises !== false ? '50%' : '100%'}; padding-right:12px; padding-bottom:10px;">
              <div style="font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#0f172a; border-bottom:1.5px solid #0f172a; padding-bottom:2px; margin-bottom:5px; display:inline-block;">
                Billed To:
              </div>
              <div style="font-size:12.5px; font-weight:800; color:#0f172a;">${order.customerName}</div>
              <div style="font-size:10.5px; color:#475569; margin-top:2px;">Mobile: <strong style="color:#0f172a;">${order.phone}</strong></div>
              <div style="font-size:10.5px; color:#475569; margin-top:1px;">Email: ${order.email}</div>
              <div style="font-size:10px; color:#64748b; margin-top:1px;">Location: ${order.city}, Maharashtra</div>
            </td>

            ${settings.showInstallationPremises !== false ? `
            <td style="vertical-align:top; width:50%; padding-left:12px; padding-bottom:10px;">
              <div style="font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#0f172a; border-bottom:1.5px solid #0f172a; padding-bottom:2px; margin-bottom:5px; display:inline-block;">
                Service &amp; Installation Premises:
              </div>
              <div style="font-size:11px; font-weight:600; color:#0f172a; line-height:1.35;">${order.address}</div>
              <div style="font-size:10.5px; font-weight:700; color:#0f172a; margin-top:2px;">${order.city} - ${order.pincode}</div>
            </td>` : ''}
          </tr>
        </table>

        <!-- LINE ITEMS TABLE -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px;" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="background-color:#152238; color:#ffffff;">
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:center; width:32px;">No.</th>
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:left;">Description / Broadband Subscription</th>
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:left;">Provider</th>
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:center;">Speed</th>
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:center;">Billing Cycle</th>
              <th style="padding:6px 10px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; text-align:right;">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
              <td style="padding:7px 10px; font-size:10.5px; text-align:center; color:#64748b; font-weight:600;">1</td>
              <td style="padding:7px 10px; font-size:11px;">
                <strong style="color:#0f172a; font-size:11.5px;">${order.planName}</strong>
                <div style="font-size:9.5px; color:#64748b; margin-top:1px;">
                  High-Speed Optical Broadband Service Provisioning &amp; Unlimited Access
                </div>
              </td>
              <td style="padding:7px 10px; font-size:10.5px; font-weight:600; color:#334155;">${order.providerName}</td>
              <td style="padding:7px 10px; font-size:10.5px; font-weight:800; color:#2563eb; text-align:center;">${order.speed}</td>
              <td style="padding:7px 10px; font-size:10.5px; text-transform:capitalize; color:#334155; text-align:center;">${order.billingPeriod.replace(/_/g, ' ')}</td>
              <td style="padding:7px 10px; font-size:11.5px; font-weight:800; color:#0f172a; text-align:right;">${paidFormatted}</td>
            </tr>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
              <td style="padding:6px 10px; font-size:10px; text-align:center; color:#64748b; font-weight:600;">2</td>
              <td style="padding:6px 10px; font-size:10px; color:#475569;" colSpan="4">
                Optical Drop Installation, Terminal Modem Configuration &amp; Signal Commissioning
              </td>
              <td style="padding:6px 10px; font-size:10.5px; font-weight:700; color:#16a34a; text-align:right;">Included (₹0.00)</td>
            </tr>
          </tbody>
        </table>

        <!-- TOTALS BREAKDOWN -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:55%;"></td>
            <td style="width:45%; vertical-align:top;">
              <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:2px 0; font-size:10.5px; color:#475569;">Subtotal:</td>
                  <td style="padding:2px 0; font-size:10.5px; font-weight:700; color:#0f172a; text-align:right;">${paidFormatted}</td>
                </tr>
                <tr>
                  <td style="padding:2px 0; font-size:10.5px; color:#475569;">Installation / Setup:</td>
                  <td style="padding:2px 0; font-size:10.5px; font-weight:700; color:#16a34a; text-align:right;">Standard Included</td>
                </tr>
                ${settings.showGstRow !== false ? `
                <tr>
                  <td style="padding:2px 0; font-size:10.5px; color:#475569;">Taxes (GST ${settings.gstRate ?? 18}%):</td>
                  <td style="padding:2px 0; font-size:10px; color:#64748b; text-align:right;">
                    ${settings.gstInclusive !== false ? 'Inclusive in Tariff' : `Extra (${settings.gstRate ?? 18}%)`}
                    ${settings.gstNumber ? `<br><span style="font-size:9px; color:#64748b;">GSTIN: ${settings.gstNumber}</span>` : ''}
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:6px 0 2px 0; font-size:12px; font-weight:800; color:#0f172a;">Amount Paid:</td>
                  <td style="padding:6px 0 2px 0; text-align:right;">
                    <div style="display:inline-block; background-color:#e0e7ff; color:#1e1b4b; font-size:13.5px; font-weight:900; padding:4px 12px; border-radius:5px;">
                      ${paidFormatted}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- PAYMENT INFO + NOTES + AUTHORIZED SIGNATURE (Conditional) -->
        ${hasBottomContent ? `
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px; border-top:1px solid #e2e8f0; padding-top:10px;" cellpadding="0" cellspacing="0">
          <tr>
            <!-- Left Info Block -->
            <td style="vertical-align:top; width:${settings.showSignatory ? '60%' : '100%'}; padding-right:${settings.showSignatory ? '16px' : '0'}; padding-top:8px;">
              ${settings.showPaymentInfo !== false ? `
              <div style="font-size:10px; font-weight:800; color:#0f172a; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:3px;">
                Payment Info
              </div>
              <div style="font-size:10px; color:#475569; line-height:1.4;">
                Account Name: <strong>${c.name}</strong><br>
                Payment Mode: <strong style="text-transform:uppercase; color:#0f172a;">${(order.paymentDetails?.method || order.paymentMethod).replace(/_/g, ' ')}</strong><br>
                ${order.paymentDetails?.reference ? `Transaction Ref: <strong style="color:#2563eb;">${order.paymentDetails.reference}</strong><br>` : ''}
                Settlement Status: <strong style="color:#059669;">PAID &amp; CONFIRMED</strong>
              </div>` : ''}

              ${settings.showOfficialNotice !== false ? `
              <div style="${settings.showPaymentInfo !== false ? 'margin-top:8px;' : ''}">
                <div style="font-size:10px; font-weight:800; color:#0f172a; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px;">
                  Notes
                </div>
                <div style="font-size:9.5px; color:#64748b; line-height:1.35;">
                  ${settings.paidReceiptNotice || `Please retain this receipt for official accounting and warranty records. High-speed optical broadband internet service is fully settled and active under Order Ref #${order.id}. For billing inquiries or technical service assistance, contact our Sangli central team at ${c.phone} or ${c.email}.`}
                </div>
              </div>` : ''}
            </td>

            <!-- Right Signature Block (Rendered ONLY if showSignatory is true) -->
            ${settings.showSignatory ? `
            <td style="vertical-align:bottom; text-align:right; width:40%; padding-top:8px;">
              <div style="display:inline-block; text-align:center;">
                ${settings.signatureImageUrl ? `
                <div style="margin-bottom:2px;">
                  <img src="${settings.signatureImageUrl}" alt="Authorized Signature" style="max-height:46px; max-width:160px; object-fit:contain; display:inline-block;" />
                </div>` : `
                <div style="font-family:'Caveat', 'Dancing Script', cursive; font-size:24px; color:#1e293b; line-height:1; margin-bottom:3px; letter-spacing:0.02em;">
                  ${settings.signatoryName || 'Authorized Signatory'}
                </div>`}
                <div style="border-top:1px solid #94a3b8; width:160px; margin:0 auto 3px auto;"></div>
                <div style="font-size:9.5px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.05em;">
                  ${settings.signatoryTitle || 'Authorized Signatory'}
                </div>
                ${settings.signatureImageUrl && settings.signatoryName && settings.signatoryName !== 'Authorized Signatory' ? `<div style="font-size:9px; color:#64748b; margin-top:1px;">${settings.signatoryName}</div>` : ''}
                ${settings.signatorySubtitle ? `<div style="font-size:8.5px; color:#94a3b8; margin-top:1px;">${settings.signatorySubtitle}</div>` : ''}
              </div>
            </td>` : ''}
          </tr>
        </table>` : ''}

        <!-- FOOTER BAR -->
        <table style="width:100%; border-collapse:collapse; border-top:1px solid #e2e8f0; padding-top:8px; font-size:9.5px; color:#64748b;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:left; font-weight:600; color:#334155;">
              ${settings.footerNote || 'Thank you for choosing ' + c.name}
            </td>
            <td style="text-align:right;">
              Email: ${c.email} &bull; Website: ${c.website} &bull; Tel: ${c.phone}
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
}
