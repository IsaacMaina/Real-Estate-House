// src/lib/contact-actions.ts
// Server actions for contact information

export interface ContactInfo {
  phone: string;
  displayPhone: string;
  whatsappNumber: string;
  email: string;
  officeAddress: string;
}

// Default contact information - will be used if no record exists in database
export const defaultContactInfo: ContactInfo = {
  phone: '254758302725',
  displayPhone: '+254 758 302 725',
  whatsappNumber: '254758302725',
  email: 'info@luxurykenyarealestate.com',
  officeAddress: '123 Westlands Road, 5th Floor\nNairobi, Kenya',
};

// Function to get contact information - can be used in server components
export const getContactInfo = async (): Promise<ContactInfo> => {
  try {
    // For server components, we need to make an internal API call
    // Using fetch to the API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/settings/contact`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contact info: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      phone: data.phone || defaultContactInfo.phone,
      displayPhone: data.displayPhone || defaultContactInfo.displayPhone,
      whatsappNumber: data.whatsappNumber || defaultContactInfo.whatsappNumber,
      email: data.email || defaultContactInfo.email,
      officeAddress: data.officeAddress || defaultContactInfo.officeAddress,
    };
  } catch (error) {
    console.error('Error fetching contact info from API:', error);
    // Return default values if there's an error
    return defaultContactInfo;
  }
};

// Function to get phone number for WhatsApp links (removes non-digits)
export const getWhatsAppNumber = async (): Promise<string> => {
  const contactInfo = await getContactInfo();
  return contactInfo.whatsappNumber || contactInfo.phone;
};

// Function to get display phone number
export const getDisplayPhone = async (): Promise<string> => {
  const contactInfo = await getContactInfo();
  return contactInfo.displayPhone || contactInfo.phone;
};