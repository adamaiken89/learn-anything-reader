import { BrowserWindow, Updater } from 'electrobun/bun';
import * as CourseLoader from './course-loader';
import * as Storage from './storage';
import * as Gemini from './gemini';
import { QuizEngine } from './quiz-engine';
import {
  getDueCardsForCourse,
  getStarredCardsForCourse,
  getCardsForCourse,
  toggleStar,
} from './srs';
import { createSRSCard, performReview } from './srs';
import * as Search from './search';
import * as Stats from './stats';
import type { QuizQuestion, SRSDeck } from './types';

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

const API_PORT = 50001;

let _quizEngine: QuizEngine | null = null;

function getQuizEngine(): QuizEngine {
  if (!_quizEngine) _quizEngine = new QuizEngine();
  return _quizEngine;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

const router = {
  'GET /api/stats/:courseId': (params: Record<string, string>) => {
    try {
      return jsonResponse(Stats.getCourseStats(params.courseId));
    } catch (e) {
      return jsonResponse({ error: (e as Error).message }, 404);
    }
  },
  'GET /api/stats/global': () => jsonResponse(Stats.getGlobalStats()),
  'POST /api/stats/session': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as {
      courseID: string;
      moduleID: number;
      durationMinutes: number;
      type: 'reading' | 'quiz' | 'review';
      score?: number;
      total?: number;
    };
    Storage.addStudySession(body);
    return jsonResponse({ ok: true });
  },
  'GET /api/search': (_params: Record<string, string>, req: Request) => {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    return jsonResponse(Search.searchAll(q));
  },
  'GET /api/courses': () => jsonResponse(CourseLoader.loadCourses()),
  'GET /api/courses/:courseId/modules': (_params: Record<string, string>) => {
    const courses = CourseLoader.loadCourses();
    const course = courses.find((s) => s.id === _params.courseId);
    return jsonResponse(course?.modules || []);
  },
  'GET /api/courses/:courseId/modules/:moduleId/lesson': (params: Record<string, string>) => {
    return jsonResponse({
      content: CourseLoader.loadLesson(params.courseId, Number(params.moduleId)),
    });
  },
  'GET /api/courses/:courseId/modules/:moduleId/quiz': (params: Record<string, string>) => {
    return jsonResponse(CourseLoader.loadQuiz(params.courseId, Number(params.moduleId)));
  },
  'GET /api/courses/:courseId/modules/:moduleId/sections': (params: Record<string, string>) => {
    const content = CourseLoader.loadLesson(params.courseId, Number(params.moduleId));
    return jsonResponse(CourseLoader.parseSections(content));
  },
  'GET /api/courses/:courseId/srs': (params: Record<string, string>) => {
    const deck = CourseLoader.loadSRSDeck(params.courseId);
    return jsonResponse(deck);
  },
  'POST /api/courses/:courseId/srs': async (params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as { cardId: string };
    const deck = CourseLoader.loadSRSDeck(params.courseId);
    const updated = toggleStar(deck, body.cardId);
    CourseLoader.saveSRSDeck(updated, params.courseId);
    return jsonResponse(updated);
  },
  'POST /api/courses/:courseId/srs/review': async (
    params: Record<string, string>,
    req: Request,
  ) => {
    const body = (await req.json()) as { cardId: string; correct: boolean; deck: SRSDeck };
    const deck = body.deck || CourseLoader.loadSRSDeck(params.courseId);
    const card = deck.cards[body.cardId];
    if (!card) return jsonResponse({ error: 'Card not found' }, 404);
    const updatedCard = performReview(card, body.correct);
    deck.cards[body.cardId] = updatedCard;
    CourseLoader.saveSRSDeck(deck, params.courseId);
    return jsonResponse(updatedCard);
  },
  'POST /api/courses/:courseId/srs/create': async (
    params: Record<string, string>,
    req: Request,
  ) => {
    const body = (await req.json()) as { question: QuizQuestion; moduleId: number };
    const card = createSRSCard(body.question, body.moduleId, params.courseId);
    const deck = CourseLoader.loadSRSDeck(params.courseId);
    deck.cards[card.id] = card;
    CourseLoader.saveSRSDeck(deck, params.courseId);
    return jsonResponse(card);
  },
  'GET /api/courses/:courseId/srs/filter/:filter': (params: Record<string, string>) => {
    const deck = CourseLoader.loadSRSDeck(params.courseId);
    switch (params.filter) {
      case 'due':
        return jsonResponse(getDueCardsForCourse(deck, params.courseId));
      case 'starred':
        return jsonResponse(getStarredCardsForCourse(deck, params.courseId));
      default:
        return jsonResponse(getCardsForCourse(deck, params.courseId));
    }
  },
  'GET /api/storage/highlights': (_params: Record<string, string>, req: Request) => {
    const url = new URL(req.url);
    const courseID = url.searchParams.get('courseID')!;
    const moduleID = Number(url.searchParams.get('moduleID'));
    return jsonResponse(Storage.getHighlightsForModule(courseID, moduleID));
  },
  'POST /api/storage/highlights': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as {
      courseID: string;
      moduleID: number;
      selectedText: string;
      startOffset: number;
      endOffset: number;
      color?: string;
    };
    const highlight = Storage.addHighlight(
      body.courseID,
      body.moduleID,
      body.selectedText,
      body.startOffset,
      body.endOffset,
      body.color,
    );
    return jsonResponse(highlight, 201);
  },
  'DELETE /api/storage/highlights/:id': (params: Record<string, string>) => {
    Storage.deleteHighlight(params.id);
    return jsonResponse({ ok: true });
  },
  'GET /api/storage/notes': (_params: Record<string, string>, req: Request) => {
    const url = new URL(req.url);
    const courseID = url.searchParams.get('courseID')!;
    const moduleID = Number(url.searchParams.get('moduleID'));
    return jsonResponse(Storage.getNotesForModule(courseID, moduleID));
  },
  'POST /api/storage/notes': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as {
      courseID: string;
      moduleID: number;
      content: string;
      highlightID?: string;
      sectionID?: string;
    };
    const note = Storage.addNote(
      body.courseID,
      body.moduleID,
      body.content,
      body.highlightID,
      body.sectionID,
    );
    return jsonResponse(note, 201);
  },
  'PUT /api/storage/notes/:id': async (params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as { content: string };
    Storage.updateNote(params.id, body.content);
    return jsonResponse({ ok: true });
  },
  'POST /api/storage/annotations': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as {
      courseID: string;
      moduleID: number;
      selectedText: string;
      startOffset: number;
      endOffset: number;
      color: string;
      noteContent: string;
    };
    const result = Storage.addAnnotation(body);
    return jsonResponse(result, 201);
  },
  'DELETE /api/storage/notes/:id': (params: Record<string, string>) => {
    Storage.deleteNote(params.id);
    return jsonResponse({ ok: true });
  },
  'GET /api/storage/bookmarks': () => jsonResponse(Storage.getAllBookmarks()),
  'GET /api/storage/bookmarks/course/:courseID': (params: Record<string, string>) =>
    jsonResponse(Storage.getBookmarksForCourse(params.courseID)),
  'POST /api/storage/bookmarks': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as {
      courseID: string;
      moduleID: number;
      title: string;
      sectionID?: string;
      scrollPosition?: number;
    };
    const bookmark = Storage.addBookmark(
      body.courseID,
      body.moduleID,
      body.title,
      body.sectionID,
      body.scrollPosition,
    );
    return jsonResponse(bookmark, 201);
  },
  'DELETE /api/storage/bookmarks/:id': (params: Record<string, string>) => {
    Storage.deleteBookmark(params.id);
    return jsonResponse({ ok: true });
  },
  'GET /api/storage/bookmarks/module/:courseID/:moduleID': (params: Record<string, string>) =>
    jsonResponse(Storage.getBookmarksForModule(params.courseID, Number(params.moduleID))),
  'GET /api/storage/check-bookmark': (_params: Record<string, string>, req: Request) => {
    const url = new URL(req.url);
    const courseID = url.searchParams.get('courseID')!;
    const moduleID = Number(url.searchParams.get('moduleID'));
    return jsonResponse(Storage.isBookmarked(courseID, moduleID));
  },
  'GET /api/storage/completed': (_params: Record<string, string>, req: Request) => {
    const url = new URL(req.url);
    const courseID = url.searchParams.get('courseID')!;
    const moduleID = Number(url.searchParams.get('moduleID'));
    return jsonResponse({ completed: Storage.isModuleCompleted(courseID, moduleID) });
  },
  'POST /api/storage/completed': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as { courseID: string; moduleID: number };
    const completed = Storage.toggleModuleCompleted(body.courseID, body.moduleID);
    return jsonResponse({ completed });
  },
  'GET /api/storage/completed/count': (_params: Record<string, string>, req: Request) => {
    const url = new URL(req.url);
    const courseID = url.searchParams.get('courseID')!;
    return jsonResponse({ count: Storage.getCompletedModuleCount(courseID) });
  },
  'GET /api/gemini/key': () => jsonResponse({ hasKey: Gemini.hasAPIKey() }),
  'POST /api/gemini/key': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as { key: string };
    Gemini.setAPIKey(body.key);
    return jsonResponse({ ok: true });
  },
  'POST /api/gemini/ask': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as { question: string; context: string };
    try {
      const response = await Gemini.askGemini(body.question, body.context);
      return jsonResponse({ response });
    } catch (err) {
      return jsonResponse({ error: (err as Error).message }, 400);
    }
  },
  'POST /api/quiz/start': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as { courseId: string; moduleId: number };
    const questions = CourseLoader.loadQuiz(body.courseId, body.moduleId);
    const engine = new QuizEngine();
    engine.load(questions, body.courseId, body.moduleId);
    _quizEngine = engine;
    return jsonResponse(questions);
  },
  'GET /api/quiz/state': () => {
    const engine = getQuizEngine();
    return jsonResponse({
      currentIndex: engine.currentIndex,
      selectedAnswers: engine.selectedAnswers,
      isCompleted: engine.isCompleted,
      currentQuestion: engine.currentQuestion,
      score: engine.score,
      percentage: engine.percentage,
    });
  },
  'POST /api/quiz/select': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as { answer: string };
    getQuizEngine().selectAnswer(body.answer);
    return jsonResponse({ ok: true });
  },
  'POST /api/quiz/next': () => {
    getQuizEngine().nextQuestion();
    return jsonResponse({ ok: true });
  },
  'POST /api/quiz/reset': () => {
    getQuizEngine().reset();
    return jsonResponse({ ok: true });
  },

  // --- UserCard routes ---

  'GET /api/usercards': (_params: Record<string, string>, req: Request) => {
    const url = new URL(req.url);
    const courseId = url.searchParams.get('courseId') || undefined;
    const moduleId = url.searchParams.get('moduleId')
      ? Number(url.searchParams.get('moduleId'))
      : undefined;
    return jsonResponse(Storage.getUserCards(courseId, moduleId));
  },

  'POST /api/usercards': async (_params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as {
      courseId: string;
      moduleId: number;
      front: string;
      back: string;
    };
    const card = Storage.addUserCard(body.courseId, body.moduleId, body.front, body.back);
    return jsonResponse(card, 201);
  },

  'DELETE /api/usercards/:id': (params: Record<string, string>) => {
    Storage.deleteUserCard(params.id);
    return jsonResponse({ ok: true });
  },

  'POST /api/usercards/:id/review': async (params: Record<string, string>, req: Request) => {
    const body = (await req.json()) as { correct: boolean };
    const card = Storage.reviewUserCard(params.id, body.correct);
    if (!card) return jsonResponse({ error: 'Card not found' }, 404);
    return jsonResponse(card);
  },

  'POST /api/usercards/:id/star': (params: Record<string, string>) => {
    const card = Storage.toggleUserCardStar(params.id);
    if (!card) return jsonResponse({ error: 'Card not found' }, 404);
    return jsonResponse(card);
  },
};

function matchRoute(
  method: string,
  urlPath: string,
): { handler: Function; params: Record<string, string> } | null {
  for (const [routePattern, handler] of Object.entries(router)) {
    const [routeMethod, routePath] = routePattern.split(' ');
    if (routeMethod !== method) continue;

    const routeParts = routePath.split('/');
    const urlParts = urlPath.split('?').shift()!.split('/');

    if (routeParts.length !== urlParts.length) continue;

    const params: Record<string, string> = {};
    let match = true;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = urlParts[i];
      } else if (routeParts[i] !== urlParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { handler: handler as Function, params };
  }
  return null;
}

async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel === 'dev') {
    try {
      await fetch(DEV_SERVER_URL, { method: 'HEAD' });
      console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
      return `${DEV_SERVER_URL}?apiPort=${API_PORT}`;
    } catch {
      console.log("Vite dev server not running. Run 'bun run dev:hmr' for HMR.");
    }
  }
  return `views://mainview/index.html?apiPort=${API_PORT}`;
}

const server = Bun.serve({
  port: API_PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const route = matchRoute(req.method, url.pathname);
    if (route) {
      try {
        return await route.handler(route.params, req);
      } catch (err) {
        return jsonResponse({ error: (err as Error).message }, 500);
      }
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
});

console.log(`API server running at http://localhost:${API_PORT}`);

try {
  const mainViewUrl = await getMainViewUrl();
  new BrowserWindow({
    title: 'CourseReader',
    url: mainViewUrl,
    frame: {
      width: 1100,
      height: 800,
      x: 200,
      y: 200,
    },
  });
  console.log('CourseReader started!');
} catch (err) {
  console.log('BrowserWindow not available (running standalone API server).');
}

process.on('beforeExit', () => {
  server.stop();
});
