export type UserRole = 'user' | 'admin';

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
  industry: string;
  website: string;
  description: string;
  created_at: string;
}

export type ContactType = 'Investor' | 'Customer' | 'Potential Employee' | 'Partner' | 'Other';

export interface Individual {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  company_id: string | null;
  description: string;
  created_at: string;
  company?: Company;
}

export interface Conversation {
  id: string;
  date: string;
  notes: string;
  follow_up_required: boolean;
  follow_up_date: string | null;
  company_id: string | null;
  company?: Company;
  conversation_individuals?: ConversationIndividual[];
  created_at: string;
}

export interface ConversationIndividual {
  id: string;
  conversation_id: string;
  individual_id: string;
  individual: Individual;
  created_at: string;
}

export interface SearchResult {
  companies: Company[];
  individuals: Individual[];
  conversations: Conversation[];
}

export type TagCategory = 'Company' | 'Individual' | 'Conversation' | 'All';

export interface Tag {
  id: string;
  name: string;
  color?: string;
  category: TagCategory;
  created_at: string;
} 