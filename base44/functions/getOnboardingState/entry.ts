import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get organization_id from user record
  const userRecords = await base44.asServiceRole.entities.User.filter({ email: user.email });
  const userRecord = userRecords.find(u => u.organization_id);

  if (!userRecord?.organization_id) {
    return Response.json({
      has_company_profile: false,
      has_active_icp: false,
      has_team_member: false,
      completion_percentage: 0,
    });
  }

  const organization_id = userRecord.organization_id;

  // Check CompanyProfile
  const profiles = await base44.asServiceRole.entities.CompanyProfile.filter({ organization_id });
  const has_company_profile = profiles.length > 0;

  // Check active ICPs
  const icps = await base44.asServiceRole.entities.ICP.filter({ organization_id, is_active: true });
  const has_active_icp = icps.length > 0;

  // Check team members (active users other than org_admin)
  const allUsers = await base44.asServiceRole.entities.User.filter({ organization_id });
  const teamMembers = allUsers.filter(u => u.status === 'active' && u.role !== 'org_admin');
  const has_team_member = teamMembers.length > 0;

  const completedSteps = [has_company_profile, has_active_icp, has_team_member].filter(Boolean).length;
  const completion_percentage = Math.round((completedSteps / 3) * 100);

  return Response.json({
    has_company_profile,
    has_active_icp,
    has_team_member,
    completion_percentage,
    organization_id,
  });
});