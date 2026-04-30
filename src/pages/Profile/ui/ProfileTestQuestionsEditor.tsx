import type { FormEvent, ReactElement } from 'react';
import { useTestQuestionsEditor } from '../model/useTestQuestionsEditor';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import type { MaterialDto, TestQuestionDto } from '@/shared/api/materials';
import styles from './profileSkillMaterials.module.scss';

interface ProfileTestQuestionsEditorProps {
  material: MaterialDto;
  onRefresh: () => Promise<void>;
}

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
      <h6>Вопросы теста</h6>
      {material.questions?.length ? (
        <div className={styles.questionList}>
          {material.questions.map((question) => {
            const answerForm = getAnswerForm(question.id);
            const isEditingAnswer = Boolean(answerForm.editingOptionId);

            return (
              <article key={question.id} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <strong>{question.text}</strong>
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

                {question.answerOptions.length ? (
                  <ul className={styles.answerList}>
                    {question.answerOptions.map((option) => (
                      <li key={option.id} className={styles.answerItem}>
                        <span>{option.text}</span>
                        {option.isCorrect ? (
                          <span className={styles.correctBadge}>
                            Правильный ответ
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
                    Варианты ответа пока не добавлены
                  </p>
                )}

                <form
                  className={styles.answerForm}
                  onSubmit={(event) => handleAnswerSubmit(question, event)}
                >
                  <Input
                    id={`${question.id}-answer-text`}
                    title='Текст варианта'
                    value={answerForm.text}
                    onChange={(event) =>
                      updateAnswerForm(question.id, {
                        text: event.target.value,
                        error: null
                      })
                    }
                  />
                  <label className={styles.checkboxField}>
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
                      {isEditingAnswer
                        ? 'Сохранить вариант'
                        : 'Добавить вариант'}
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
              </article>
            );
          })}
        </div>
      ) : (
        <p className={styles.materialState}>Вопросы пока не добавлены</p>
      )}

      <form className={styles.questionForm} onSubmit={handleQuestionSubmit}>
        <h6>
          {isEditingQuestion ? 'Редактировать вопрос' : 'Добавить вопрос'}
        </h6>
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
