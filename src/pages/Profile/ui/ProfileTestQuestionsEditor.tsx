import type { FormEvent, ReactElement } from 'react';
import clsx from 'clsx';
import { useTestQuestionsEditor } from '../model/useTestQuestionsEditor';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import type {
  MaterialDto,
  TestQuestionDto,
  TestQuestionType
} from '@/shared/api/materials';
import {
  isChoiceQuestionType,
  isTextQuestionType,
  TEST_QUESTION_TYPE_LABELS,
  TEST_QUESTION_TYPE_OPTIONS,
  normalizeTestQuestionType
} from '@/shared/lib/materials';
import styles from './profileSkillMaterials.module.scss';

interface ProfileTestQuestionsEditorProps {
  material: MaterialDto;
  onRefresh: () => Promise<void>;
}

type QuestionStats = {
  choice: number;
  text: number;
  image: number;
};

const getQuestionStats = (questions: TestQuestionDto[]): QuestionStats =>
  questions.reduce<QuestionStats>(
    (stats, question) => {
      const questionType = normalizeTestQuestionType(question.type);
      if (isChoiceQuestionType(questionType)) {
        return { ...stats, choice: stats.choice + 1 };
      }
      if (isTextQuestionType(questionType)) {
        return { ...stats, text: stats.text + 1 };
      }
      return { ...stats, image: stats.image + 1 };
    },
    { choice: 0, text: 0, image: 0 }
  );

const getAnswerInputTitle = (questionType: TestQuestionType) => {
  if (questionType === 'gap') {
    return 'Правильное слово';
  }
  if (questionType === 'text') {
    return 'Правильный текст';
  }
  return 'Текст варианта';
};

const getAnswerEmptyText = (questionType: TestQuestionType) => {
  if (questionType === 'image') {
    return 'Ученик загрузит фото при прохождении теста';
  }
  if (isTextQuestionType(questionType)) {
    return 'Правильные ответы пока не добавлены';
  }
  return 'Варианты ответа пока не добавлены';
};

const getAnswerButtonText = (
  questionType: TestQuestionType,
  isEditingAnswer: boolean
) => {
  if (isTextQuestionType(questionType)) {
    return isEditingAnswer ? 'Сохранить ответ' : 'Добавить ответ';
  }
  return isEditingAnswer ? 'Сохранить вариант' : 'Добавить вариант';
};

const getAnswerSectionTitle = (questionType: TestQuestionType) => {
  if (isTextQuestionType(questionType)) {
    return 'Принятые ответы';
  }
  if (questionType === 'image') {
    return 'Фото-ответ';
  }
  return 'Варианты ответа';
};

const getQuestionHint = (questionType: TestQuestionType) => {
  if (questionType === 'single') {
    return 'Выберите один правильный вариант. В прохождении ответ будет чекбоксом.';
  }
  if (questionType === 'multiple') {
    return 'Отметьте все правильные варианты. Ученик сможет выбрать несколько ответов.';
  }
  if (questionType === 'text') {
    return 'Добавьте один или несколько текстов, которые будут засчитаны как верные.';
  }
  if (questionType === 'gap') {
    return 'Укажите слово или фразу, которую нужно вставить в пропуск.';
  }
  return 'Для этого типа достаточно текста задания: ученик загрузит изображение при прохождении.';
};

const getQuestionMeta = (question: TestQuestionDto, type: TestQuestionType) => {
  const answersCount = question.answerOptions.length;
  if (type === 'image') {
    return 'Проверка по факту загрузки изображения';
  }
  if (isTextQuestionType(type)) {
    return answersCount
      ? `${answersCount} принятых ответов`
      : 'Принятые ответы не заданы';
  }
  return answersCount
    ? `${answersCount} вариантов`
    : 'Варианты ответа не заданы';
};

const getAnswerMarkerText = (questionType: TestQuestionType) => {
  if (questionType === 'single') {
    return '';
  }
  if (questionType === 'multiple') {
    return '';
  }
  if (questionType === 'gap') {
    return '__';
  }
  return 'Aa';
};

export function ProfileTestQuestionsEditor({
  material,
  onRefresh
}: ProfileTestQuestionsEditorProps): ReactElement {
  const {
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
  } = useTestQuestionsEditor(material, onRefresh);

  const questions = material.questions ?? [];
  const questionStats = getQuestionStats(questions);

  const handleQuestionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveQuestion();
  };

  const handleAnswerSubmit = (
    question: TestQuestionDto,
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    void saveAnswerOption(question);
  };

  const isEditingQuestion = Boolean(questionForm.editingQuestionId);

  return (
    <section className={styles.testEditor}>
      <div className={styles.testEditorHeader}>
        <div>
          <h6>Вопросы теста</h6>
          <p>
            Соберите проверку как мини-форму: варианты, текстовые ответы,
            пропуски и задания с загрузкой фото.
          </p>
        </div>
        <div className={styles.testStats} aria-label='Статистика теста'>
          <span className={styles.testStat}>
            <strong>{questions.length}</strong> вопросов
          </span>
          <span className={styles.testStat}>
            <strong>{questionStats.choice}</strong> с вариантами
          </span>
          <span className={styles.testStat}>
            <strong>{questionStats.text}</strong> текстовых
          </span>
          <span className={styles.testStat}>
            <strong>{questionStats.image}</strong> с фото
          </span>
        </div>
      </div>

      {questions.length ? (
        <div className={styles.questionList}>
          {questions.map((question, index) => {
            const questionType = normalizeTestQuestionType(question.type);
            const isChoiceQuestion = isChoiceQuestionType(questionType);
            const isTextQuestion = isTextQuestionType(questionType);
            const isImageQuestion = questionType === 'image';
            const answerForm = getAnswerForm(question.id);
            const isEditingAnswer = Boolean(answerForm.editingOptionId);

            return (
              <article key={question.id} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <div className={styles.questionTitle}>
                    <span className={styles.questionNumber}>
                      Вопрос {index + 1}
                    </span>
                    <strong>{question.text}</strong>
                    <span className={styles.questionTypeBadge}>
                      {TEST_QUESTION_TYPE_LABELS[questionType]}
                    </span>
                    <span className={styles.questionMeta}>
                      {getQuestionMeta(question, questionType)}
                    </span>
                  </div>
                  <div className={styles.materialActions}>
                    <Button
                      variant='secondary'
                      onClick={() => startQuestionEdit(question)}
                      aria-label={`Редактировать вопрос ${question.text}`}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant='secondary'
                      onClick={() => void deleteQuestion(question)}
                      aria-label={`Удалить вопрос ${question.text}`}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>

                <p className={styles.questionHint}>
                  {getQuestionHint(questionType)}
                </p>

                <div className={styles.answerSection}>
                  <div className={styles.answerSectionHeader}>
                    <span>{getAnswerSectionTitle(questionType)}</span>
                    {!isImageQuestion ? (
                      <small>{question.answerOptions.length}</small>
                    ) : null}
                  </div>

                  {question.answerOptions.length && !isImageQuestion ? (
                    <ul className={styles.answerList}>
                      {question.answerOptions.map((option) => (
                        <li key={option.id} className={styles.answerItem}>
                          <div className={styles.answerContent}>
                            <span
                              className={clsx(
                                styles.answerMarker,
                                styles[`answerMarker-${questionType}`],
                                option.isCorrect && styles.answerMarkerCorrect
                              )}
                              aria-hidden='true'
                            >
                              {getAnswerMarkerText(questionType)}
                            </span>
                            <span>{option.text}</span>
                          </div>
                          {option.isCorrect ? (
                            <span className={styles.correctBadge}>
                              {isTextQuestion
                                ? 'Принятый ответ'
                                : 'Правильный ответ'}
                            </span>
                          ) : null}
                          <div className={styles.materialActions}>
                            <Button
                              variant='secondary'
                              onClick={() => startAnswerEdit(question, option)}
                              aria-label={`Редактировать вариант ${option.text}`}
                            >
                              Редактировать
                            </Button>
                            <Button
                              variant='secondary'
                              onClick={() =>
                                void deleteAnswerOption(question, option)
                              }
                              aria-label={`Удалить вариант ${option.text}`}
                            >
                              Удалить
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.materialState}>
                      {getAnswerEmptyText(questionType)}
                    </p>
                  )}
                </div>

                {!isImageQuestion ? (
                  <form
                    className={clsx(styles.answerForm, styles.answerComposer)}
                    onSubmit={(event) => handleAnswerSubmit(question, event)}
                  >
                    <div className={styles.answerComposerHeader}>
                      <span>
                        {isEditingAnswer
                          ? 'Редактирование ответа'
                          : isTextQuestion
                            ? 'Добавить принимаемый ответ'
                            : 'Добавить вариант'}
                      </span>
                    </div>
                    <Input
                      id={`${question.id}-answer-text`}
                      title={getAnswerInputTitle(questionType)}
                      value={answerForm.text}
                      onChange={(event) =>
                        updateAnswerForm(question.id, {
                          text: event.target.value,
                          error: null
                        })
                      }
                    />
                    {isChoiceQuestion ? (
                      <label
                        className={clsx(
                          styles.checkboxField,
                          styles.correctToggle
                        )}
                      >
                        <input
                          type='checkbox'
                          checked={answerForm.isCorrect}
                          onChange={(event) =>
                            updateAnswerForm(question.id, {
                              isCorrect: event.target.checked,
                              error: null
                            })
                          }
                        />
                        Правильный вариант
                      </label>
                    ) : (
                      <p className={styles.materialState}>
                        Укажите один или несколько вариантов, которые будут
                        засчитываться как правильные.
                      </p>
                    )}
                    {answerForm.error ? (
                      <p className={styles.materialStateError}>
                        {answerForm.error}
                      </p>
                    ) : null}
                    <div className={styles.materialActions}>
                      <Button
                        variant='primary'
                        type='submit'
                        disabled={answerForm.isSubmitting}
                      >
                        {getAnswerButtonText(questionType, isEditingAnswer)}
                      </Button>
                      {isEditingAnswer ? (
                        <Button
                          variant='secondary'
                          onClick={() => resetAnswerForm(question.id)}
                        >
                          Отменить
                        </Button>
                      ) : null}
                    </div>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.testEmptyState}>
          <p>Вопросы пока не добавлены</p>
          <span>
            Начните с первого вопроса ниже, затем добавьте варианты ответа или
            принятые текстовые ответы.
          </span>
        </div>
      )}

      <form className={styles.questionForm} onSubmit={handleQuestionSubmit}>
        <div className={styles.questionFormHeader}>
          <h6>
            {isEditingQuestion ? 'Редактировать вопрос' : 'Добавить вопрос'}
          </h6>
          <p>
            Выберите тип задания сразу: от него зависит, какие ответы сможет
            добавить автор теста и что увидит ученик.
          </p>
        </div>
        <Input
          id={`${material.id}-question-text`}
          title='Текст вопроса'
          value={questionForm.text}
          onChange={(event) =>
            updateQuestionForm({
              text: event.target.value,
              error: null
            })
          }
        />
        <label className={styles.field}>
          Тип вопроса
          <div className={styles.questionTypePicker}>
            {TEST_QUESTION_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type='button'
                className={clsx(
                  styles.questionTypeOption,
                  questionForm.type === option.value &&
                    styles.questionTypeOptionActive
                )}
                onClick={() =>
                  updateQuestionForm({
                    type: option.value,
                    error: null
                  })
                }
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <select
            className={styles.select}
            value={questionForm.type}
            onChange={(event) =>
              updateQuestionForm({
                type: event.target.value as TestQuestionType,
                error: null
              })
            }
          >
            {TEST_QUESTION_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {questionForm.error ? (
          <p className={styles.materialStateError}>{questionForm.error}</p>
        ) : null}
        <div className={styles.materialActions}>
          <Button
            variant='primary'
            type='submit'
            disabled={questionForm.isSubmitting}
          >
            {isEditingQuestion ? 'Сохранить вопрос' : 'Добавить вопрос'}
          </Button>
          {isEditingQuestion ? (
            <Button variant='secondary' onClick={resetQuestionForm}>
              Отменить
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
