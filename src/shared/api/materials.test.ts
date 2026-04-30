import { apiBaseUrl } from '@/shared/config/env';
import { materialsApi } from './materials';

type CapturedRequestInit = {
  method?: string;
  body?: unknown;
  headers?: Headers;
};

describe('materialsApi', () => {
  const originalFetch = globalThis.fetch;

  const createFetchResponse = <T>(
    payload: T,
    status = 200,
    ok = true,
    contentType = 'application/json'
  ) =>
    ({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      headers: new Headers({ 'Content-Type': contentType }),
      json: async () => payload,
      text: async () =>
        typeof payload === 'string' ? payload : JSON.stringify(payload)
    }) as Response;

  const mockFetch = (payload: unknown = {}) => {
    const fetchMock = jest.fn().mockResolvedValue(createFetchResponse(payload));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  };

  const expectLastRequest = (
    fetchMock: jest.Mock,
    path: string,
    method: string | undefined,
    body?: unknown
  ) => {
    const [url, init] = fetchMock.mock.calls.at(-1) ?? [];
    const requestInit = init as CapturedRequestInit | undefined;

    expect(url).toBe(`${apiBaseUrl}${path}`);
    expect(requestInit?.method).toBe(method);
    if (body !== undefined) {
      expect(requestInit?.body).toBe(JSON.stringify(body));
    }
    return requestInit;
  };

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('lists materials by user skill without auth header', async () => {
    const fetchMock = mockFetch({ materials: [] });

    await materialsApi.listByUserSkill('skill-1');

    const requestInit = expectLastRequest(
      fetchMock,
      '/user-skills/skill-1/materials',
      undefined
    );
    const headers = requestInit?.headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  it('creates material with auth and without route id in body', async () => {
    const payload = {
      type: 'theory' as const,
      title: 'Theory',
      content: 'Read'
    };
    const fetchMock = mockFetch({ material: { id: 'material-1' } });

    await materialsApi.create('token', 'skill-1', payload);

    const requestInit = expectLastRequest(
      fetchMock,
      '/user-skills/skill-1/materials',
      'POST',
      payload
    );
    const headers = requestInit?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token');
  });

  it('updates and deletes material with auth', async () => {
    const fetchMock = mockFetch({ material: { id: 'material-1' } });

    await materialsApi.update('token', 'material-1', {
      title: 'Updated',
      position: 2
    });
    let requestInit = expectLastRequest(
      fetchMock,
      '/materials/material-1',
      'PATCH',
      { title: 'Updated', position: 2 }
    );
    expect((requestInit?.headers as Headers).get('Authorization')).toBe(
      'Bearer token'
    );

    await materialsApi.remove('token', 'material-1');
    requestInit = expectLastRequest(
      fetchMock,
      '/materials/material-1',
      'DELETE'
    );
    expect((requestInit?.headers as Headers).get('Authorization')).toBe(
      'Bearer token'
    );
  });

  it('creates, updates and deletes questions with auth', async () => {
    const fetchMock = mockFetch({ question: { id: 'question-1' } });

    await materialsApi.createQuestion('token', 'material-1', {
      text: 'Question',
      position: 1
    });
    let requestInit = expectLastRequest(
      fetchMock,
      '/materials/material-1/questions',
      'POST',
      { text: 'Question', position: 1 }
    );
    expect((requestInit?.headers as Headers).get('Authorization')).toBe(
      'Bearer token'
    );

    await materialsApi.updateQuestion('token', 'question-1', {
      text: 'Updated question'
    });
    requestInit = expectLastRequest(
      fetchMock,
      '/material-questions/question-1',
      'PATCH',
      { text: 'Updated question' }
    );
    expect((requestInit?.headers as Headers).get('Authorization')).toBe(
      'Bearer token'
    );

    await materialsApi.removeQuestion('token', 'question-1');
    requestInit = expectLastRequest(
      fetchMock,
      '/material-questions/question-1',
      'DELETE'
    );
    expect((requestInit?.headers as Headers).get('Authorization')).toBe(
      'Bearer token'
    );
  });

  it('creates, updates and deletes answer options with auth', async () => {
    const fetchMock = mockFetch({ option: { id: 'option-1' } });

    await materialsApi.createAnswerOption('token', 'question-1', {
      text: 'Answer',
      isCorrect: true
    });
    let requestInit = expectLastRequest(
      fetchMock,
      '/material-questions/question-1/options',
      'POST',
      { text: 'Answer', isCorrect: true }
    );
    expect((requestInit?.headers as Headers).get('Authorization')).toBe(
      'Bearer token'
    );

    await materialsApi.updateAnswerOption('token', 'option-1', {
      isCorrect: false,
      position: 3
    });
    requestInit = expectLastRequest(
      fetchMock,
      '/material-answer-options/option-1',
      'PATCH',
      { isCorrect: false, position: 3 }
    );
    expect((requestInit?.headers as Headers).get('Authorization')).toBe(
      'Bearer token'
    );

    await materialsApi.removeAnswerOption('token', 'option-1');
    requestInit = expectLastRequest(
      fetchMock,
      '/material-answer-options/option-1',
      'DELETE'
    );
    expect((requestInit?.headers as Headers).get('Authorization')).toBe(
      'Bearer token'
    );
  });
});
