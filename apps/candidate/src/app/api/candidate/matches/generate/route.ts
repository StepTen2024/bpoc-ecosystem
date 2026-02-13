import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3003';

/**
 * POST /api/candidate/matches/generate
 * Generate job matches for the authenticated candidate
 * Calls the admin matching engine
 */
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        console.log('🎯 Generating matches for candidate:', userId);

        // Check if candidate already has recent matches (within 24h)
        const { data: recentMatch } = await supabaseAdmin
            .from('job_matches')
            .select('analyzed_at')
            .eq('candidate_id', userId)
            .order('analyzed_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (recentMatch?.analyzed_at) {
            const lastGen = new Date(recentMatch.analyzed_at);
            const hoursSince = (Date.now() - lastGen.getTime()) / (1000 * 60 * 60);
            
            if (hoursSince < 24) {
                // Return existing matches
                const { count } = await supabaseAdmin
                    .from('job_matches')
                    .select('*', { count: 'exact', head: true })
                    .eq('candidate_id', userId);

                return NextResponse.json({
                    success: true,
                    message: 'Using recent matches',
                    matchCount: count || 0,
                    generated: 0,
                    cached: true,
                });
            }
        }

        // Call admin matching engine
        const adminResponse = await fetch(`${ADMIN_API_URL}/api/matching/candidate-to-jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidateId: userId, limit: 50 }),
        });

        if (!adminResponse.ok) {
            const error = await adminResponse.json();
            console.error('Admin matching failed:', error);
            return NextResponse.json({
                error: error.error || 'Failed to generate matches',
                code: error.code,
            }, { status: adminResponse.status });
        }

        const result = await adminResponse.json();

        console.log(`✅ Generated ${result.total || 0} matches for ${userId}`);

        return NextResponse.json({
            success: true,
            message: `Generated ${result.total || 0} job matches`,
            generated: result.total || 0,
            matches: result.matches?.length || 0,
        });

    } catch (error: any) {
        console.error('❌ Error generating matches:', error);
        return NextResponse.json({
            error: 'Failed to generate matches',
            details: error.message
        }, { status: 500 });
    }
}
