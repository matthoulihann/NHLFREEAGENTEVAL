import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if code is running on the client side
 * @returns true if running in a browser, false if running on the server
 */
export function isClient(): boolean {
  return typeof window !== "undefined"
}
