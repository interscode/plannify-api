export type Shedule = {
  shedule_id: string;
  start_time: string;
  end_time: string;
  subjects_ids: string[];
  user_id: string;
};

export type Subject = {
  subject_id: string;
  name: string;
  teacher: string;
  classroom: string;
  color: string;
  emoji: string;
  day: string;
  start_time: string;
  end_time: string;
  tasks_ids: string[];
  user_id: string;
};

export type Task = {
  task_id: string;
  name: string;
  description: string;
  due_date: string;
  subject_id: string;
  status: string;
  user_id: string;
};

export type TaskWithSubject = Task & {
  subject: Subject;
};

type Horario = { hora: string; aula: string | null };

export type InputSubject = {
  materia: string;
  profesor: string;
  horarios: Record<string, Horario>;
};
