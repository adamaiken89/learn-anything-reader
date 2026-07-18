import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AI_SKILLS, type AISkillId } from '../../ai/skills';
import { copyPrompt } from '../../ai/utils';
import { useLessonViewStore } from '../../stores/lessonViewStore';

function extractSkillSection(content: string, label: string): string | undefined {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^## ${escaped}\\s*[\\s\\S]*?(?=^## |\\z)`, 'm');
  const match = content.match(regex);
  if (!match) return undefined;
  return match[0].replace(`## ${label}`, '').trim();
}

const ASK_PROMPT = (question: string, context: string) =>
  [
    'You are a helpful tutor. Answer the question based on the lesson content provided.',
    '',
    'Lesson content:',
    context,
    '',
    'Question:',
    question,
  ].join('\n');

export default function NavigationAITab() {
  const { t } = useTranslation();
  const content = useLessonViewStore((s) => s.content);
  const [question, setQuestion] = useState('');

  const handleAISkill = async (skill: AISkillId) => {
    const info = AI_SKILLS.find((s) => s.id === skill);
    if (!info) return;
    const hint = content ? extractSkillSection(content, info.label) : undefined;
    const prompt = info.buildPrompt(content || '', hint);
    void copyPrompt(prompt);
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    const prompt = ASK_PROMPT(question.trim(), content || '');
    void copyPrompt(prompt);
    setQuestion('');
  };

  return (
    <div className="overflow-y-auto flex-1 p-2.5">
      <div className="mb-3">
        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
          {t('studyTools.aiPowerups')}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {AI_SKILLS.filter((s) => s.id !== 'drill').map((skill) => (
          <button
            key={skill.id}
            onClick={() => void handleAISkill(skill.id)}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-full border transition-colors bg-gray-800/60 border-gray-600/50 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
          >
            {skill.label}
            <ExternalLink size={10} />
          </button>
        ))}
      </div>
      <div className="mb-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {t('studyTools.askAnything')}
        </span>
      </div>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full bg-gray-800/60 border border-gray-600/50 rounded p-2 text-xs text-gray-300 placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500"
        rows={3}
        placeholder={t('studyTools.askQuestion')}
      />
      <button
        onClick={() => void handleAsk()}
        disabled={!question.trim()}
        className="mt-1.5 w-full py-1 text-[10px] bg-indigo-700 hover:bg-indigo-600 rounded disabled:opacity-40 transition-colors"
      >
        {t('studyTools.ask')}
      </button>
    </div>
  );
}
