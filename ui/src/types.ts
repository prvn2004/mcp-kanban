export type Ticket = {
  id: string;
  parent_id: string | null;
  title: string;
  type: string;
  status: string;
  priority: string;
  summary: string;
  context: string;
  acceptance_criteria: string[];
  assigned_to: string | null;
  tasks: any[];
  notes: any[];
};

export type Feature = {
  id: string;
  title: string;
  summary: string;
  owner: string;
  created_at: string;
  updated_at: string;
};

export type Subfeature = {
  id: string;
  parent_feature_id: string;
  title: string;
  summary: string;
  created_at: string;
  updated_at: string;
};
