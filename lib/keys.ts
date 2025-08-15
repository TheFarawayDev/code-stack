export const keys = {
  teacher: (id: string) => `teachers:${id}:v1`,
  teacherList: () => `teachers:index:v1`,
  fileMeta: (id: string) => `files:${id}:meta:v1`,
  history: (entity: string, id: string) => `history:${entity}:${id}:v1`,
};
