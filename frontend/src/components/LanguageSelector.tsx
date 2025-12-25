import { LANGUAGE_OPTIONS, SupportedLanguage } from '@/types/interview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSelectorProps {
  language: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}

const LanguageSelector = ({ language, onChange }: LanguageSelectorProps) => {
  return (
    <Select value={language} onValueChange={(value) => onChange(value as SupportedLanguage)}>
      <SelectTrigger className="w-[160px] bg-secondary border-border">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {LANGUAGE_OPTIONS.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="focus:bg-secondary"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
