import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement
} from 'react';
import styles from './skillDetails.module.scss';
import type { MaterialDto, TestQuestionDto } from '@/shared/api/materials';
import {
  isChoiceQuestionType,
  isTextQuestionType,
  normalizeTestQuestionType
} from '@/shared/lib/materials';
import { Button } from '@/shared/ui/button/Button';

interface MaterialTestRunnerProps {
  material: MaterialDto;
}

type SelectedAnswers = Record<string, string[]>;
type TextAnswers = Record<string, string>;
type ImageAnswers = Record<string, File | null>;

type TestResult = {
  correctCount: number;
  totalCount: number;
  questionResults: Record<string, boolean>;
};

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

const getCorrectTextAnswers = (question: TestQuestionDto) => {
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

export function MaterialTestRunner({
  material
}: MaterialTestRunnerProps): ReactElement {
  const questions = useMemo(() => material.questions ?? [], [material]);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [textAnswers, setTextAnswers] = useState<TextAnswers>({});
  const [imageAnswers, setImageAnswers] = useState<ImageAnswers>({});
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    setSelectedAnswers({});
    setTextAnswers({});
    setImageAnswers({});
    setResult(null);
  }, [material.id]);

  const handleOptionChange = (
    question: TestQuestionDto,
    optionId: string,
    checked: boolean
  ) => {
    setResult(null);
    setSelectedAnswers((current) => {
      const questionType = normalizeTestQuestionType(question.type);
      if (questionType === 'single') {
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    const correctCount = Object.values(questionResults).filter(Boolean).length;
    setResult({
      correctCount,
      totalCount: questions.length,
      questionResults
    });
  };

  if (!questions.length) {
    return <p>Вопросы пока не добавлены</p>;
  }

  return (
    <form className={styles.testRunner} onSubmit={handleSubmit}>
      {questions.map((question, index) => {
        const questionType = normalizeTestQuestionType(question.type);
        const selectedIds = selectedAnswers[question.id] ?? [];
        const questionResult = result?.questionResults[question.id];
        const correctAnswers = question.answerOptions.filter(
          (option) => option.isCorrect
        );
        const correctTextAnswers = getCorrectTextAnswers(question);
        const imageAnswer = imageAnswers[question.id];

        return (
          <fieldset key={question.id} className={styles.testQuestion}>
            <legend>
              {index + 1}. <span>{question.text}</span>
            </legend>
            <span className={styles.testQuestionHint}>
              {questionType === 'single' && 'Выберите один вариант'}
              {questionType === 'multiple' &&
                'Можно выбрать несколько вариантов'}
              {questionType === 'text' && 'Напишите ответ текстом'}
              {questionType === 'gap' && 'Вставьте пропущенное слово'}
              {questionType === 'image' && 'Загрузите фото в качестве ответа'}
            </span>
            {isChoiceQuestionType(questionType) ? (
              <div className={styles.testOptions}>
                {question.answerOptions.map((option) => (
                  <label key={option.id} className={styles.testOption}>
                    <input
                      type='checkbox'
                      checked={selectedIds.includes(option.id)}
                      onChange={(event) =>
                        handleOptionChange(
                          question,
                          option.id,
                          event.target.checked
                        )
                      }
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
            ) : null}
            {questionType === 'text' ? (
              <label className={styles.testTextAnswer}>
                Ответ
                <textarea
                  value={textAnswers[question.id] ?? ''}
                  onChange={(event) =>
                    handleTextAnswerChange(question.id, event.target.value)
                  }
                />
              </label>
            ) : null}
            {questionType === 'gap' ? (
              <label className={styles.testTextAnswer}>
                Слово
                <input
                  type='text'
                  value={textAnswers[question.id] ?? ''}
                  onChange={(event) =>
                    handleTextAnswerChange(question.id, event.target.value)
                  }
                />
              </label>
            ) : null}
            {questionType === 'image' ? (
              <label className={styles.testUploadAnswer}>
                Фото
                <input
                  type='file'
                  accept='image/*'
                  onChange={(event) =>
                    handleImageAnswerChange(
                      question.id,
                      event.target.files?.[0] ?? null
                    )
                  }
                />
                {imageAnswer ? <span>{imageAnswer.name}</span> : null}
              </label>
            ) : null}
            {typeof questionResult === 'boolean' ? (
              <div
                className={
                  questionResult
                    ? styles.testQuestionCorrect
                    : styles.testQuestionWrong
                }
              >
                <strong>{questionResult ? 'Верно' : 'Неверно'}</strong>
                {isChoiceQuestionType(questionType) ? (
                  <span>
                    Правильный ответ:{' '}
                    {correctAnswers.map((option) => option.text).join(', ')}
                  </span>
                ) : null}
                {isTextQuestionType(questionType) ? (
                  <span>
                    Засчитывается:{' '}
                    {correctTextAnswers.length
                      ? correctTextAnswers.join(', ')
                      : 'ответ не задан'}
                  </span>
                ) : null}
                {questionType === 'image' ? (
                  <span>
                    {questionResult ? 'Фото загружено' : 'Фото не загружено'}
                  </span>
                ) : null}
              </div>
            ) : null}
          </fieldset>
        );
      })}

      {result ? (
        <p className={styles.testResult}>
          Результат: {result.correctCount} из {result.totalCount}
        </p>
      ) : null}

      <Button variant='primary' type='submit'>
        Проверить ответы
      </Button>
    </form>
  );
}
