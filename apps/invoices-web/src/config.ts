/**
 * Global Application Configuration
 * Defaults to the microservice invoices-api (Port 5001) or Next.js internal routes
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
