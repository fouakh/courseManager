import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, GraduationCap } from 'lucide-react';
import { SCHOOL_CONFIGS } from '../config/schoolConfigs';

interface SchoolSelectorProps {
  onSchoolSelect: (schoolKey: string) => void;
}

const SchoolSelector: React.FC<SchoolSelectorProps> = ({ onSchoolSelect }) => {
  // Function to get stored courses count for each school
  const getCoursesCount = (schoolKey: string): number => {
    try {
      const config = SCHOOL_CONFIGS[schoolKey];
      const stored = localStorage.getItem(`${config.storagePrefix}-data`);
      if (stored) {
        const courses = JSON.parse(stored);
        return Array.isArray(courses) ? courses.length : 0;
      }
    } catch (error) {
      console.error('Error loading courses count:', error);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Enhanced Header */}
      <div className="relative bg-white shadow-lg border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Course Manager
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced School Selection Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(SCHOOL_CONFIGS).map(([schoolKey, config]) => {
            const coursesCount = getCoursesCount(schoolKey);
            
            return (
              <div
                key={schoolKey}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200"
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${config.brandColor === 'red' ? 'bg-red-100' : 'bg-blue-100'} group-hover:scale-110 transition-transform duration-300`}>
                        <GraduationCap className={`w-8 h-8 ${config.brandColor === 'red' ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {config.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span className="font-medium">{coursesCount} courses</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                    {config.description}
                  </p>

                  {/* Access Button */}
                  <button
                    onClick={() => onSchoolSelect(schoolKey)}
                    className={`w-full ${config.brandColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group-hover:scale-105 shadow-lg hover:shadow-xl`}
                  >
                    <span>Access Courses</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Secure and independent storage
            </h3>
            <p className="text-gray-600 mb-2">
              Each year has its own customized configuration and separate data storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolSelector;