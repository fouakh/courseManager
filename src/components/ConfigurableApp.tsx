import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, BookOpen, Edit2, Trash2, X, Filter, ArrowLeft, ExternalLink, Image, Download, Upload, ChevronDown, ChevronRight, Lock, Unlock, Calendar, Settings } from 'lucide-react';
import { getCurrentSchoolConfig, SchoolConfig } from '../config/schoolConfigs';
import SchoolSelector from './SchoolSelector';

// Import icon components from lucide-react
import { FileText, Calculator, BookMarked, FlaskConical, MoreHorizontal, FolderKanban, Users } from 'lucide-react';

interface Link {
  name: string;
  url: string;
}

interface Element {
  id: string;
  type: string;
  name: string;
  links: Link[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  ects: number;
  track: string;
  part: string;
  bannerImage?: string;
  elements: Element[];
}

interface CourseFormData {
  title: string;
  description: string;
  courseCode: string;
  ects: number;
  track: string;
  part: string;
  bannerImage: string;
}

interface ElementFormData {
  type: string;
  name: string;
  links: Link[];
}

// Icon mapping
const iconMap = {
  FileText,
  Calculator,
  BookMarked,
  FlaskConical,
  MoreHorizontal,
  FolderKanban,
  BookOpen,
  Users
};

const ConfigurableApp: React.FC = () => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [partFilter, setPartFilter] = useState<string>('all');
  const [elementTypeFilter, setElementTypeFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAddElementModalOpen, setIsAddElementModalOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [isTrackFilterOpen, setIsTrackFilterOpen] = useState(false);
  const [isPartFilterOpen, setIsPartFilterOpen] = useState(false);
  const [isElementTypeFilterOpen, setIsElementTypeFilterOpen] = useState(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [schoolYear, setSchoolYear] = useState<string>('');
  const [schoolDescription, setSchoolDescription] = useState<string>('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    courseCode: '',
    ects: 0,
    track: '',
    part: '',
    bannerImage: ''
  });
  const [elementFormData, setElementFormData] = useState<ElementFormData>({
    type: '',
    name: '',
    links: [{ name: '', url: '' }]
  });

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerImageInputRef = useRef<HTMLInputElement>(null);
  const courseBannerInputRef = useRef<HTMLInputElement>(null);

  // Initialize school configuration
  useEffect(() => {
    if (selectedSchool) {
      const schoolConfig = getCurrentSchoolConfig();
      setConfig(schoolConfig);
      
      // Load data for this school
      loadSchoolData(schoolConfig);
      
      // Reset form defaults
      setFormData(prev => ({
        ...prev,
        track: schoolConfig.defaultTrack,
        part: schoolConfig.defaultPart
      }));
      
      setElementFormData(prev => ({
        ...prev,
        type: Object.keys(schoolConfig.elementTypes)[0]
      }));
    }
  }, [selectedSchool]);

  // localStorage utilities with school-specific keys
  const getStorageKey = (key: string) => {
    return config ? `${config.storagePrefix}-${key}` : key;
  };

  const loadSchoolData = (schoolConfig: SchoolConfig) => {
    try {
      // Load courses
      const coursesKey = `${schoolConfig.storagePrefix}-data`;
      const stored = localStorage.getItem(coursesKey);
      if (stored) {
        const parsedData = JSON.parse(stored);
        if (Array.isArray(parsedData)) {
          setCourses(parsedData.map(course => ({
            ...course,
            elements: course.elements.map((element: any) => {
              let links: Link[] = [];
              
              if (element.links) {
                if (Array.isArray(element.links)) {
                  if (element.links.length > 0 && typeof element.links[0] === 'object' && element.links[0].name !== undefined) {
                    links = element.links;
                  } else {
                    links = element.links.map((url: string, index: number) => ({
                      name: `Link ${index + 1}`,
                      url: url
                    }));
                  }
                }
              } else if (element.link) {
                links = [{ name: 'Link 1', url: element.link }];
              }
              
              return {
                ...element,
                links: links
              };
            })
          })));
        }
      } else {
        setCourses([]);
      }

      // Load header image
      const headerImageKey = `${schoolConfig.storagePrefix}-header-image`;
      const headerImageData = localStorage.getItem(headerImageKey);
      setHeaderImage(headerImageData);

      // Load lock state
      const lockStateKey = `${schoolConfig.storagePrefix}-lock-state`;
      const lockState = localStorage.getItem(lockStateKey);
      setIsLocked(lockState === 'true');

      // Load school year
      const yearKey = `${schoolConfig.storagePrefix}-year`;
      const savedYear = localStorage.getItem(yearKey);
      setSchoolYear(savedYear || new Date().getFullYear().toString());

      // Load school description
      const descriptionKey = `${schoolConfig.storagePrefix}-description`;
      const savedDescription = localStorage.getItem(descriptionKey);
      setSchoolDescription(savedDescription || schoolConfig.description);

    } catch (error) {
      console.error('Error loading school data:', error);
      setCourses([]);
      setHeaderImage(null);
      setIsLocked(false);
      setSchoolYear(new Date().getFullYear().toString());
      setSchoolDescription(config?.description || '');
    }
  };

  const saveCoursesToStorage = (courses: Course[]) => {
    if (!config) return;
    try {
      const coursesKey = `${config.storagePrefix}-data`;
      localStorage.setItem(coursesKey, JSON.stringify(courses));
    } catch (error) {
      console.error('Error saving courses to localStorage:', error);
    }
  };

  const saveHeaderImageToStorage = (imageData: string | null) => {
    if (!config) return;
    try {
      const headerImageKey = `${config.storagePrefix}-header-image`;
      if (imageData) {
        localStorage.setItem(headerImageKey, imageData);
      } else {
        localStorage.removeItem(headerImageKey);
      }
    } catch (error) {
      console.error('Error saving header image to localStorage:', error);
    }
  };

  const saveLockStateToStorage = (isLocked: boolean) => {
    if (!config) return;
    try {
      const lockStateKey = `${config.storagePrefix}-lock-state`;
      localStorage.setItem(lockStateKey, isLocked.toString());
    } catch (error) {
      console.error('Error saving lock state to localStorage:', error);
    }
  };

  const saveSchoolYearToStorage = (year: string) => {
    if (!config) return;
    try {
      const yearKey = `${config.storagePrefix}-year`;
      localStorage.setItem(yearKey, year);
    } catch (error) {
      console.error('Error saving school year to localStorage:', error);
    }
  };

  const saveSchoolDescriptionToStorage = (description: string) => {
    if (!config) return;
    try {
      const descriptionKey = `${config.storagePrefix}-description`;
      localStorage.setItem(descriptionKey, description);
    } catch (error) {
      console.error('Error saving school description to localStorage:', error);
    }
  };

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (config) {
      saveCoursesToStorage(courses);
    }
  }, [courses, config]);

  useEffect(() => {
    if (config) {
      saveHeaderImageToStorage(headerImage);
    }
  }, [headerImage, config]);

  useEffect(() => {
    if (config) {
      saveLockStateToStorage(isLocked);
    }
  }, [isLocked, config]);

  useEffect(() => {
    if (config) {
      saveSchoolYearToStorage(schoolYear);
    }
  }, [schoolYear, config]);

  useEffect(() => {
    if (config) {
      saveSchoolDescriptionToStorage(schoolDescription);
    }
  }, [schoolDescription, config]);

  // Get icon component
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || FileText;
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    if (!config) return [];
    
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTrack = trackFilter === 'all' || course.track === trackFilter;
      const matchesPart = partFilter === 'all' || course.part === partFilter;
      return matchesSearch && matchesTrack && matchesPart;
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [courses, searchTerm, trackFilter, partFilter, config]);

  // Filtered elements
  const filteredElements = useMemo(() => {
    if (!selectedCourse || !config) return [];
    
    return selectedCourse.elements.filter(element => {
      const matchesType = elementTypeFilter === 'all' || element.type === elementTypeFilter;
      return matchesType;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCourse, elementTypeFilter, config]);

  // Course stats
  const courseStats = useMemo(() => {
    if (!config) return { total: 0, trackStats: {}, partStats: {} };
    
    const total = courses.length;
    const trackStats: Record<string, number> = {};
    const partStats: Record<string, number> = {};
    
    Object.keys(config.tracks).forEach(track => {
      trackStats[track] = courses.filter(c => c.track === track).length;
    });
    
    Object.keys(config.parts).forEach(part => {
      partStats[part] = courses.filter(c => c.part === part).length;
    });
    
    return { total, trackStats, partStats };
  }, [courses, config]);

  // Element type stats
  const elementTypeStats = useMemo(() => {
    if (!selectedCourse || !config) return {};
    
    const stats: Record<string, number> = {
      total: selectedCourse.elements.length
    };
    
    Object.keys(config.elementTypes).forEach(type => {
      stats[type] = selectedCourse.elements.filter(e => e.type === type).length;
    });
    
    return stats;
  }, [selectedCourse, config]);

  // Handle school selection
  const handleSchoolSelect = (schoolKey: string) => {
    setSelectedSchool(schoolKey);
    // Update URL to reflect school selection
    const url = new URL(window.location.href);
    url.searchParams.set('school', schoolKey);
    window.history.pushState({}, '', url.toString());
  };

  // Handle back to selector
  const handleBackToSchoolSelector = () => {
    setSelectedSchool(null);
    setSelectedCourse(null);
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('school');
    window.history.pushState({}, '', url.toString());
  };

  // Toggle lock functionality
  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  // Header image upload functionality
  const handleHeaderImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setHeaderImage(result);
    };
    reader.readAsDataURL(file);

    if (headerImageInputRef.current) {
      headerImageInputRef.current.value = '';
    }
  };

  const removeHeaderImage = () => {
    if (isLocked) return;
    setHeaderImage(null);
  };

  // Course banner image upload functionality
  const handleCourseBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData({...formData, bannerImage: result});
    };
    reader.readAsDataURL(file);

    if (courseBannerInputRef.current) {
      courseBannerInputRef.current.value = '';
    }
  };

  const removeCourseBanner = () => {
    if (isLocked) return;
    setFormData({...formData, bannerImage: ''});
  };

  // Export functionality
  const handleExportData = () => {
    if (!config) return;
    
    try {
      const dataToExport = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        school: selectedSchool,
        courses: courses,
        headerImage: headerImage,
        isLocked: isLocked,
        schoolYear: schoolYear,
        schoolDescription: schoolDescription
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.storagePrefix}-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  // Import functionality
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !config) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        let coursesToImport: Course[] = [];
        let importedHeaderImage: string | null = null;
        let importedLockState: boolean = false;
        let importedSchoolYear: string = new Date().getFullYear().toString();
        let importedSchoolDescription: string = config.description;
        
        if (importedData.courses && Array.isArray(importedData.courses)) {
          coursesToImport = importedData.courses;
          importedHeaderImage = importedData.headerImage || null;
          importedLockState = importedData.isLocked || false;
          importedSchoolYear = importedData.schoolYear || new Date().getFullYear().toString();
          importedSchoolDescription = importedData.schoolDescription || config.description;
        } else if (Array.isArray(importedData)) {
          coursesToImport = importedData;
        } else {
          throw new Error('Invalid file format');
        }
        
        const validCourses = coursesToImport.filter(course => {
          return course.id && course.title && course.courseCode && 
                 course.track && course.part && Array.isArray(course.elements);
        }).map(course => ({
          ...course,
          elements: course.elements.map((element: any) => {
            let links: Link[] = [];
            
            if (element.links) {
              if (Array.isArray(element.links)) {
                if (element.links.length > 0 && typeof element.links[0] === 'object' && element.links[0].name !== undefined) {
                  links = element.links;
                } else {
                  links = element.links.map((url: string, index: number) => ({
                    name: `Link ${index + 1}`,
                    url: url
                  }));
                }
              }
            } else if (element.link) {
              links = [{ name: 'Link 1', url: element.link }];
            }
            
            return {
              ...element,
              links: links
            };
          })
        }));
        
        if (validCourses.length === 0) {
          throw new Error('No valid courses found in the file');
        }
        
        const processedCourses = validCourses.map(course => ({
          ...course,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          elements: course.elements.map(element => ({
            ...element,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
          }))
        }));
        
        const shouldReplace = confirm(
          `Found ${validCourses.length} valid course(s) to import.\n\n` +
          `Click OK to REPLACE all current data, or Cancel to MERGE with existing courses.`
        );
        
        if (shouldReplace) {
          setCourses(processedCourses);
          setHeaderImage(importedHeaderImage);
          setIsLocked(importedLockState);
          setSchoolYear(importedSchoolYear);
          setSchoolDescription(importedSchoolDescription);
          alert(`Successfully replaced all data with ${processedCourses.length} imported course(s)!`);
        } else {
          setCourses(prevCourses => [...prevCourses, ...processedCourses]);
          alert(`Successfully imported ${processedCourses.length} course(s)!`);
        }
        
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format and try again.');
      }
    };
    
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Course management functions
  const handleAddCourse = () => {
    if (isLocked || !config) return;
    
    if (formData.title.trim() && formData.courseCode.trim()) {
      const newCourse: Course = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        courseCode: formData.courseCode,
        ects: formData.ects,
        track: formData.track,
        part: formData.part,
        bannerImage: formData.bannerImage,
        elements: []
      };
      setCourses([...courses, newCourse]);
      resetForm();
      setIsAddModalOpen(false);
      setSelectedCourse(newCourse);
    }
  };

  const handleEditCourse = (course: Course) => {
    if (isLocked) return;
    
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      courseCode: course.courseCode,
      ects: course.ects,
      track: course.track,
      part: course.part,
      bannerImage: course.bannerImage || ''
    });
  };

  const handleUpdateCourse = () => {
    if (isLocked || !editingCourse) return;
    
    if (formData.title.trim() && formData.courseCode.trim()) {
      const updatedCourse = { 
        ...editingCourse, 
        title: formData.title,
        description: formData.description,
        courseCode: formData.courseCode,
        ects: formData.ects,
        track: formData.track,
        part: formData.part,
        bannerImage: formData.bannerImage
      };
      setCourses(courses.map(course => 
        course.id === editingCourse.id ? updatedCourse : course
      ));
      if (selectedCourse && selectedCourse.id === editingCourse.id) {
        setSelectedCourse(updatedCourse);
      }
      resetForm();
      setEditingCourse(null);
    }
  };

  const handleDeleteCourse = (id: string) => {
    if (isLocked) return;
    
    const courseToDelete = courses.find(course => course.id === id);
    if (!courseToDelete) return;

    const confirmDelete = confirm(`Are you sure you want to delete the course "${courseToDelete.title}"?\n\nThis action cannot be undone.`);
    if (!confirmDelete) return;

    setCourses(courses.filter(course => course.id !== id));
    if (selectedCourse && selectedCourse.id === id) {
      setSelectedCourse(null);
    }
  };

  // Element management functions
  const addLinkToElement = () => {
    setElementFormData({
      ...elementFormData,
      links: [...elementFormData.links, { name: '', url: '' }]
    });
  };

  const removeLinkFromElement = (index: number) => {
    if (elementFormData.links.length > 1) {
      setElementFormData({
        ...elementFormData,
        links: elementFormData.links.filter((_, i) => i !== index)
      });
    }
  };

  const updateElementLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...elementFormData.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setElementFormData({
      ...elementFormData,
      links: newLinks
    });
  };

  const handleAddElement = () => {
    if (isLocked || !selectedCourse) return;
    
    if (elementFormData.name.trim()) {
      const validLinks = elementFormData.links.filter(link => link.url.trim() !== '');
      
      const newElement: Element = {
        id: Date.now().toString(),
        type: elementFormData.type,
        name: elementFormData.name,
        links: validLinks
      };
      const updatedCourse = {
        ...selectedCourse,
        elements: [...selectedCourse.elements, newElement].sort((a, b) => a.name.localeCompare(b.name))
      };
      setCourses(courses.map(course => 
        course.id === selectedCourse.id ? updatedCourse : course
      ));
      setSelectedCourse(updatedCourse);
      resetElementForm();
      setIsAddElementModalOpen(false);
    }
  };

  const handleEditElement = (element: Element) => {
    if (isLocked) return;
    
    setEditingElement(element);
    setElementFormData({
      type: element.type,
      name: element.name,
      links: element.links.length > 0 ? element.links : [{ name: '', url: '' }]
    });
  };

  const handleUpdateElement = () => {
    if (isLocked || !selectedCourse || !editingElement) return;
    
    if (elementFormData.name.trim()) {
      const validLinks = elementFormData.links.filter(link => link.url.trim() !== '');
      
      const updatedElements = selectedCourse.elements.map(element =>
        element.id === editingElement.id ? { 
          ...element, 
          type: elementFormData.type,
          name: elementFormData.name,
          links: validLinks
        } : element
      ).sort((a, b) => a.name.localeCompare(b.name));
      
      const updatedCourse = { ...selectedCourse, elements: updatedElements };
      setCourses(courses.map(course => 
        course.id === selectedCourse.id ? updatedCourse : course
      ));
      setSelectedCourse(updatedCourse);
      resetElementForm();
      setEditingElement(null);
    }
  };

  const handleDeleteElement = (elementId: string) => {
    if (isLocked || !selectedCourse) return;
    
    const elementToDelete = selectedCourse.elements.find(element => element.id === elementId);
    if (!elementToDelete) return;

    const confirmDelete = confirm(`Are you sure you want to delete the element "${elementToDelete.name}"?\n\nThis action cannot be undone.`);
    if (!confirmDelete) return;

    const updatedElements = selectedCourse.elements.filter(element => element.id !== elementId);
    const updatedCourse = { ...selectedCourse, elements: updatedElements };
    setCourses(courses.map(course => 
      course.id === selectedCourse.id ? updatedCourse : course
    ));
    setSelectedCourse(updatedCourse);
  };

  const resetForm = () => {
    if (!config) return;
    
    setFormData({
      title: '',
      description: '',
      courseCode: '',
      ects: 0,
      track: config.defaultTrack,
      part: config.defaultPart,
      bannerImage: ''
    });
  };

  const resetElementForm = () => {
    if (!config) return;
    
    setElementFormData({
      type: Object.keys(config.elementTypes)[0],
      name: '',
      links: [{ name: '', url: '' }]
    });
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingCourse(null);
    resetForm();
  };

  const closeElementModal = () => {
    setIsAddElementModalOpen(false);
    setEditingElement(null);
    resetElementForm();
  };

  // Show school selector if no school is selected
  if (!selectedSchool || !config) {
    return <SchoolSelector onSchoolSelect={handleSchoolSelect} />;
  }

  // If a course is selected, show the course detail page
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Course Banner */}
        <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
          {selectedCourse.bannerImage ? (
            <img 
              src={selectedCourse.bannerImage} 
              alt={selectedCourse.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Image className="w-16 h-16 text-white opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          {/* Back Button */}
          <button
            onClick={() => setSelectedCourse(null)}
            className="absolute top-6 left-6 p-2 bg-white bg-opacity-20 backdrop-blur-sm text-white hover:bg-opacity-30 transition-all rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Course Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-mono bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
                {selectedCourse.courseCode}
              </span>
              <span className="text-sm font-medium bg-blue-500 bg-opacity-80 backdrop-blur-sm px-3 py-1 rounded-full">
                {selectedCourse.ects} ECTS
              </span>
              <span className={`text-sm font-medium bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full`}>
                {config.tracks[selectedCourse.track]?.label}
              </span>
              <span className={`text-sm font-medium bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full`}>
                {config.parts[selectedCourse.part]?.label}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{selectedCourse.title}</h1>
            <p className="text-white text-opacity-90 text-lg">{selectedCourse.description}</p>
          </div>
        </div>

        {/* Course Actions */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Element Type Filter */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsElementTypeFilterOpen(!isElementTypeFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {elementTypeFilter === 'all' ? 'All Types' : elementTypeFilter}
                  </span>
                  {isElementTypeFilterOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {isElementTypeFilterOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setElementTypeFilter('all');
                        setIsElementTypeFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        elementTypeFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      <span>All Types</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                        {elementTypeStats.total}
                      </span>
                    </button>
                    
                    {Object.entries(config.elementTypes).map(([type, elementConfig]) => {
                      const IconComponent = getIconComponent(elementConfig.icon);
                      const count = elementTypeStats[type] || 0;
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            setElementTypeFilter(type);
                            setIsElementTypeFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                            elementTypeFilter === type ? elementConfig.color.replace('100', '50') : 'text-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <span>{type}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            elementTypeFilter === type ? elementConfig.color : 'bg-gray-200'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                Showing {filteredElements.length} of {selectedCourse.elements.length} elements
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isLocked && (
                <>
                  <button
                    onClick={() => handleEditCourse(selectedCourse)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Course
                  </button>
                  <button
                    onClick={() => setIsAddElementModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Element
                  </button>
                </>
              )}
              {isLocked && (
                <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Editing is locked</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Elements Section */}
        <div className="p-8">
          {filteredElements.length > 0 ? (
            <div className="space-y-3">
              {filteredElements.map((element) => {
                const ElementIcon = getIconComponent(config.elementTypes[element.type]?.icon || 'FileText');
                const elementConfig = config.elementTypes[element.type];
                return (
                  <div key={element.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${elementConfig?.color || 'bg-gray-100 text-gray-700'} flex-shrink-0`}>
                          <ElementIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-1">{element.name}</h3>
                          <span className={`text-sm px-2 py-1 rounded-full ${elementConfig?.color || 'bg-gray-100 text-gray-700'} inline-block mb-2`}>
                            {element.type}
                          </span>
                          {element.links.length > 0 && (
                            <div className="space-y-1">
                              {element.links.map((link, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <ExternalLink className="w-3 h-3 text-gray-400" />
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                                  >
                                    {link.name || 'Unnamed Link'}
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isLocked && (
                          <>
                            <button
                              onClick={() => handleEditElement(element)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteElement(element.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : selectedCourse.elements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No elements yet</h3>
              <p className="text-gray-400 mb-4">Start by adding lectures, exercises, or other course materials</p>
              {!isLocked && (
                <button
                  onClick={() => setIsAddElementModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add First Element
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No elements match the filter</h3>
              <p className="text-gray-400 mb-4">Try selecting a different element type or clear the filter</p>
              <button
                onClick={() => setElementTypeFilter('all')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Show All Elements
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Element Modal */}
        {(isAddElementModalOpen || editingElement) && !isLocked && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingElement ? 'Edit Element' : 'Add New Element'}
                </h3>
                <button
                  onClick={closeElementModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Element Type
                  </label>
                  <select
                    value={elementFormData.type}
                    onChange={(e) => setElementFormData({...elementFormData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.keys(config.elementTypes).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Element Name
                  </label>
                  <input
                    type="text"
                    value={elementFormData.name}
                    onChange={(e) => setElementFormData({...elementFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter element name"
                    required
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Links
                    </label>
                    <button
                      type="button"
                      onClick={addLinkToElement}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Link
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {elementFormData.links.map((link, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Link {index + 1}</span>
                          {elementFormData.links.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLinkFromElement(index)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={link.name}
                            onChange={(e) => updateElementLink(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Link name (e.g., Lecture Slides, Exercise Sheet)"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateElementLink(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://drive.google.com/..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You can add multiple links with custom names for this element
                  </p>
                </div>
                
                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={closeElementModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={editingElement ? handleUpdateElement : handleAddElement}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingElement ? 'Update' : 'Add'} Element
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Course Edit Modal */}
        {editingCourse && !isLocked && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Edit Course</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image
                  </label>
                  {formData.bannerImage ? (
                    <div className="relative">
                      <img 
                        src={formData.bannerImage} 
                        alt="Course banner preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeCourseBanner}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => courseBannerInputRef.current?.click()}
                      className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex flex-col items-center justify-center hover:from-blue-200 hover:to-purple-200 transition-colors border-2 border-dashed border-gray-300"
                    >
                      <Image className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Upload Banner Image</span>
                    </button>
                  )}
                  <input
                    ref={courseBannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCourseBannerUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Upload a banner image for your course
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Code
                    </label>
                    <input
                      type="text"
                      value={formData.courseCode}
                      onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., CS301"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ECTS Credits
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={formData.ects}
                      onChange={(e) => setFormData({...formData, ects: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="6.0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Track
                    </label>
                    <select
                      value={formData.track}
                      onChange={(e) => setFormData({...formData, track: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(config.tracks).map(([trackKey, track]) => (
                        <option key={trackKey} value={trackKey}>{track.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Part
                    </label>
                    <select
                      value={formData.part}
                      onChange={(e) => setFormData({...formData, part: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(config.parts).map(([partKey, part]) => (
                        <option key={partKey} value={partKey}>{part.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateCourse}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main course list view
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex flex-col items-center mb-8">

            
            {/* Back to School Selector Button */}
            <button
              onClick={handleBackToSchoolSelector}
              className="w-full flex items-center gap-2 px-4 py-2 mb-4 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to the Main Page</span>
            </button>
            
            {/* Header Image Section */}
            <div className="w-full flex justify-center mb-4">
              {headerImage ? (
                <div className="relative">
                  <img 
                    src={headerImage} 
                    alt="Course Management" 
                    style={{ 
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px'
                    }}
                  />
                  {!isLocked && (
                    <button
                      onClick={removeHeaderImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                !isLocked && (
                  <button
                    onClick={() => headerImageInputRef.current?.click()}
                    className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex flex-col items-center justify-center hover:from-blue-200 hover:to-purple-200 transition-colors border-2 border-dashed border-gray-300"
                  >
                    <Image className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload Image</span>
                  </button>
                )
              )}
              <input
                ref={headerImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeaderImageUpload}
                className="hidden"
              />
            </div>

            {/* School Year Section */}
            <div className="w-full mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Academic Year</label>
              </div>
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                disabled={isLocked}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="2024-2025"
              />
            </div>

            {/* School Description Section */}
            <div className="w-full mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Description</label>
                </div>
                {!isLocked && (
                  <button
                    onClick={() => setIsEditingDescription(!isEditingDescription)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              {isEditingDescription && !isLocked ? (
                <textarea
                  value={schoolDescription}
                  onChange={(e) => setSchoolDescription(e.target.value)}
                  onBlur={() => setIsEditingDescription(false)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={3}
                  placeholder="Enter description..."
                  autoFocus
                />
              ) : (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {schoolDescription || 'No description available'}
                </p>
              )}
            </div>
          </div>

          {/* Lock Button */}
          <div className="mb-6">
            <button
              onClick={toggleLock}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLocked 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span className="font-medium">
                {isLocked ? 'Locked' : 'Unlocked'}
              </span>
            </button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {isLocked ? 'No modifications allowed' : 'Modifications allowed'}
            </p>
          </div>

          {/* Import/Export Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Backup & Restore</h3>
            <div className="space-y-2">
              <button
                onClick={handleExportData}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export your courses to backup or import from a previous backup
            </p>
          </div>
          
          <nav className="space-y-6">
            {/* Track Filters */}
            <div>
              <button
                onClick={() => setIsTrackFilterOpen(!isTrackFilterOpen)}
                className="flex items-center gap-2 mb-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                {isTrackFilterOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <Filter className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">Filter by Track</h3>
              </button>
              
              {isTrackFilterOpen && (
                <div className="space-y-1 ml-6">
                  <button
                    onClick={() => setTrackFilter('all')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      trackFilter === 'all' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>All Tracks</span>
                    <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {courseStats.total}
                    </span>
                  </button>
                  
                  {Object.entries(config.tracks).map(([track, trackConfig]) => (
                    <button
                      key={track}
                      onClick={() => setTrackFilter(track)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        trackFilter === track 
                          ? trackConfig.color.replace('100', '50') 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{trackConfig.label}</span>
                      <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                        trackFilter === track ? trackConfig.color : 'bg-gray-200'
                      }`}>
                        {courseStats.trackStats[track] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Part Filters */}
            <div>
              <button
                onClick={() => setIsPartFilterOpen(!isPartFilterOpen)}
                className="flex items-center gap-2 mb-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                {isPartFilterOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <Filter className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">Filter by Part</h3>
              </button>
              
              {isPartFilterOpen && (
                <div className="space-y-1 ml-6">
                  <button
                    onClick={() => setPartFilter('all')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      partFilter === 'all' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>All Parts</span>
                    <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {courseStats.total}
                    </span>
                  </button>
                  
                  {Object.entries(config.parts).map(([part, partConfig]) => (
                    <button
                      key={part}
                      onClick={() => setPartFilter(part)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        partFilter === part 
                          ? partConfig.color.replace('100', '50') 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{partConfig.label}</span>
                      <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                        partFilter === part ? partConfig.color : 'bg-gray-200'
                      }`}>
                        {courseStats.partStats[part] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {trackFilter !== 'all' && partFilter !== 'all' 
                  ? `${config.tracks[trackFilter]?.label} - ${config.parts[partFilter]?.label}`
                  : trackFilter !== 'all' 
                    ? `${config.tracks[trackFilter]?.label} Courses`
                    : partFilter !== 'all'
                      ? `${config.parts[partFilter]?.label} Courses`
                      : 'All Courses'
                }
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {!isLocked && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="flex-1 p-8">
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-medium text-gray-500 mb-4">Welcome to Course Manager</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Get started by creating your first course. You can organize your lectures, exercises, and course materials all in one place.
              </p>
              {!isLocked && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Course
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                >
                  {/* Course Banner Preview */}
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                    {course.bannerImage ? (
                      <img 
                        src={course.bannerImage} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Image className="w-8 h-8 text-white opacity-50" />
                      </div>
                    )}
                    {!isLocked && (
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCourse(course);
                          }}
                          className="p-1 bg-white bg-opacity-20 backdrop-blur-sm text-white hover:bg-opacity-30 transition-all rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(course.id);
                          }}
                          className="p-1 bg-white bg-opacity-20 backdrop-blur-sm text-white hover:bg-opacity-30 transition-all rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {course.courseCode}
                      </span>
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {course.ects} ECTS
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.tracks[course.track]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {config.tracks[course.track]?.label || course.track}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.parts[course.part]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {config.parts[course.part]?.label || course.part}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      {course.elements.length} element{course.elements.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {courses.length > 0 && filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No courses found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      {(isAddModalOpen || editingCourse) && !isLocked && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                {formData.bannerImage ? (
                  <div className="relative">
                    <img 
                      src={formData.bannerImage} 
                      alt="Course banner preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeCourseBanner}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => courseBannerInputRef.current?.click()}
                    className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex flex-col items-center justify-center hover:from-blue-200 hover:to-purple-200 transition-colors border-2 border-dashed border-gray-300"
                  >
                    <Image className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload Banner Image</span>
                  </button>
                )}
                <input
                  ref={courseBannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCourseBannerUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Upload a banner image for your course
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., CS301"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ECTS Credits
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={formData.ects}
                    onChange={(e) => setFormData({...formData, ects: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="6.0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Track
                  </label>
                  <select
                    value={formData.track}
                    onChange={(e) => setFormData({...formData, track: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(config.tracks).map(([trackKey, track]) => (
                      <option key={trackKey} value={trackKey}>{track.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Part
                  </label>
                  <select
                    value={formData.part}
                    onChange={(e) => setFormData({...formData, part: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(config.parts).map(([partKey, part]) => (
                      <option key={partKey} value={partKey}>{part.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCourse ? 'Update' : 'Add'} Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurableApp;