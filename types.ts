
export enum ActionItemStatus {
  ToDo = "To Do",
  InProgress = "In Progress",
  Done = "Done",
}

export enum ActionItemUrgency {
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

export interface ActionItem {
  id: string;
  task: string;
  assignedTo: string;
  urgency: ActionItemUrgency;
  status: ActionItemStatus;
}

export interface Summary {
  overview: string;
  mainPoints: string[];
  conclusion: string;
  unansweredQuestions: string[];
}

export interface Topic {
  name: string;
  transcriptSections: string[];
}

export interface AnalysisResult {
  topics: Topic[];
  summary: Summary;
  actionItems: ActionItem[];
}
