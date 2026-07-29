/**
 * JSON-LD structured data for OnePost AI.
 * Renders a <script type="application/ld+json"> tag with schema.org WebApplication markup.
 *
 * © 2026 Aura Haven Tech. All rights reserved.
 */

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "OnePost AI",
    alternateName: "OnePostAI",
    url: "https://onepostai.vercel.app",
    description:
      "Fix ALL content creation headaches. Posts across every social media platform from ONE place. Automatically picks viral hashtags. Schedules at optimal times.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "19.00",
      priceCurrency: "USD",
      description: "Starting at $19/month",
    },
    author: {
      "@type": "Organization",
      name: "Aura Haven Tech",
      url: "https://aurahaven.shop",
      email: "aurahaventech@gmail.com",
      sameAs: ["https://twitter.com/funkycoldmedemaa"],
    },
    browserRequirements: "Requires JavaScript",
    permissions: "camera, microphone",
    featureList: [
      "AI content generation",
      "Social media scheduling",
      "Cross-platform publishing",
      "Viral hashtag suggestions",
      "Content calendar",
    ].join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
