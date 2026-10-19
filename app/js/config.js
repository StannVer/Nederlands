// Cloud accounts and progress sync (Supabase). Both values are public by design: the publishable
// key only allows what the database's row-level security permits (each learner reads and writes
// their own progress row). Left empty, the app runs without login and keeps progress on the device.
export const CONFIG = {
  supabaseUrl: 'https://rjkckukuepufkoxucjra.supabase.co',
  supabaseKey: 'sb_publishable__iy46T0tg-3EEuVgF1fClg_i8JXbs8J',
  teacherName: 'Stan',   // the person the learner presents each theme's task to
  learnerName: 'Monia',  // the learner this course is made for (default name; editable in Réglages)
};
