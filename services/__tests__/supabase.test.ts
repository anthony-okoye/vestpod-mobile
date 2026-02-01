import { supabase } from '../supabase';

describe('Supabase Client', () => {
  it('should be initialized', () => {
    expect(supabase).toBeDefined();
  });

  it('should have auth methods', () => {
    expect(supabase.auth).toBeDefined();
    expect(supabase.auth.signUp).toBeDefined();
    expect(supabase.auth.signInWithPassword).toBeDefined();
    expect(supabase.auth.signOut).toBeDefined();
  });

  it('should have database methods', () => {
    expect(supabase.from).toBeDefined();
  });

  it('should have storage methods', () => {
    expect(supabase.storage).toBeDefined();
  });

  it('should have functions methods', () => {
    expect(supabase.functions).toBeDefined();
  });

  it('should have realtime methods', () => {
    expect(supabase.channel).toBeDefined();
  });
});
