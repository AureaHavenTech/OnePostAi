export interface User {
  id: number;
  email: string;
  name: string;
  plan: string;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PricingTier {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    price: 19,
    period: '/month',
    description: 'Perfect for getting started with content creation',
    features: [
      '50 posts/month',
      'Single platform',
      'Basic editor',
      'Schedule posts',
      'Email support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: 49,
    period: '/month',
    description: 'For serious content creators',
    features: [
      '200 posts/month',
      'All platforms',
      'Advanced editor with AI',
      'Schedule & auto-publish',
      'Analytics dashboard',
      'Priority support',
      'AutoExec integration',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Unlimited',
    price: 99,
    period: '/month',
    description: 'For teams and power users',
    features: [
      'Unlimited posts',
      'All platforms',
      'Full AI content suite',
      'Advanced scheduling',
      'Team collaboration',
      'API access',
      'AutoExec deep integration',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
  },
];
