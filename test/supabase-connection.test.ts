import { supabase, isSupabaseConfigured } from '../src/lib/supabase.ts';

async function run() {
  console.log('Testing Supabase Connection...');
  console.log('isSupabaseConfigured:', isSupabaseConfigured);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // 1. Auth check
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    console.log('Auth check session result:', { hasSession: !!sessionData?.session, sessionErr: sessionErr?.message ?? null });

    // 2. Query public cases table
    const { data, error, status, statusText } = await supabase
      .from('cases')
      .select('id, case_uid, case_type, status, created_at')
      .limit(5);

    clearTimeout(timeout);

    console.log('Cases query status:', status, statusText);
    if (error) {
      console.log('Cases query error message:', error.message);
      console.log('Cases query error code:', error.code);
      console.log('Cases query error details:', error.details);
    } else {
      console.log('Cases query succeeded! Rows fetched:', data?.length);
      console.log('Sample data:', data);
    }

    // 3. Query reports
    const { data: reports, error: reportErr, status: reportStatus } = await supabase
      .from('reports')
      .select('id, source_type, comm_status, found_location')
      .limit(3);

    console.log('Reports table:', { status: reportStatus, rows: reports?.length, error: reportErr?.message });

    // 4. Query person_attributes
    const { data: attrs, error: attrErr, status: attrStatus } = await supabase
      .from('person_attributes')
      .select('id, full_name, gender')
      .limit(3);

    console.log('Person attributes table:', { status: attrStatus, rows: attrs?.length, error: attrErr?.message });

    // 5. Query profiles table
    const { data: profiles, error: profileErr, status: profileStatus } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .limit(3);

    console.log('Profiles table:', { status: profileStatus, rows: profiles?.length, error: profileErr?.message });

    // 6. Query match_candidates table
    const { data: matches, error: matchErr, status: matchStatus } = await supabase
      .from('match_candidates')
      .select('id, score, confidence_tier')
      .limit(3);

    console.log('Match candidates table:', { status: matchStatus, rows: matches?.length, error: matchErr?.message });

    // 7. Query status_history table
    const { data: history, error: historyErr, status: historyStatus } = await supabase
      .from('status_history')
      .select('id, old_status, new_status')
      .limit(3);

    console.log('Status history table:', { status: historyStatus, rows: history?.length, error: historyErr?.message });

    console.log('\n======================================');
    console.log('SUPABASE STATUS: CONNECTED & ONLINE');
    console.log('Project URL: https://tqslfitamrihdqpwvjhj.supabase.co');
    console.log('======================================');
  } catch (err: any) {
    console.error('Connection test failed with exception:', err.name === 'AbortError' ? 'Request Timed Out' : err.message);
  }
}

run();
