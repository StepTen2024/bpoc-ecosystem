const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetPassword() {
    console.log('Resetting password for platform-admin@bpoc.io...');

    const { data, error } = await supabase.auth.admin.updateUserById(
        'ea014b7e-eb38-489e-8ca2-5b0bcef80201',
        { password: 'SuperAdmin123!' }
    );

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('\n✅ Password reset successfully!');
        console.log('\n📧 Email: platform-admin@bpoc.io');
        console.log('🔑 Password: SuperAdmin123!');
        console.log('🔗 URL: http://localhost:3001/admin/login');
    }
}

resetPassword();
