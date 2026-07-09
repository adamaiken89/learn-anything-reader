import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLessonViewStore } from '../../stores/lessonViewStore';

const AI_SKILLS = [
  {
    id: 'feynman',
    label: 'Feynman Explain',
    prompt:
      'Explain this section using the Feynman technique: simplify each concept as if teaching a beginner.',
  },
  {
    id: 'reframe',
    label: 'Reframe',
    prompt:
      'Reframe the key concepts in this lesson from a different perspective to deepen understanding.',
  },
  {
    id: 'drill',
    label: 'Drill',
    prompt: 'Generate practice questions for this lesson to test understanding.',
  },
] as const;

type AISkillId = (typeof AI_SKILLS)[number]['id'];

export default function NavigationAITab() {
  const { t } = useTranslation();
  const content = useLessonViewStore((s) => s.content);
  const [activeAISkill, setActiveAISkill] = useState<AISkillId | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAISkill = async (skill: AISkillId) => {
    if (skill === activeAISkill && aiResponse) {
      setActiveAISkill(null);
      setAiResponse('');
      return;
    }
    const info = AI_SKILLS.find((s) => s.id === skill);
    if (!info) return;
    setActiveAISkill(skill);
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = content || '';
      const { api } = await import('../../api');
      const response = await api.gemini.ask(info.prompt, res);
      setAiResponse(response.response);
    } catch {
      setAiResponse(t('studyTools.aiError'));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="overflow-y-auto flex-1 p-2.5">
      <div className="mb-3">
        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
          AI Power-ups
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {AI_SKILLS.map((skill) => (
          <button
            key={skill.id}
            onClick={() => void handleAISkill(skill.id)}
            className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${
              activeAISkill === skill.id
                ? 'bg-indigo-700/50 border-indigo-500 text-indigo-200'
                : 'bg-gray-800/60 border-gray-600/50 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {skill.label}
          </button>
        ))}
      </div>
      {activeAISkill && (
        <div className="mb-3">
          {aiLoading ? (
            <div className="text-[10px] text-gray-400 animate-pulse">
              {t('studyTools.thinking')}
            </div>
          ) : aiResponse ? (
            <div className="text-[10px] text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-800/60 rounded p-2 max-h-48 overflow-y-auto">
              {aiResponse}
            </div>
          ) : null}
        </div>
      )}
      <div className="mb-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Ask anything
        </span>
      </div>
      <textarea
        className="w-full bg-gray-800/60 border border-gray-600/50 rounded p-2 text-xs text-gray-300 placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500"
        rows={3}
        placeholder="Ask a question about this lesson..."
      />
    </div>
  );
}
