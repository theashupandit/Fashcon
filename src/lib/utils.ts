import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStoreBranding(url: string = '', storeName: string = '', labelText: string = '') {
  const combined = `${url} ${storeName} ${labelText}`.toUpperCase();
  
  if (combined.includes('AMAZON')) {
    return {
      name: 'AMAZON',
      bg: 'bg-[#FF9900]',
      text: 'text-black',
      hover: 'hover:bg-[#FFB100]',
      border: 'border-[#FF9900]/20',
      shadow: 'shadow-[#FF9900]/20',
      iconType: 'amazon'
    };
  }
  
  if (combined.includes('FLIPKART')) {
    return {
      name: 'FLIPKART',
      bg: 'bg-[#2874F0]',
      text: 'text-white',
      hover: 'hover:bg-[#1e5ebf]',
      border: 'border-[#2874F0]/20',
      shadow: 'shadow-[#2874F0]/20',
      iconType: 'shopping-cart'
    };
  }

  if (combined.includes('MYNTRA')) {
    return {
      name: 'MYNTRA',
      bg: 'bg-[#ff3f6c]',
      text: 'text-white',
      hover: 'hover:bg-[#e63560]',
      border: 'border-[#ff3f6c]/20',
      shadow: 'shadow-[#ff3f6c]/20',
      iconType: 'shopping-bag'
    };
  }

  if (combined.includes('ALIEXPRESS')) {
    return {
      name: 'ALIEXPRESS',
      bg: 'bg-[#ff4747]',
      text: 'text-white',
      hover: 'hover:bg-[#e63e3e]',
      border: 'border-[#ff4747]/20',
      shadow: 'shadow-[#ff4747]/20',
      iconType: 'shopping-cart'
    };
  }

  if (combined.includes('ETSY')) {
    return {
      name: 'ETSY',
      bg: 'bg-[#F1641E]',
      text: 'text-white',
      hover: 'hover:bg-[#d9561a]',
      border: 'border-[#F1641E]/20',
      shadow: 'shadow-[#F1641E]/20',
      iconType: 'shopping-cart'
    };
  }

  if (combined.includes('AJIO')) {
    return {
      name: 'AJIO',
      bg: 'bg-[#2c4152]',
      text: 'text-white',
      hover: 'hover:bg-[#1e2d3a]',
      border: 'border-[#2c4152]/20',
      shadow: 'shadow-[#2c4152]/20',
      iconType: 'shopping-bag'
    };
  }

  if (combined.includes('NYKAA')) {
    return {
      name: 'NYKAA',
      bg: 'bg-[#fc2779]',
      text: 'text-white',
      hover: 'hover:bg-[#e01f68]',
      border: 'border-[#fc2779]/20',
      shadow: 'shadow-[#fc2779]/20',
      iconType: 'shopping-bag'
    };
  }

  // Default Fashcon Red
  return {
    name: 'DEFAULT',
    bg: 'bg-[#e60023]',
    text: 'text-white',
    hover: 'hover:bg-black',
    border: 'border-[#e60023]/20',
    shadow: 'shadow-[#e60023]/20',
    iconType: 'shopping-cart'
  };
}

export async function hashSHA256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function optimizeCloudinaryUrl(url: string, width?: number): string {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return url;
  }
  
  if (url.includes('/image/upload/')) {
    const uploadWithParamsRegex = /\/image\/upload\/([^/]+)\//;
    const match = url.match(uploadWithParamsRegex);
    
    // Determine the transformation parameters we want to apply
    let transformParams = 'q_auto,f_auto';
    if (width) {
      transformParams += `,c_limit,w_${width}`;
    }

    if (match) {
      const existingParams = match[1];
      // If the matched params string is just a version identifier (e.g., v1234567890)
      if (existingParams.startsWith('v') && /^\d+$/.test(existingParams.substring(1))) {
        return url.replace('/image/upload/', `/image/upload/${transformParams}/`);
      } else {
        // We have existing parameters, merge our new ones
        let updatedParams = existingParams;
        if (!updatedParams.includes('q_auto')) {
          updatedParams += ',q_auto';
        }
        if (!updatedParams.includes('f_auto')) {
          updatedParams += ',f_auto';
        }
        if (width && !updatedParams.includes('w_')) {
          updatedParams += `,c_limit,w_${width}`;
        }
        return url.replace(`/image/upload/${existingParams}/`, `/image/upload/${updatedParams}/`);
      }
    } else {
      return url.replace('/image/upload/', `/image/upload/${transformParams}/`);
    }
  }
  return url;
}
