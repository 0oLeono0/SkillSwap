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

const getQuestionHint = (questionType: string) => {
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

export function MaterialTestRunner({
  material
}: MaterialTestRunnerProps): ReactElement {
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

  const evaluateTest = () => {
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

  const renderQuestionResult = (question: TestQuestionDto) => {
    if (!result) {
      return null;
    }

    const questionType = normalizeTestQuestionType(question.type);
    const questionResult = result.questionResults[question.id];
    const correctAnswers = question.answerOptions.filter(
      (option) => option.isCorrect
    );
    const correctTextAnswers = getCorrectTextAnswers(question);

    return (
      <div
        className={
          questionResult ? styles.testQuestionCorrect : styles.testQuestionWrong
        }
      >
        <strong>{questionResult ? 'Верно' : 'Неверно'}</strong>
        {isChoiceQuestionType(questionType) ? (
          <span>
            Правильный ответ:{' '}
            {correctAnswers.length
              ? correctAnswers.map((option) => option.text).join(', ')
              : 'ответ не задан'}
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
          <span>{questionResult ? 'Фото загружено' : 'Фото не загружено'}</span>
        ) : null}
      </div>
    );
  };

  if (!questions.length) {
    return <p>Вопросы пока не добавлены</p>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionType = normalizeTestQuestionType(currentQuestion.type);
  const selectedIds = selectedAnswers[currentQuestion.id] ?? [];
  const imageAnswer = imageAnswers[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  const resultPercent = result
    ? Math.round((result.correctCount / result.totalCount) * 100)
    : 0;

  if (result) {
    return (
      <section className={styles.testRunner}>
        <div className={styles.testResultCard}>
          <div className={styles.testResultHeader}>
            <div>
              <p className={styles.testResult}>
                Результат: {result.correctCount} из {result.totalCount}
              </p>
              <span>Итоговая точность: {resultPercent}%</span>
            </div>
            <strong>
              {result.correctCount}/{result.totalCount}
            </strong>
          </div>

          <ol className={styles.testResultList}>
            {questions.map((question, index) => (
              <li key={question.id}>
                <div className={styles.testResultQuestion}>
                  <small>Вопрос {index + 1}</small>
                  <strong>{question.text}</strong>
                </div>
                {renderQuestionResult(question)}
              </li>
            ))}
          </ol>

          <Button variant='secondary' type='button' onClick={handleRestart}>
            Пройти ещё раз
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form className={styles.testRunner} onSubmit={handleSubmit}>
      <div className={styles.testRunnerHeader}>
        <div>
          <span>
            Вопрос {currentQuestionIndex + 1} из {questions.length}
          </span>
        </div>
        <div
          className={styles.testProgress}
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercent)}
        >
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <fieldset className={styles.testQuestion}>
        <legend>
          {currentQuestionIndex + 1}. <span>{currentQuestion.text}</span>
        </legend>
        <span className={styles.testQuestionHint}>
          {getQuestionHint(questionType)}
        </span>
        {isChoiceQuestionType(questionType) ? (
          <div className={styles.testOptions}>
            {currentQuestion.answerOptions.map((option) => (
              <label key={option.id} className={styles.testOption}>
                <input
                  type='checkbox'
                  checked={selectedIds.includes(option.id)}
                  onChange={(event) =>
                    handleOptionChange(
                      currentQuestion,
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
              value={textAnswers[currentQuestion.id] ?? ''}
              onChange={(event) =>
                handleTextAnswerChange(currentQuestion.id, event.target.value)
              }
            />
          </label>
        ) : null}
        {questionType === 'gap' ? (
          <label className={styles.testTextAnswer}>
            Слово
            <input
              type='text'
              value={textAnswers[currentQuestion.id] ?? ''}
              onChange={(event) =>
                handleTextAnswerChange(currentQuestion.id, event.target.value)
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
                  currentQuestion.id,
                  event.target.files?.[0] ?? null
                )
              }
            />
            {imageAnswer ? <span>{imageAnswer.name}</span> : null}
          </label>
        ) : null}
      </fieldset>

      <div className={styles.testNavigation}>
        <Button
          variant='secondary'
          type='button'
          disabled={currentQuestionIndex === 0}
          onClick={() =>
            setCurrentQuestionIndex((current) => Math.max(current - 1, 0))
          }
        >
          Назад
        </Button>
        <Button variant='primary' type='submit'>
          {isLastQuestion ? 'Показать результат' : 'Далее'}
        </Button>
      </div>
    </form>
  );
}
