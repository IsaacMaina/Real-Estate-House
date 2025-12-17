// src/app/about/page.tsx
import { getAboutMetadata } from '@/metadata/about';
import Navigation from '@/components/Navigation';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { getAboutPageContent } from '@/lib/db-actions';
import MainLayout from '@/layouts/MainLayout';

export async function generateMetadata() {
  return getAboutMetadata();
}

export default async function AboutPage() {
  const pageContent = await getAboutPageContent();

  // Parse stats and services from content if they exist in structured format (JSON)
  let stats = [
    { value: "5K+", label: "Properties Sold", desc: "In our 13-year history" },
    { value: "KSh 150B+", label: "Value Transacted", desc: "Of luxury real estate" },
    { value: "8+", label: "Offices in Kenya", desc: "Nairobi, Mombasa, Kisumu & more" }
  ];

  let services = [
    { title: "Luxury Property Sales in Kenya", description: "Exclusive listings across Kenya for discerning buyers" },
    { title: "Personalized Property Tours", description: "Curated experiences for premium properties in Kenya" },
    { title: "Investment Advisory for Kenya", description: "Expert guidance for luxury property investments in Kenya" },
    { title: "Property Management in Kenya", description: "End-to-end management for your luxury assets in Kenya" }
  ];

  // If page content is in a structured format, parse it
  try {
    if (pageContent.content && typeof pageContent.content === 'string' && pageContent.content.startsWith('{')) {
      const parsedContent = JSON.parse(pageContent.content);
      if (parsedContent.stats) stats = parsedContent.stats;
      if (parsedContent.services) services = parsedContent.services;
    }
  } catch (e) {
    // If parsing fails, use default values
    console.log("Using default content since page content is not in structured format");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">About <span className="text-indigo-600">LuxRE</span></h1>
            <p className="text-xl text-gray-700 mb-12">
              Kenya's premier luxury real estate platform connecting discerning buyers with exceptional properties
            </p>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4">
                {pageContent.content && typeof pageContent.content === 'string' && !pageContent.content.startsWith('{')
                  ? pageContent.content
                  : "Founded in 2010, LuxRE has established itself as Kenya's premier destination for luxury real estate. Our team of expert agents specializes in Kenya's most desirable properties, from Nairobi penthouses to coastal villas."}
              </p>
              <p className="text-gray-700">
                We understand that buying or selling a luxury property in Kenya is more than a transaction – it's a life-changing
                experience that deserves personalized attention and sophisticated expertise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-indigo-600 text-4xl mb-4">{stat.value}</div>
                  <h3 className="text-xl font-semibold text-gray-900">{stat.label}</h3>
                  <p className="text-gray-600 mt-2">{stat.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg text-gray-900">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <FloatingWhatsApp />
    </div>
  );
}