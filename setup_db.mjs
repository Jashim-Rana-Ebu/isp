import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rywdsefnoyiyqdrcpadj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5d2RzZWZub3lpeXFkcmNwYWRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ1NTM2OCwiZXhwIjoyMTAyMDMxMzY4fQ.gXdfALSVyRBSPh7n9AH040NDVp9hZMr7ftjVjVxPDVA';

async function main() {
  console.log('Setting up demo users via Supabase Admin API...');
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Create Super Admin
  const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
    email: 'admin@ultimateisp.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'System Admin' }
  });
  
  if (adminErr) {
    console.error('Error creating admin:', adminErr.message);
  } else {
    console.log('Admin user created in auth (admin@ultimateisp.com / password123).');
    
    // Wait a couple of seconds for trigger to create the profile
    await new Promise(r => setTimeout(r, 2000));
    
    // Get super_admin role id
    const { data: role } = await supabase.from('roles').select('id').eq('name', 'super_admin').single();
    
    if (role) {
      const { error: updateErr } = await supabase.from('profiles').update({ role_id: role.id }).eq('id', adminAuth.user.id);
      if (updateErr) console.error('Failed to assign super_admin role:', updateErr);
      else console.log('Admin user successfully assigned the super_admin role.');
    } else {
      console.error('Could not find super_admin role. Did the migration run successfully?');
    }
  }

  // 2. Create Demo Customer
  const { data: custAuth, error: custErr } = await supabase.auth.admin.createUser({
    email: 'client@ultimateisp.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'Demo Client' }
  });

  if (custErr) {
    console.error('Error creating customer:', custErr.message);
  } else {
    console.log('Customer user created in auth (client@ultimateisp.com / password123).');
    
    // Wait for profile trigger
    await new Promise(r => setTimeout(r, 2000));
    
    // get default package and company
    const { data: pkg } = await supabase.from('packages').select('id').eq('name', 'Starter 10Mbps').single();
    const { data: company } = await supabase.from('companies').select('id').limit(1).single();
    
    const { error: cErr } = await supabase.from('customers').insert({
      user_id: custAuth.user.id,
      name: 'Demo Client',
      email: 'client@ultimateisp.com',
      phone: '01700000000',
      package_id: pkg?.id,
      company_id: company?.id,
      status: 'active'
    });
    
    if (cErr) console.error('Error inserting customer record:', cErr.message);
    else console.log('Customer record linked successfully.');
  }

  console.log('Setup complete! You can now start the Next.js app.');
}

main().catch(console.error);
