import { useState } from 'react';
import { useAuth } from '@/app/providers/auth';
import {
  materialsApi,
  type AnswerOptionDto,
  type MaterialDto,
  type TestQuestionDto
} from '@/shared/api/materials';

export type QuestionFormState = {
  text: string;
  editingQuestionId: string | null;
  isSubmitting: boolean;
  error: string | null;
};

export type AnswerOptionFormState = {
  text: string;
  isCorrect: boolean;
  editingOptionId: string | null;
  isSubmitting: boolean;
  error: string | null;
};

const createEmptyQuestionForm = (): QuestionFormState => ({
  text: '',
  editingQuestionId: null,
  isSubmitting: false,
  error: null
});

const createEmptyAnswerOptionForm = (): AnswerOptionFormState => ({
  text: '',
  isCorrect: false,
  editingOptionId: null,
  isSubmitting: false,
  error: null
});

export const useTestQuestionsEditor = (
  material: MaterialDto,
  onRefresh: () => Promise<void>
) => {
  const { accessToken } = useAuth();
  const [questionForm, setQuestionForm] = useState<QuestionFormState>(() =>
    createEmptyQuestionForm()
  );
  const [answerFormsByQuestionId, setAnswerFormsByQuestionId] = useState<
    Record<string, AnswerOptionFormState>
  >({});

  const updateQuestionForm = (patch: Partial<QuestionFormState>) => {
    setQuestionForm((prev) => ({
      ...prev,
      ...patch
    }));
  };

  const resetQuestionForm = () => {
    setQuestionForm(createEmptyQuestionForm());
  };

  const getAnswerForm = (questionId: string) =>
    answerFormsByQuestionId[questionId] ?? createEmptyAnswerOptionForm();

  const updateAnswerForm = (
    questionId: string,
    patch: Partial<AnswerOptionFormState>
  ) => {
    setAnswerFormsByQuestionId((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? createEmptyAnswerOptionForm()),
        ...patch
      }
    }));
  };

  const resetAnswerForm = (questionId: string) => {
    setAnswerFormsByQuestionId((prev) => ({
      ...prev,
      [questionId]: createEmptyAnswerOptionForm()
    }));
  };

  const saveQuestion = async () => {
    const text = questionForm.text.trim();
    if (!text) {
      updateQuestionForm({ error: 'Введите текст вопроса' });
      return;
    }

    if (!accessToken) {
      updateQuestionForm({
        error: 'Для управления вопросами нужно войти в аккаунт'
      });
      return;
    }

    updateQuestionForm({
      isSubmitting: true,
      error: null
    });

    try {
      if (questionForm.editingQuestionId) {
        await materialsApi.updateQuestion(
          accessToken,
          questionForm.editingQuestionId,
          { text }
        );
      } else {
        await materialsApi.createQuestion(accessToken, material.id, { text });
      }
      resetQuestionForm();
      await onRefresh();
    } catch (error) {
      console.error(
        '[ProfileTestQuestionsEditor] Failed to save question',
        error
      );
      updateQuestionForm({
        isSubmitting: false,
        error: 'Не удалось сохранить вопрос'
      });
    }
  };

  const startQuestionEdit = (question: TestQuestionDto) => {
    setQuestionForm({
      text: question.text,
      editingQuestionId: question.id,
      isSubmitting: false,
      error: null
    });
  };

  const deleteQuestion = async (question: TestQuestionDto) => {
    if (!accessToken) {
      updateQuestionForm({
        error: 'Для управления вопросами нужно войти в аккаунт'
      });
      return;
    }

    try {
      await materialsApi.removeQuestion(accessToken, question.id);
      await onRefresh();
    } catch (error) {
      console.error(
        '[ProfileTestQuestionsEditor] Failed to delete question',
        error
      );
      updateQuestionForm({
        error: 'Не удалось удалить вопрос'
      });
    }
  };

  const saveAnswerOption = async (question: TestQuestionDto) => {
    const form = getAnswerForm(question.id);
    const text = form.text.trim();
    if (!text) {
      updateAnswerForm(question.id, {
        error: 'Введите текст варианта ответа'
      });
      return;
    }

    if (!accessToken) {
      updateAnswerForm(question.id, {
        error: 'Для управления вариантами ответа нужно войти в аккаунт'
      });
      return;
    }

    updateAnswerForm(question.id, {
      isSubmitting: true,
      error: null
    });

    try {
      if (form.editingOptionId) {
        await materialsApi.updateAnswerOption(
          accessToken,
          form.editingOptionId,
          {
            text,
            isCorrect: form.isCorrect
          }
        );
      } else {
        await materialsApi.createAnswerOption(accessToken, question.id, {
          text,
          isCorrect: form.isCorrect
        });
      }
      resetAnswerForm(question.id);
      await onRefresh();
    } catch (error) {
      console.error(
        '[ProfileTestQuestionsEditor] Failed to save answer option',
        error
      );
      updateAnswerForm(question.id, {
        isSubmitting: false,
        error: 'Не удалось сохранить вариант ответа'
      });
    }
  };

  const startAnswerEdit = (
    question: TestQuestionDto,
    option: AnswerOptionDto
  ) => {
    updateAnswerForm(question.id, {
      text: option.text,
      isCorrect: option.isCorrect,
      editingOptionId: option.id,
      isSubmitting: false,
      error: null
    });
  };

  const deleteAnswerOption = async (
    question: TestQuestionDto,
    option: AnswerOptionDto
  ) => {
    if (!accessToken) {
      updateAnswerForm(question.id, {
        error: 'Для управления вариантами ответа нужно войти в аккаунт'
      });
      return;
    }

    try {
      await materialsApi.removeAnswerOption(accessToken, option.id);
      await onRefresh();
    } catch (error) {
      console.error(
        '[ProfileTestQuestionsEditor] Failed to delete answer option',
        error
      );
      updateAnswerForm(question.id, {
        error: 'Не удалось удалить вариант ответа'
      });
    }
  };

  return {
    questionForm,
    updateQuestionForm,
    resetQuestionForm,
    saveQuestion,
    startQuestionEdit,
    deleteQuestion,
    getAnswerForm,
    updateAnswerForm,
    resetAnswerForm,
    saveAnswerOption,
    startAnswerEdit,
    deleteAnswerOption
  };
};
