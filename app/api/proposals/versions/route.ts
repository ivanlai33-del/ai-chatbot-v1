import { NextRequest, NextResponse } from 'next/server';
import { ProposalVersionService } from '@/lib/services/ProposalVersionStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || 'stark-works';
    const versionId = searchParams.get('v') || undefined;

    const { versions, activeVersionId } = ProposalVersionService.getVersions(slug);
    const { version, textOverrides } = ProposalVersionService.getVersionContent(slug, versionId);

    return NextResponse.json({
      success: true,
      slug,
      activeVersionId,
      currentVersion: version,
      versions,
      textOverrides,
    });
  } catch (err: any) {
    console.error('[Proposal Versions GET API Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch versions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'CREATE_VERSION', slug, textOverrides = {}, note, versionId } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Proposal slug is required' }, { status: 400 });
    }

    if (action === 'SET_ACTIVE_VERSION') {
      if (!versionId) {
        return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
      }
      const success = ProposalVersionService.setActiveVersion(slug, versionId);
      const { versions, activeVersionId } = ProposalVersionService.getVersions(slug);
      return NextResponse.json({
        success,
        slug,
        activeVersionId,
        versions,
        message: `Version ${versionId} is now set as active for clients.`,
      });
    }

    // Default: CREATE_VERSION
    const newVersion = ProposalVersionService.createVersion(slug, textOverrides, note);
    const { versions, activeVersionId } = ProposalVersionService.getVersions(slug);

    return NextResponse.json({
      success: true,
      slug,
      createdVersion: newVersion,
      activeVersionId,
      versions,
      message: `Successfully saved new version ${newVersion.versionId}.`,
    });
  } catch (err: any) {
    console.error('[Proposal Versions POST API Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to update version' }, { status: 500 });
  }
}
