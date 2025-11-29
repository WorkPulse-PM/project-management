import InviteMembersForm from '@/components/projects/members/InviteMembersForm';

export default function MembersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Project Members</h2>
          <p className="text-sm text-fg-tertiary">
            Manage who has access to this project.
          </p>
        </div>
      </div>
      <InviteMembersForm />
    </div>
  );
}
