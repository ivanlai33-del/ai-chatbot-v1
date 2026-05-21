import { NextResponse } from 'next/server';
import { getPricingPlans } from '@/config/landing_config';

export async function GET() {
  try {
    const monthlyPlans = getPricingPlans('monthly');
    const yearlyPlans = getPricingPlans('yearly');

    return NextResponse.json({
      success: true,
      plans: {
        monthly: monthlyPlans,
        yearly: yearlyPlans
      },
      earlyBird: {
        total: 500,
        remaining: 42 // In real app, fetch from DB
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch plans' }, { status: 500 });
  }
}
