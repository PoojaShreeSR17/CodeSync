import React from 'react';
import { Code2 } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../../utils/languageOptions';
import { Language } from '../../types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onChange: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Code2 size={18} className="text-gray-400" />
      <select
        value={selectedLanguage.id}
        onChange={(e) => {
          const selected = LANGUAGE_OPTIONS.find((lang) => lang.id === e.target.value);
          if (selected) {
            onChange(selected);
          }
        }}
        className="bg-gray-800 text-gray-200 px-3 py-1 rounded-md text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        {LANGUAGE_OPTIONS.map((language) => (
          <option key={language.id} value={language.id}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;