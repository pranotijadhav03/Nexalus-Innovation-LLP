import React, { useState } from 'react';
import { Product } from '../../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, Copy, ExternalLink, Share2, Check, Phone } from 'lucide-react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const { success } = useToast();
  const [customerPhone, setCustomerPhone] = useState('');
  const [copied, setCopied] = useState(false);

  const brandName =
    product.brandId === 'am-distributors'
      ? 'A.M. Distributors Chiplun'
      : 'Nexalus Innovations';

  // Format specifications bullet points
  const specLines = Object.entries(product.specifications || {})
    .slice(0, 4)
    .map(([k, v]) => `• ${k}: ${v}`)
    .join('\n');

  const priceText = product.price
    ? `₹${product.price.toLocaleString('en-IN')}`
    : 'Available on Request (Enterprise BOQ)';

  const defaultDraft = `🏢 *NEXALUS INNOVATIONS LLP*
*Connectivity, CCTV & Enterprise Networking*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *PRODUCT SPECIFICATION PROPOSAL*

📦 *Item:* ${product.name}
🏷️ *Model No:* ${product.modelNumber}
📁 *Category:* ${product.categoryName}
🏢 *Division:* ${brandName}
💰 *Price:* ${priceText}
📦 *Availability:* ${product.availability === 'in_stock' ? 'In Stock (Ready for Dispatch)' : 'On Order (Fast Delivery)'}

⚙️ *KEY TECHNICAL HIGHLIGHTS:*
${specLines}

✅ 100% Genuine Certified Hardware
🛡️ Official Manufacturer Warranty & Nexalus On-site Support
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *Contact Sales Engineering:* +91 (0) 80 4123 4500 / +91 9158886444
📧 *Email:* sales@nexalusinnovations.com
🌐 *Official Catalog:* ${window.location.origin}/products

_Product proposal draft generated via Nexalus Sales Desk_`;

  const [messageDraft, setMessageDraft] = useState(defaultDraft);

  // Reset draft if product changes
  React.useEffect(() => {
    setMessageDraft(defaultDraft);
    setCopied(false);
  }, [product]);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageDraft);
    setCopied(true);
    success('Draft Copied', 'WhatsApp proposal draft copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(messageDraft);
    // Sanitize phone number (remove spaces, dashes, plus)
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');

    let url = '';
    if (cleanPhone) {
      // If user typed 10-digit Indian number without country code, prepend 91
      const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      url = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodedText}`;
    } else {
      // Open WhatsApp picker so user can pick any contact or group
      url = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Product Draft via WhatsApp"
      maxWidth="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">Client Mobile WhatsApp Draft Tool</div>
            <p className="text-[11px] text-emerald-700 leading-tight mt-0.5">
              Send this structured equipment proposal directly to customer WhatsApp with Nexalus branding and specs.
            </p>
          </div>
        </div>

        {/* Optional Customer Phone Input */}
        <Input
          label="Customer WhatsApp Number (Optional)"
          placeholder="e.g. 9876543210 (Leave blank to pick any contact in WhatsApp)"
          value={customerPhone}
          onChange={e => setCustomerPhone(e.target.value)}
        />

        {/* Formatted Message Draft (Editable) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Message Draft Preview (Editable)
            </label>
            <span className="text-[10px] text-slate-400">Formatted for WhatsApp</span>
          </div>
          <textarea
            rows={10}
            value={messageDraft}
            onChange={e => setMessageDraft(e.target.value)}
            className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white leading-relaxed text-slate-800"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            onClick={handleCopy}
            className="w-full sm:w-auto"
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Draft'}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4" />
              Send to Customer via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
