import type { ReactElement } from 'react';
import styles from './MaterialTestRunner.module.scss';
import type { TestQuestionDto } from '@/shared/api/materials';
import {
  isChoiceQuestionType,
  isTextQuestionType
} from '@/shared/lib/materials';
import { Button } from '@/shared/ui/button/Button';
import {
  getCorrectTextAnswers,
  getQuestionHint,
  useMaterialTestRunner
} from './MaterialTestRunner.logic';
import type { MaterialTestRunnerProps } from './MaterialTestRunner.types';

export function MaterialTestRunner({
  material
}: MaterialTestRunnerProps): ReactElement {
  const {
    questions,
    currentQuestionIndex,
    currentQuestion,
    questionType,
    textAnswers,
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
  } = useMaterialTestRunner({ material });

  const renderQuestionResult = (question: TestQuestionDto) => {
    if (!result) {
      return null;
    }

    const currentQuestionType = question.type ?? 'single';
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
        {isChoiceQuestionType(currentQuestionType) ? (
          <span>
            Правильный ответ:{' '}
            {correctAnswers.length
              ? correctAnswers.map((option) => option.text).join(', ')
              : 'ответ не задан'}
          </span>
        ) : null}
        {isTextQuestionType(currentQuestionType) ? (
          <span>
            Засчитывается:{' '}
            {correctTextAnswers.length
              ? correctTextAnswers.join(', ')
              : 'ответ не задан'}
          </span>
        ) : null}
        {currentQuestionType === 'image' ? (
          <span>{questionResult ? 'Фото загружено' : 'Фото не загружено'}</span>
        ) : null}
      </div>
    );
  };

  if (!questions.length || !currentQuestion || !questionType) {
    return <p>Вопросы пока не добавлены</p>;
  }

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
          onClick={handlePreviousQuestion}
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
