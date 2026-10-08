/**
 * Build the public tracking URL for a shipment.
 * Uses the current site origin in the browser so QR codes always
 * point at whatever domain the admin is logged into.
 */
export function getTrackingUrl(trackingNumber: string): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://www.porthavenlogistic.com'
  return `${origin}/track/${encodeURIComponent(trackingNumber)}`
}

/**
 * Generate a QR code image (PNG blob) that opens the public tracking page.
 * Uses the public QR Server API (no npm dependency required).
 */
export async function generateTrackingQrBlob(
  trackingNumber: string,
  size = 400,
): Promise<Blob> {
  const trackUrl = getTrackingUrl(trackingNumber)
  const apiUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}` +
    `&margin=12&data=${encodeURIComponent(trackUrl)}`
  const res = await fetch(apiUrl)
  if (!res.ok) {
    throw new Error('Failed to generate QR code')
  }
  return res.blob()
}

/**
 * Trigger a browser download of the QR code PNG for a shipment.
 * Filename: QR-{trackingNumber}.png
 */
export async function downloadTrackingQr(trackingNumber: string): Promise<void> {
  const blob = await generateTrackingQrBlob(trackingNumber)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `QR-${trackingNumber}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
