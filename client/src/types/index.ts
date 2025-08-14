export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    presenterId: string;
    presenterName: string;
    type: string;
    description?: string;
  };
}

export interface AdminModeContext {
  adminMode: boolean;
  toggleAdminMode: () => void;
}

export interface AppStats {
  activeMembers: number;
  phdStudents: number;
  mtechStudents: number;
  btechStudents: number;
  interns: number;
  expiringSoon: number;
}
