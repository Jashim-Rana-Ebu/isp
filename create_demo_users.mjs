import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rywdsefnoyiyqdrcpadj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5d2RzZWZub3lpeXFkcmNwYWRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ1NTM2OCwiZXhwIjoyMTAyMDMxMzY4fQ.gXdfALSVyRBSPh7n9AH040NDVp9hZMr7ftjVjVxPDVA';

async function main() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Fetch all roles
  const { data: roles } = await supabase.from('roles').select('*');
  
  const usersToCreate = [
    { email: 'admin_user@ultimateisp.com', roleName: 'admin', name: 'Admin User' },
    { email: 'manager@ultimateisp.com', roleName: 'manager', name: 'Manager User' },
    { email: 'technician@ultimateisp.com', roleName: 'technician', name: 'Technician User' },
    { email: 'agent@ultimateisp.com', roleName: 'agent', name: 'Agent User' },
    { email: 'collector@ultimateisp.com', roleName: 'collector', name: 'Collector User' },
    { email: 'cashier@ultimateisp.com', roleName: 'cashier', name: 'Cashier User' }
  ];

  console.log('Starting demo user creation...');

  for (const u of usersToCreate) {
    console.log(`Creating ${u.email}...`);
    
    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: u.name }
    });
    
    let userId;
    if (authErr) {
      if (authErr.message.includes('already been registered')) {
        console.log(`${u.email} already exists, attempting to update role...`);
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const found = existingUser.users.find(x => x.email === u.email);
        if (found) userId = found.id;
      } else {
        console.error(`Error creating ${u.email}: ${authErr.message}`);
        continue;
      }
    } else {
      userId = authData.user.id;
      // Wait for the Postgres trigger to create the profile row
      await new Promise(r => setTimeout(r, 2000));
    }
    
    if (userId) {
      const role = roles.find(r => r.name === u.roleName);
      if (!role) {
        console.error(`Role ${u.roleName} not found in DB!`);
        continue;
      }
      
      // Update profile role
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ role_id: role.id })
        .eq('id', userId);
        
      if (updateErr) {
        console.error(`Failed to assign role to ${u.email}:`, updateErr.message);
        
        // If it failed because the row didn't exist (e.g. user was created before migration)
        if (updateErr.details && updateErr.details.includes('0 rows')) {
          console.log(`Profile didn't exist, inserting profile for ${u.email}...`);
          await supabase.from('profiles').insert({
            id: userId,
            email: u.email,
            full_name: u.name,
            role_id: role.id
          });
        }
      } else {
        console.log(`Assigned role ${u.roleName} to ${u.email}`);
      }
    }
  }
  
  console.log('All demo users successfully created and assigned roles!');
}

main().catch(console.error);
