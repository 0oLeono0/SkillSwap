import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { TestQuestionDto } from '@/shared/api/materials';
import {
  isChoiceQuestionType,
  isTextQuestionType,
  normalizeTestQuestionType
} from '@/shared/lib/materials';
import type {
  ImageAnswers,
  MaterialTestRunnerProps,
  MaterialTestRunnerState,
  SelectedAnswers,
  TestResult,
  TextAnswers
} from './MaterialTestRunner.types';

const sameAnswerSet = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }
  const rightSet = new Set(right);
  return left.every((item) => rightSet.has(item));
};

const getCorrectOptionIds = (question: TestQuestionDto) =>
  question.answerOptions
    .filter((option) => option.isCorrect)
    .map((option) => option.id);

const normalizeTextAnswer = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru-RU');

export const getCorrectTextAnswers = (question: TestQuestionDto) => {
  const correctOptions = question.answerOptions.filter(
    (option) => option.isCorrect
  );
  const sourceOptions = correctOptions.length
    ? correctOptions
    : question.answerOptions;

  return sourceOptions
    .map((option) => normalizeTextAnswer(option.text))
    .filter(Boolean);
};

const hasCorrectTextAnswer = (question: TestQuestionDto, value: string) => {
  const normalizedValue = normalizeTextAnswer(value);
  if (!normalizedValue) {
    return false;
  }
  return getCorrectTextAnswers(question).includes(normalizedValue);
};

export const getQuestionHint = (questionType: string) => {
  if (questionType === 'single') {
    return 'Выберите один вариант';
  }
  if (questionType === 'multiple') {
    return 'Можно выбрать несколько вариантов';
  }
  if (questionType === 'text') {
    return 'Напишите ответ текстом';
  }
  if (questionType === 'gap') {
    return 'Вставьте пропущенное слово';
  }
  return 'Загрузите фото в качестве ответа';
};

const evaluateQuestions = ({
  questions,
  selectedAnswers,
  textAnswers,
  imageAnswers
}: {
  questions: TestQuestionDto[];
  selectedAnswers: SelectedAnswers;
  textAnswers: TextAnswers;
  imageAnswers: ImageAnswers;
}): TestResult => {
  const questionResults = questions.reduce<Record<string, boolean>>(
    (acc, question) => {
      const questionType = normalizeTestQuestionType(question.type);
      if (isChoiceQuestionType(questionType)) {
        acc[question.id] = sameAnswerSet(
          selectedAnswers[question.id] ?? [],
          getCorrectOptionIds(question)
        );
        return acc;
      }
      if (isTextQuestionType(questionType)) {
        acc[question.id] = hasCorrectTextAnswer(
          question,
          textAnswers[question.id] ?? ''
        );
        return acc;
      }
      acc[question.id] = Boolean(imageAnswers[question.id]);
      return acc;
    },
    {}
  );

  return {
    correctCount: Object.values(questionResults).filter(Boolean).length,
    totalCount: questions.length,
    questionResults
  };
};

export const useMaterialTestRunner = ({
  material
}: MaterialTestRunnerProps): MaterialTestRunnerState => {
  const questions = useMemo(() => material.questions ?? [], [material]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [textAnswers, setTextAnswers] = useState<TextAnswers>({});
  const [imageAnswers, setImageAnswers] = useState<ImageAnswers>({});
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTextAnswers({});
    setImageAnswers({});
    setResult(null);
  }, [material.id]);

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const questionType = currentQuestion
    ? normalizeTestQuestionType(currentQuestion.type)
    : null;
  const selectedIds = currentQuestion
    ? (selectedAnswers[currentQuestion.id] ?? [])
    : [];
  const imageAnswer = currentQuestion
    ? imageAnswers[currentQuestion.id]
    : undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercent = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;
  const resultPercent = result
    ? Math.round((result.correctCount / result.totalCount) * 100)
    : 0;

  const evaluateTest = () => {
    setResult(
      evaluateQuestions({
        questions,
        selectedAnswers,
        textAnswers,
        imageAnswers
      })
    );
  };

  const handleOptionChange = (
    question: TestQuestionDto,
    optionId: string,
    checked: boolean
  ) => {
    setResult(null);
    setSelectedAnswers((current) => {
      const nextQuestionType = normalizeTestQuestionType(question.type);
      if (nextQuestionType === 'single') {
        return {
          ...current,
          [question.id]: checked ? [optionId] : []
        };
      }

      const currentIds = current[question.id] ?? [];
      return {
        ...current,
        [question.id]: checked
          ? Array.from(new Set([...currentIds, optionId]))
          : currentIds.filter((id) => id !== optionId)
      };
    });
  };

  const handleTextAnswerChange = (questionId: string, value: string) => {
    setResult(null);
    setTextAnswers((current) => ({
      ...current,
      [questionId]: value
    }));
  };

  const handleImageAnswerChange = (questionId: string, file: File | null) => {
    setResult(null);
    setImageAnswers((current) => ({
      ...current,
      [questionId]: file
    }));
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((current) => Math.max(current - 1, 0));
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTextAnswers({});
    setImageAnswers({});
    setResult(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((current) => current + 1);
      return;
    }
    evaluateTest();
  };

  return {
    questions,
    currentQuestionIndex,
    currentQuestion,
    questionType,
    selectedAnswers,
    textAnswers,
    imageAnswers,
    selectedIds,
    imageAnswer,
    result,
    isLastQuestion,
    progressPercent,
    resultPercent,
    handleOptionChange,
    handleTextAnswerChange,
    handleImageAnswerChange,
    handlePreviousQuestion,
    handleRestart,
    handleSubmit
  };
};
