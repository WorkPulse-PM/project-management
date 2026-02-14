export type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  image: string | null;
  key: string;
  members: ProjectMember[];
};

export type ProjectCardType = Project;

export type ProjectCardProps = Pick<
  ProjectCardType,
  'id' | 'name' | 'description' | 'createdAt' | 'members' | 'image'
> & {
  projectKey: string;
};

export type ProjectMember = { id: string; name: string; image: string | null };

export type BoardColumn = {
  id: string;
  name: string;
  position: number;
  color: string;
  tasks: BoardTask[];
};

export type BoardTask = {
  id: string;
  title: string;
  key: string;
  dueDate: string;
  status: TaskStatus;
};

export type TaskStatus = {
  id: string;
  name: string;
  color: string;
};
