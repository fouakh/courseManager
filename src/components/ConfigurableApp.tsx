import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  FileText, 
  Calculator, 
  BookMarked, 
  FlaskConical, 
  FolderKanban, 
  MoreHorizontal,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import SchoolSelector from './SchoolSelector';
import { SCHOOL_CONFIGS, getCurrentSchoolConfig, type SchoolConfig } from '../config/schoolConfigs';

// Types
interface Course {
  id: string;
  name: string;
  track: string;
  part: string;
  elements: CourseElement[];
}

interface CourseElement {
  id: string;
  name: string;
  type: string;
  completed: boolean;
}

// Icon mapping
const iconMap = {
  FileText,
  Calculator,
  BookMarked,
  FlaskConical,
  FolderKanban,
  MoreHorizontal
};

const ConfigurableApp: React.FC = () => {
  // School selection state
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(getCurrentSchoolConfig());

  // App state
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrack, setFilterTrack] = useState('');
  const [filterPart, setFilterPart] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');

  // New course form state
  const [newCourse, setNewCourse] = useState({
    name: '',
    track: '',
    part: '',
    elements: [] as CourseElement[]
  });

  // Initialize school selection from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const school = urlParams.get('school');
    if (school && SCHOOL_CONFIGS[school]) {
      setSelectedSchool(school);
      setSchoolConfig(SCHOOL_CONFIGS[school]);
    }
  }, []);

  // Load courses when school changes
  useEffect(() => {
    if (selectedSchool) {
      loadCourses();
    }
  }, [selectedSchool, schoolConfig]);

  const handleSchoolSelect = (schoolKey: string) => {
    setSelectedSchool(schoolKey);
    setSchoolConfig(SCHOOL_CONFIGS[schoolKey]);
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('school', schoolKey);
    window.history.pushState({}, '', url.toString());
  };

  const loadCourses = () => {
    try {
      const stored = localStorage.getItem(`${schoolConfig.storagePrefix}-data`);
      if (stored) {
        setCourses(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const saveCourses = (coursesToSave: Course[]) => {
    try {
      localStorage.setItem(`${schoolConfig.storagePrefix}-data`, JSON.stringify(coursesToSave));
      setCourses(coursesToSave);
    } catch (error) {
      console.error('Error saving courses:', error);
    }
  };

  const addCourse = () => {
    if (newCourse.name.trim()) {
      const course: Course = {
        id: Date.now().toString(),
        name: newCourse.name.trim(),
        track: newCourse.track || schoolConfig.defaultTrack,
        part: newCourse.part || schoolConfig.defaultPart,
        elements: newCourse.elements
      };
      
      const updatedCourses = [...courses, course];
      saveCourses(updatedCourses);
      
      setNewCourse({
        name: '',
        track: '',
        part: '',
        elements: []
      });
      setIsAddingCourse(false);
    }
  };

  const deleteCourse = (courseId: string) => {
    const updatedCourses = courses.filter(course => course.id !== courseId);
    saveCourses(updatedCourses);
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    const updatedCourses = courses.map(course =>
      course.id === courseId ? { ...course, ...updates } : course
    );
    saveCourses(updatedCourses);
  };

  const addElement = (courseId: string) => {
    const element: CourseElement = {
      id: Date.now().toString(),
      name: 'New Element',
      type: 'Lecture',
      completed: false
    };
    
    const updatedCourses = courses.map(course =>
      course.id === courseId
        ? { ...course, elements: [...course.elements, element] }
        : course
    );
    saveCourses(updatedCourses);
  };

  const updateElement = (courseId: string, elementId: string, updates: Partial<CourseElement>) => {
    const updatedCourses = courses.map(course =>
      course.id === courseId
        ? {
            ...course,
            elements: course.elements.map(element =>
              element.id === elementId ? { ...element, ...updates } : element
            )
          }
        : course
    );
    saveCourses(updatedCourses);
  };

  const deleteElement = (courseId: string, elementId: string) => {
    const updatedCourses = courses.map(course =>
      course.id === courseId
        ? {
            ...course,
            elements: course.elements.filter(element => element.id !== elementId)
          }
        : course
    );
    saveCourses(updatedCourses);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(courses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schoolConfig.storagePrefix}-backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importData);
      if (Array.isArray(parsedData)) {
        // Replace all courses with imported data
        saveCourses(parsedData);
        setShowImportDialog(false);
        setImportData('');
      } else {
        alert('Invalid data format. Please ensure the file contains a valid course array.');
      }
    } catch (error) {
      alert('Error parsing JSON data. Please check the format.');
    }
  };

  const handleImportCancel = () => {
    setShowImportDialog(false);
    setImportData('');
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = !filterTrack || course.track === filterTrack;
    const matchesPart = !filterPart || course.part === filterPart;
    return matchesSearch && matchesTrack && matchesPart;
  });

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || MoreHorizontal;
  };

  // Show school selector if no school is selected
  if (!selectedSchool) {
    return <SchoolSelector onSchoolSelect={handleSchoolSelect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedSchool(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Schools</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${schoolConfig.brandColor === 'red' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <BookOpen className={`w-6 h-6 ${schoolConfig.brandColor === 'red' ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{schoolConfig.name}</h1>
                  <p className="text-sm text-gray-600">{courses.length} courses</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowImportDialog(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={() => setIsAddingCourse(true)}
                className={`flex items-center gap-2 px-4 py-2 text-white ${schoolConfig.brandColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} rounded-lg transition-colors`}
              >
                <Plus className="w-4 h-4" />
                Add Course
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Tracks</option>
            {Object.entries(schoolConfig.tracks).map(([key, track]) => (
              <option key={key} value={key}>{track.label}</option>
            ))}
          </select>
          
          <select
            value={filterPart}
            onChange={(e) => setFilterPart(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Parts</option>
            {Object.entries(schoolConfig.parts).map(([key, part]) => (
              <option key={key} value={key}>{part.label}</option>
            ))}
          </select>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Add Course Card */}
          {isAddingCourse && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Course name"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newCourse.track}
                    onChange={(e) => setNewCourse({ ...newCourse, track: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Track</option>
                    {Object.entries(schoolConfig.tracks).map(([key, track]) => (
                      <option key={key} value={key}>{track.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={newCourse.part}
                    onChange={(e) => setNewCourse({ ...newCourse, part: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Part</option>
                    {Object.entries(schoolConfig.parts).map(([key, part]) => (
                      <option key={key} value={key}>{part.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={addCourse}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsAddingCourse(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Course Cards */}
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {editingCourse === course.id ? (
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                      className="w-full text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                      onBlur={() => setEditingCourse(null)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingCourse(null)}
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                  )}
                  
                  <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${schoolConfig.tracks[course.track]?.color || 'bg-gray-100 text-gray-700'}`}>
                      {schoolConfig.tracks[course.track]?.label || course.track}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${schoolConfig.parts[course.part]?.color || 'bg-gray-100 text-gray-700'}`}>
                      {schoolConfig.parts[course.part]?.label || course.part}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingCourse(course.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Course Elements */}
              <div className="space-y-2">
                {course.elements.map((element) => {
                  const IconComponent = getIconComponent(schoolConfig.elementTypes[element.type]?.icon || 'MoreHorizontal');
                  return (
                    <div key={element.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group">
                      <input
                        type="checkbox"
                        checked={element.completed}
                        onChange={(e) => updateElement(course.id, element.id, { completed: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      
                      <div className={`p-1 rounded ${schoolConfig.elementTypes[element.type]?.color || 'bg-gray-100 text-gray-700'}`}>
                        <IconComponent className="w-3 h-3" />
                      </div>
                      
                      <input
                        type="text"
                        value={element.name}
                        onChange={(e) => updateElement(course.id, element.id, { name: e.target.value })}
                        className={`flex-1 bg-transparent outline-none ${element.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
                      />
                      
                      <select
                        value={element.type}
                        onChange={(e) => updateElement(course.id, element.id, { type: e.target.value })}
                        className="text-xs bg-transparent outline-none text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {Object.entries(schoolConfig.elementTypes).map(([key, type]) => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => deleteElement(course.id, element.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                
                <button
                  onClick={() => addElement(course.id)}
                  className="w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Element
                </button>
              </div>

              {/* Progress */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{course.elements.filter(e => e.completed).length}/{course.elements.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${schoolConfig.brandColor === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{
                      width: course.elements.length > 0 
                        ? `${(course.elements.filter(e => e.completed).length / course.elements.length) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && !isAddingCourse && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">
              {courses.length === 0 
                ? "Get started by adding your first course"
                : "Try adjusting your search or filters"
              }
            </p>
            {courses.length === 0 && (
              <button
                onClick={() => setIsAddingCourse(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-white ${schoolConfig.brandColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} rounded-lg transition-colors`}
              >
                <Plus className="w-4 h-4" />
                Add Your First Course
              </button>
            )}
          </div>
        )}
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Import Course Data</h3>
                  <p className="text-sm text-gray-600">This will replace all existing courses</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your JSON data below:
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Paste your exported JSON data here..."
                />
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Warning: This action cannot be undone</p>
                    <p>All your current courses will be permanently replaced with the imported data. Make sure to export your current data first if you want to keep it.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleImportCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importData.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Replace All Courses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurableApp;