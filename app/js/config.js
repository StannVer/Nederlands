// Cloud accounts and progress sync (Supabase). Both values are public by design: the publishable
// key only allows what the database's row-level security permits (each learner reads and writes
// their own progress row). Left empty, the app runs without login and keeps progress on the device.
export const CONFIG = {
  supabaseUrl: '',
  supabaseKey: '',
  teacherName: 'Stan',   // the person the learner presents each theme's task to
};
