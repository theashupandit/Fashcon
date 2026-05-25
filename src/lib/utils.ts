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
