import { supabase } from './lib/supabase';

export interface DoctorRecord {
  id: number;
  name: string;
  email: string | null;
  mobile: string;
  registration_number: string;
  specialization: string;
  hospital_name: string;
  address: string;
  pin_code: string;
  zone_id: number | null;
  profile_photo_url: string | null;
  qualification_certificate_url: string | null;
  medical_council_certificate_url: string | null;
  remarks: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  zones?: {
    id: number;
    name: string;
  };
}

export interface UserRecord {
  id: number;
  name: string;
  email: string | null;
  mobile: string;
  address: string | null;
  pin_code: string;
  zone_id: number | null;
  status: 'active' | 'suspended';
  created_at: string;
  zones?: {
    id: number;
    name: string;
  };
}

export const adminService = {
  // 1. Fetch Doctors by Status
  async getDoctors(statusFilter?: 'pending' | 'approved' | 'rejected' | 'suspended') {
    let query = supabase
      .from('doctors')
      .select('*, zones(id, name)')
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as DoctorRecord[];
  },

  // 2. Approve or Reject Doctor with Audit Log
  async updateDoctorStatus(
    doctorId: number,
    status: 'approved' | 'rejected' | 'suspended',
    remarks?: string
  ) {
   // Safe fallback supporting both Supabase v1 (auth.user()) and v2 (auth.getUser())
const authUser =
  typeof (supabase.auth as any).getUser === 'function'
    ? (await (supabase.auth as any).getUser())?.data?.user
    : (supabase.auth as any).user?.();

const adminId = authUser?.id || 'admin_user';

    const { data, error } = await supabase
      .from('doctors')
      .update({
        status,
        remarks: remarks || null,
      })
      .eq('id', doctorId)
      .select()
      .single();

    if (error) throw error;

    // Record action into audit_logs table
    await supabase.from('audit_logs').insert([
      {
        action: `Doctor ${status.toUpperCase()}`,
        entity: 'doctors',
        entity_id: String(doctorId),
        performed_by: adminId,
      },
    ]);

    return data;
  },

  // 3. Fetch All Users
  async getUsers(statusFilter?: 'active' | 'suspended') {
    let query = supabase
      .from('users')
      .select('*, zones(id, name)')
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as UserRecord[];
  },

  // 4. Update User Status (Active / Suspended)
  async updateUserStatus(userId: number, status: 'active' | 'suspended') {
    const { data, error } = await supabase
      .from('users')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 5. Fetch Support Questions / FAQs
  async getFaqs() {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // 6. Create / Update FAQ
  async upsertFaq(payload: { id?: number; question: string; answer: string; audience: string }) {
    const { data, error } = await supabase
      .from('faq')
      .upsert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};