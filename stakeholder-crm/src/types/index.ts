export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';
export type CompanyType = 'Investor' | 'Customer' | 'Partner' | 'Vendor' | 'Other';

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  type?: CompanyType;
  description?: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export type ContactType = 'Investor' | 'Customer' | 'Potential Employee' | 'Partner' | 'Other';

export interface Individual {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_id?: string;
  company?: Company;
  role?: string;
  contact_type?: ContactType;
  description?: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Conversation {
  id: string;
  date: string;
  company_id?: string;
  company?: Company;
  individuals?: Individual[];
  notes: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_by: string;
  participants: User[];
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export type TagCategory = 'Company' | 'Individual' | 'Conversation' | 'All';

export interface Tag {
  id: string;
  name: string;
  color?: string;
  category: TagCategory;
  created_at: string;
} 