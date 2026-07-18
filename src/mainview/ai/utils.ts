import { api } from '../api';
import { showToast } from '../toast';

const AI_MODE_URL = 'https://www.perplexity.ai/search';

export async function copyPrompt(prompt: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(prompt);
  } catch {
    showToast.error('toast.clipboardFailed');
    return;
  }
  const url = new URL(AI_MODE_URL);
  const chars = Array.from(prompt).slice(0, 15000).join('');
  url.searchParams.set('q', chars);
  try {
    await api.shell.openExternal(url.toString());
  } catch {
    // browser open failed — prompt still copied
  }
  showToast.success('studyTools.promptCopied');
}

export { AI_MODE_URL };
