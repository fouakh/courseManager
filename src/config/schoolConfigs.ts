// School configuration types
export interface TrackConfig {
  label: string;
  color: string;
}

export interface PartConfig {
  label: string;
  color: string;
}

export interface ElementTypeConfig {
  icon: string;
  color: string;
}

export interface SchoolConfig {
  name: string;
  tracks: Record<string, TrackConfig>;
  parts: Record<string, PartConfig>;
  elementTypes: Record<string, ElementTypeConfig>;
  defaultTrack: string;
  defaultPart: string;
  storagePrefix: string;
  brandColor: string;
}

// School configurations
export const SCHOOL_CONFIGS: Record<string, SchoolConfig> = {
  telecom: {
    name: "Télécom Paris",
    tracks: {
      'TSIA': { label: 'TSIA', color: 'bg-purple-100 text-purple-700' },
      'IMA': { label: 'IMA', color: 'bg-orange-100 text-orange-700' },
      'SlotD': { label: 'SlotD', color: 'bg-teal-100 text-teal-700' },
      'Athens': { label: 'Athens', color: 'bg-gray-100 text-gray-700' }
    },
    parts: {
      'P1': { label: 'P1', color: 'bg-indigo-100 text-indigo-700' },
      'P2': { label: 'P2', color: 'bg-pink-100 text-pink-700' },
      'P3': { label: 'P3', color: 'bg-amber-100 text-amber-700' },
      'P4': { label: 'P4', color: 'bg-emerald-100 text-emerald-700' }
    },
    elementTypes: {
      'Lecture': { icon: 'FileText', color: 'bg-blue-100 text-blue-700' },
      'Exercises': { icon: 'Calculator', color: 'bg-green-100 text-green-700' },
      'Course Review': { icon: 'BookMarked', color: 'bg-purple-100 text-purple-700' },
      'Labs': { icon: 'FlaskConical', color: 'bg-orange-100 text-orange-700' },
      'Project': { icon: 'FolderKanban', color: 'bg-yellow-100 text-yellow-700' },
      'Other': { icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-700' }
    },
    defaultTrack: 'TSIA',
    defaultPart: 'P1',
    storagePrefix: 'telecom-course-manager',
    brandColor: 'red'
  },
  
  psl: {
    name: "PSL",
    tracks: {
      'Common': { label: 'Common', color: 'bg-red-100 text-red-700' },
      'CS': { label: 'CS', color: 'bg-red-100 text-red-700' },
      'Math': { label: 'Math', color: 'bg-blue-100 text-blue-700' },
      'Option CS': { label: 'Option CS', color: 'bg-green-100 text-green-700' },
      'Option Math': { label: 'Option Math', color: 'bg-purple-100 text-purple-700' }
    },
    parts: {
      'S1': { label: 'Semester 1', color: 'bg-cyan-100 text-cyan-700' },
      'S2': { label: 'Semester 2', color: 'bg-lime-100 text-lime-700' }
    },
    elementTypes: {
      'Lecture': { icon: 'FileText', color: 'bg-blue-100 text-blue-700' },
      'Exercises': { icon: 'Calculator', color: 'bg-green-100 text-green-700' },
      'Course Review': { icon: 'BookMarked', color: 'bg-purple-100 text-purple-700' },
      'Labs': { icon: 'FlaskConical', color: 'bg-orange-100 text-orange-700' },
      'Project': { icon: 'FolderKanban', color: 'bg-yellow-100 text-yellow-700' },
      'Other': { icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-700' }
    },
    defaultTrack: 'Common',
    defaultPart: 'S1',
    storagePrefix: 'psl-course-manager',
    brandColor: 'blue'
  }
};

// Get school config from URL or default
export const getCurrentSchoolConfig = (): SchoolConfig => {
  const urlParams = new URLSearchParams(window.location.search);
  const school = urlParams.get('school') || 'telecom';
  return SCHOOL_CONFIGS[school] || SCHOOL_CONFIGS.telecom;
};

// Generate icon component map
export const getIconComponent = (iconName: string) => {
  // This would need to be imported from lucide-react based on the icon name
  // For now, we'll return the icon name and handle it in the component
  return iconName;
};