export type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members: ProjectMember[];
};

export type ProjectCardType = Project;

export type ProjectCardProps = Pick<
  ProjectCardType,
  'id' | 'name' | 'description' | 'createdAt' | 'members'
>;

export type ProjectMember = { name: string; image: string };

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
  dueDate: string;
  status: TaskStatus;
};

export type TaskStatus = {
  id: string;
  name: string;
  color: string;
};
