import type { FormEvent } from 'react';
import type { MaterialDto, TestQuestionDto } from '@/shared/api/materials';

export type MaterialTestRunnerProps = {
  material: MaterialDto;
};

export type SelectedAnswers = Record<string, string[]>;
export type TextAnswers = Record<string, string>;
export type ImageAnswers = Record<string, File | null>;

export type TestResult = {
  correctCount: number;
  totalCount: number;
  questionResults: Record<string, boolean>;
};

export type MaterialTestRunnerState = {
  questions: TestQuestionDto[];
  currentQuestionIndex: number;
  currentQuestion: TestQuestionDto | null;
  questionType: string | null;
  selectedAnswers: SelectedAnswers;
  textAnswers: TextAnswers;
  imageAnswers: ImageAnswers;
  selectedIds: string[];
  imageAnswer?: File | null;
  result: TestResult | null;
  isLastQuestion: boolean;
  progressPercent: number;
  resultPercent: number;
  handleOptionChange: (
    question: TestQuestionDto,
    optionId: string,
    checked: boolean
  ) => void;
  handleTextAnswerChange: (questionId: string, value: string) => void;
  handleImageAnswerChange: (questionId: string, file: File | null) => void;
  handlePreviousQuestion: () => void;
  handleRestart: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
