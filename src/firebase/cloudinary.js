/**
 * Cloudinary Client-Side Upload Utility
 * Uses unsigned upload presets — no backend required.
 *
 * SETUP (do this once in your Cloudinary dashboard):
 *  1. Go to https://console.cloudinary.com/settings/upload
 *  2. Scroll to "Upload presets" → click "Add upload preset"
 *  3. Set signing mode to "Unsigned"
 *  4. Copy the preset name exactly (case-sensitive!) into VITE_CLOUDINARY_UPLOAD_PRESET
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/** Validate config at module load time — fail fast and clearly */
function validateCloudinaryConfig() {
  const missing = [];
  if (!CLOUD_NAME) missing.push('VITE_CLOUDINARY_CLOUD_NAME');
  if (!UPLOAD_PRESET) missing.push('VITE_CLOUDINARY_UPLOAD_PRESET');

  if (missing.length > 0) {
    throw new Error(
      `Cloudinary config missing in .env:\n  ${missing.join('\n  ')}\n\n` +
      `Add these variables to your .env file and restart the dev server.`
    );
  }
}

/**
 * Upload a File object to Cloudinary via unsigned upload.
 * @param {File} file - The file to upload
 * @param {string} [folder='weardon'] - Optional folder in Cloudinary
 * @returns {Promise<string>} The secure_url of the uploaded image
 */
export const uploadImageToCloudinary = async (file, folder = 'weardon') => {
  validateCloudinaryConfig();

  if (!file) throw new Error('No file provided for upload');
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed');

  const MAX_SIZE_MB = 10;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File too large. Maximum size is ${MAX_SIZE_MB}MB`);
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
  } catch (networkError) {
    throw new Error(
      `Network error — could not reach Cloudinary. Check your internet connection.\n` +
      `(${networkError.message})`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    const cloudinaryMsg = data?.error?.message ?? 'Unknown Cloudinary error';

    // Provide actionable guidance based on the error type
    if (cloudinaryMsg.toLowerCase().includes('preset')) {
      throw new Error(
        `Cloudinary upload preset not found.\n\n` +
        `Your preset name "${UPLOAD_PRESET}" does not exist or is not set to "Unsigned".\n\n` +
        `To fix:\n` +
        `1. Log into Cloudinary → Settings → Upload → Upload Presets\n` +
        `2. Find or create a preset with mode = "Unsigned"\n` +
        `3. Copy the exact preset name (case-sensitive)\n` +
        `4. Set VITE_CLOUDINARY_UPLOAD_PRESET="<exact name>" in your .env file\n` +
        `5. Restart the dev server (Ctrl+C then npm run dev)`
      );
    }

    if (cloudinaryMsg.toLowerCase().includes('cloud')) {
      throw new Error(
        `Invalid Cloudinary cloud name "${CLOUD_NAME}".\n` +
        `Check VITE_CLOUDINARY_CLOUD_NAME in your .env file.`
      );
    }

    throw new Error(`Cloudinary error: ${cloudinaryMsg}`);
  }

  if (!data.secure_url) {
    throw new Error('Cloudinary returned no URL. Try again or check your account limits.');
  }

  return data.secure_url;
};

/** Returns current config info (safe — no secrets exposed) */
export const getCloudinaryInfo = () => ({
  cloudName: CLOUD_NAME || '(not set)',
  uploadPreset: UPLOAD_PRESET || '(not set)',
  uploadUrl: CLOUD_NAME
    ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    : null,
});
