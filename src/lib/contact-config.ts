// src/lib/contact-config.ts
// Centralized contact configuration for the entire application

import { getDbPool } from './db';

export interface ContactInfo {
  phone: string;
  displayPhone: string;
  whatsappNumber: string;
  email: string;
  officeAddress: string;
}

// Default contact information - will be overridden by database values
export const defaultContactInfo: ContactInfo = {
  phone: '254758302725',
  displayPhone: '+254 758 302 725',
  whatsappNumber: '254758302725',
  email: 'info@luxurykenyarealestate.com',
  officeAddress: '123 Westlands Road, 5th Floor\nNairobi, Kenya',
};

let contactInfo: ContactInfo = { ...defaultContactInfo };

// Function to load contact information from database and update the in-memory cache
export const loadContactInfo = async (): Promise<ContactInfo> => {
  try {
    const response = await fetch('/api/admin/settings/contact');

    if (!response.ok) {
      throw new Error(`Failed to fetch contact info: ${response.statusText}`);
    }

    const data = await response.json();

    // Update in-memory cache
    contactInfo = {
      phone: data.phone || defaultContactInfo.phone,
      displayPhone: data.displayPhone || defaultContactInfo.displayPhone,
      whatsappNumber: data.whatsappNumber || defaultContactInfo.whatsappNumber,
      email: data.email || defaultContactInfo.email,
      officeAddress: data.officeAddress || defaultContactInfo.officeAddress,
    };
  } catch (error) {
    console.error('Error loading contact info from database:', error);
    // Use default values if there's an error
    contactInfo = { ...defaultContactInfo };
  }

  return contactInfo;
};

// Function to update contact information in both database and in-memory cache
export const updateContactInfo = async (newContactInfo: Partial<ContactInfo>): Promise<void> => {
  try {
    // Update in-memory cache
    contactInfo = {
      ...contactInfo,
      ...newContactInfo,
    };

    // Update database via API
    const response = await fetch('/api/admin/settings/contact', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: newContactInfo.phone || contactInfo.phone,
        displayPhone: newContactInfo.displayPhone || contactInfo.displayPhone,
        whatsappNumber: newContactInfo.whatsappNumber || contactInfo.whatsappNumber,
        email: newContactInfo.email || contactInfo.email,
        officeAddress: newContactInfo.officeAddress || contactInfo.officeAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update contact info: ${response.statusText}`);
    }

    // Reload the contact info to ensure cache consistency
    await loadContactInfo();
  } catch (error) {
    console.error('Error updating contact info:', error);
    // Revert to previous values in case of error
    contactInfo = { ...defaultContactInfo }; // Fallback to default
    try {
      await loadContactInfo(); // Try to reload from DB
    } catch (reloadError) {
      console.error('Error reloading contact info after update failure:', reloadError);
    }
  }
};

// Function to get current contact information
export const getContactInfo = (): ContactInfo => {
  return contactInfo;
};

// Function to get phone number for WhatsApp links (removes non-digits)
export const getWhatsAppNumber = (): string => {
  return contactInfo.whatsappNumber || contactInfo.phone;
};

// Function to get display phone number
export const getDisplayPhone = (): string => {
  return contactInfo.displayPhone || contactInfo.phone;
};