import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, CheckCircle2, Clock } from 'lucide-react';
import { PlanOrder, ReceiptSettings } from '../../types';
import {
  generateBookingSlipHtml,
  generatePaidReceiptHtml,
  printDocumentHtml,
  VERIFIED_COMPANY_DETAILS,
  formatIndianCurrency,
  formatDateIndian
} from '../../utils/documentGenerator';
import { getCachedReceiptSettings, getReceiptSettings, subscribeReceiptSettings } from '../../firebase/services';

export type DocumentType = 'booking_slip' | 'paid_receipt';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PlanOrder | null;
  documentType: DocumentType;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  order,
  documentType
}) => {
  const [settings, setSettings] = useState<ReceiptSettings>(() => getCachedReceiptSettings());
  const [activeType, setActiveType] = useState<DocumentType>(() => {
    if (order?.paymentStatus === 'paid') return 'paid_receipt';
    return documentType;
  });

  useEffect(() => {
    if (order?.paymentStatus === 'paid') {
      setActiveType('paid_receipt');
    } else {
      setActiveType(documentType);
    }
  }, [isOpen, order?.id, order?.paymentStatus, documentType]);

  useEffect(() => {
    if (isOpen) {
      const unsub = subscribeReceiptSettings((newSettings) => {
        setSettings(newSettings);
      });
      return () => unsub();
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const isPaid = activeType === 'paid_receipt' || order.paymentStatus === 'paid';
  const isViewingReceipt = activeType === 'paid_receipt';
  const docTitle = isViewingReceipt
    ? `Paid-Receipt-${order.receiptNumber || order.id}`
    : `Booking-Confirmation-${order.id}`;

  const handlePrint = () => {
    const html = isViewingReceipt
      ? generatePaidReceiptHtml(order, settings)
      : generateBookingSlipHtml(order, settings);
    printDocumentHtml(docTitle, html);
  };

  const c = {
    ...VERIFIED_COMPANY_DETAILS,
    name: settings.companyName || VERIFIED_COMPANY_DETAILS.name,
    tagline: settings.showTagline ? (settings.tagline || VERIFIED_COMPANY_DETAILS.tagline) : '',
    address: settings.address || VERIFIED_COMPANY_DETAILS.address,
    city: settings.city || VERIFIED_COMPANY_DETAILS.city,
    state: settings.state || VERIFIED_COMPANY_DETAILS.state,
    pincode: settings.pincode || VERIFIED_COMPANY_DETAILS.pincode,
    phone: settings.phone || VERIFIED_COMPANY_DETAILS.phone,
    email: settings.email || VERIFIED_COMPANY_DETAILS.email,
    website: settings.website || VERIFIED_COMPANY_DETAILS.website
  };
  const priceFormatted = formatIndianCurrency(order.price);
  const receiptNo = order.receiptNumber || order.paymentDetails?.receiptNumber || `RCP-NEX-${order.id.replace('ORD-PLN-', '')}`;
  const docNumber = isPaid ? receiptNo : `BKG-${order.id.replace('ORD-PLN-', '')}`;
  const docDate = formatDateIndian(isPaid ? (order.paymentDetails?.collectedAt || order.updatedAt) : order.createdAt);
  const paymentModeLabel = (order.paymentMethod || 'cash_on_installation').replace(/_/g, ' ').toUpperCase();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="bg-[#0b1320] text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Official Document Preview
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isPaid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {isPaid ? 'Payment Confirmed' : 'Payment Pending'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isPaid ? `Official Payment Receipt #${receiptNo}` : `Official Booking Confirmation #${order.id}`}
              </h3>
            </div>
          </div>

          {/* View Toggle Tabs if Paid */}
          {order.paymentStatus === 'paid' && (
            <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveType('paid_receipt')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeType === 'paid_receipt'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Paid Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveType('booking_slip')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeType === 'booking_slip'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Booking Slip</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Document Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/80">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden text-slate-800 font-sans">
            
            {/* 1. Deep Navy Header Section */}
            <div className="bg-[#152238] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b-4 border-indigo-500">
              {/* Left: Branding */}
              <div className="space-y-2 max-w-md">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl inline-flex items-center justify-center shadow-md">
                    <img
                      src={c.logoBase64}
                      alt={c.name}
                      className="h-9 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                      {c.name}
                    </h1>
                    {settings.showTagline && c.tagline && (
                      <p className="text-[11px] font-semibold text-indigo-300 mt-1 uppercase tracking-wider">
                        {c.tagline}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-300 pt-2 space-y-0.5 leading-relaxed font-normal">
                  <p>{c.address}, {c.city}, {c.state} - {c.pincode}</p>
                  <p className="text-[11px] text-slate-400">
                    Hotline: <strong className="text-white">{c.phone}</strong> &bull; Email: {c.email}
                  </p>
                  {settings.gstNumber && (
                    <p className="text-[10px] text-indigo-300 font-mono">
                      GSTIN: {settings.gstNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Document Title & Meta */}
              <div className="md:text-right flex flex-col md:items-end justify-between self-stretch">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-mono">
                    {isViewingReceipt ? 'OFFICIAL PAYMENT RECEIPT' : 'BOOKING SLIP'}
                  </h2>
                  <div className="mt-1">
                    <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                      isPaid
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    }`}>
                      {isPaid ? 'PAID & VERIFIED' : 'CONFIRMED — PAYMENT PENDING'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs space-y-1 text-slate-300">
                  <div className="flex md:justify-end gap-2">
                    <span className="text-slate-400 font-medium">{isViewingReceipt ? 'Receipt Number:' : 'Booking ID:'}</span>
                    <strong className="font-mono text-white tracking-wide">{isViewingReceipt ? receiptNo : order.id}</strong>
                  </div>
                  <div className="flex md:justify-end gap-2">
                    <span className="text-slate-400 font-medium">Issue Date:</span>
                    <strong className="text-white">{docDate}</strong>
                  </div>
                  <div className="flex md:justify-end gap-2">
                    <span className="text-slate-400 font-medium">Plan Order Ref:</span>
                    <strong className="font-mono text-indigo-300">{order.id}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Customer & Premises Grid */}
            <div className="p-6 sm:p-8 bg-slate-50/60 border-b border-slate-200">
              <div className={`grid gap-6 ${settings.showInstallationPremises !== false ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Billed To */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b border-slate-100 pb-1.5">
                    Billed To:
                  </div>
                  <div className="text-base font-extrabold text-slate-900">{order.customerName}</div>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>Phone: <strong className="text-slate-900">{order.phone}</strong></div>
                    <div>Email: <span className="text-slate-900">{order.email}</span></div>
                    <div>Location: <span className="font-medium text-slate-800">{order.city}, {order.pincode}</span></div>
                  </div>
                </div>

                {/* Service Premises (Conditional) */}
                {settings.showInstallationPremises !== false && (
                  <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b border-slate-100 pb-1.5">
                      Service &amp; Installation Premises:
                    </div>
                    <div className="text-xs font-medium text-slate-800 leading-relaxed">
                      {order.address}
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                      <div>City / PIN: <strong className="text-slate-900">{order.city} - {order.pincode}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Items Table */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#152238] text-white uppercase text-[10px] tracking-wider font-extrabold">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">No.</th>
                      <th className="py-3 px-4">Description / Package Details</th>
                      <th className="py-3 px-4">Provider</th>
                      <th className="py-3 px-4">Bandwidth Speed</th>
                      <th className="py-3 px-4">Billing Cycle</th>
                      <th className="py-3 px-4 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-500">01</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-sm text-slate-900">{order.planName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">High-Speed Fiber-Optic Broadband Connection</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700">{order.providerName}</td>
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                          {order.speed}
                        </span>
                      </td>
                      <td className="py-4 px-4 capitalize font-medium text-slate-700">
                        {order.billingPeriod.replace(/_/g, ' ')}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                        {priceFormatted}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 bg-slate-50/20">
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">02</td>
                      <td className="py-3 px-4" colSpan={4}>
                        <span className="font-semibold text-slate-800">Standard Optical FTTH Line Drop, ONU Modem Setup &amp; Verification</span>
                        <div className="text-[10px] text-emerald-600 font-medium">Standard installation included with broadband commitment</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 text-xs">
                        Included (₹0.00)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. Financial Totals & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Left: Payment Method & Notes */}
                <div className="space-y-4">
                  {settings.showPaymentInfo !== false && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Payment Details
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Method:</span>
                        <strong className="text-slate-900 uppercase">{paymentModeLabel}</strong>
                      </div>
                      {isPaid && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Transaction Reference:</span>
                          <strong className="font-mono text-indigo-700">
                            {order.paymentDetails?.reference || `TXN-${order.id}`}
                          </strong>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <strong className={`uppercase font-black ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isPaid ? 'Settled & Verified' : 'Due Upon Installation'}
                        </strong>
                      </div>
                    </div>
                  )}

                  {settings.showOfficialNotice !== false && (
                    isPaid ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Payment Acknowledgment:</strong> {settings.paidReceiptNotice || `Nexalus Innovations LLP confirms that the payment of ${priceFormatted} for Order #${order.id} has been fully received. Physical installation and account activation are proceeding on schedule.`}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Notice:</strong> {settings.bookingSlipNotice || 'This document serves as an official broadband installation booking order slip. Total amount is payable to the authorized technician upon physical line testing and handoff.'}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Right: Totals Breakdown Box */}
                <div className="space-y-3">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Plan Subscription Fee:</span>
                      <strong className="text-slate-800">{priceFormatted}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Standard Installation &amp; Wiring:</span>
                      <strong className="text-emerald-700 uppercase font-black text-[11px]">Waived / Included</strong>
                    </div>
                    {settings.showGstRow !== false && (
                      <div className="flex justify-between text-slate-600">
                        <span>Taxes (GST {settings.gstRate ?? 18}%):</span>
                        <span className="text-slate-500 font-medium">
                          {settings.gstInclusive !== false ? 'Inclusive in Tariff' : `Extra (${settings.gstRate ?? 18}%)`}
                        </span>
                      </div>
                    )}

                    {/* Highlight Box */}
                    <div className="pt-3 border-t border-slate-300">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                            {isPaid ? 'Total Amount Paid' : 'Total Amount Payable'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {isPaid ? 'Fully Paid via ' + paymentModeLabel : 'Payable on Installation'}
                          </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                          {priceFormatted}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Authentic Signature Block (Shown ONLY if toggle enabled) */}
                  {settings.showSignatory && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-right space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        For {settings.companyName || 'Nexalus Innovations LLP'}
                      </div>
                      {settings.signatureImageUrl ? (
                        <div className="py-1 flex justify-end">
                          <img
                            src={settings.signatureImageUrl}
                            alt="Authorized Signature"
                            className="h-12 max-w-[180px] object-contain"
                          />
                        </div>
                      ) : (
                        <div className="font-serif italic text-2xl font-bold text-slate-800 py-1">
                          {settings.signatoryName || 'Authorized Signatory'}
                        </div>
                      )}
                      <div className="text-[11px] font-bold text-slate-700">
                        {settings.signatoryTitle || 'Authorized Signatory'}
                      </div>
                      {settings.signatureImageUrl && settings.signatoryName && settings.signatoryName !== 'Authorized Signatory' && (
                        <div className="text-[10px] text-slate-600 font-medium">
                          {settings.signatoryName}
                        </div>
                      )}
                      {settings.signatorySubtitle && (
                        <div className="text-[9px] text-slate-400">
                          {settings.signatorySubtitle}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Executive Document Footer */}
            <div className="bg-[#152238] text-white px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-300">
              <span className="font-medium">
                Thank you for choosing <strong className="text-white">{settings.companyName || 'Nexalus Innovations LLP'}</strong>.
              </span>
              <span>
                Support: <strong className="text-white">{c.phone}</strong> &bull; {c.email} &bull; {c.website}
              </span>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            {settings.companyName || 'Nexalus Innovations LLP'} &bull; Customer Care: {c.phone}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
