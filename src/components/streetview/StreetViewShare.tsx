import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Link2, Facebook, Twitter, Mail, MessageCircle, Copy, Check } from 'lucide-react';

import { StreetViewPano, StreetViewPosition } from '../../types/streetview.types';

interface StreetViewShareProps {
  position: StreetViewPosition;
  pano?: StreetViewPano;
  onClose?: () => void;
  className?: string;
}

export const StreetViewShare: React.FC<StreetViewShareProps> = ({
  position,
  pano,
  onClose,
  className = '',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareMethod, setShareMethod] = useState<'link' | 'social' | 'embed'>('link');

  // Generate shareable URL
  const generateShareUrl = (): string => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      lat: position.lat.toString(),
      lng: position.lng.toString(),
    });

    if (position.heading !== undefined) {
      params.set('heading', position.heading.toString());
    }
    if (position.pitch !== undefined) {
      params.set('pitch', position.pitch.toString());
    }
    if (position.zoom !== undefined) {
      params.set('zoom', position.zoom.toString());
    }
    if (pano?.id) {
      params.set('pano', pano.id);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  // Generate embed code
  const generateEmbedCode = (): string => {
    const url = generateShareUrl();
    return `<iframe src="${url}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  };

  // Share functions
  const shareUrl = generateShareUrl();
  const embedCode = generateEmbedCode();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy embed code:', err);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = pano?.description || 'Check out this Street View location';
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'mailto':
        url = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pano?.description || 'Street View Location',
          text: 'Check out this Street View location',
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <h3 className="font-semibold">Share Location</h3>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Share Method Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setShareMethod('link')}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            shareMethod === 'link'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Link2 className="w-4 h-4" />
            Link
          </div>
        </button>

        <button
          onClick={() => setShareMethod('social')}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            shareMethod === 'social'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Social
          </div>
        </button>

        <button
          onClick={() => setShareMethod('embed')}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            shareMethod === 'embed'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Copy className="w-4 h-4" />
            Embed
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Link Sharing */}
        {shareMethod === 'link' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {navigator.share && (
              <button
                onClick={shareViaWebShare}
                className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Using System Dialog
              </button>
            )}
          </div>
        )}

        {/* Social Sharing */}
        {shareMethod === 'social' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => shareToSocial('twitter')}
                className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </button>

              <button
                onClick={() => shareToSocial('facebook')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </button>

              <button
                onClick={() => shareToSocial('mailto')}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>

              <button
                onClick={() => shareToSocial('whatsapp')}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Share this Street View location on your favorite social media platforms
            </div>
          </div>
        )}

        {/* Embed Code */}
        {shareMethod === 'embed' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Embed Code
              </label>
              <textarea
                value={embedCode}
                readOnly
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 font-mono"
              />
            </div>

            <button
              onClick={handleCopyEmbed}
              className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  Embed Code Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Embed Code
                </>
              )}
            </button>

            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              Paste this code into your website to embed this Street View location.
            </div>
          </div>
        )}
      </div>

      {/* Location Preview */}
      {pano && (
        <div className="border-t p-3 bg-gray-50">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {pano.description}
              </p>
              <p className="text-xs text-gray-600">
                {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};