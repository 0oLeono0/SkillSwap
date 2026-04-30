import type { FormEvent, ReactElement } from 'react';
import { useSkillMaterials } from '../model/useSkillMaterials';
import { ProfileTestQuestionsEditor } from './ProfileTestQuestionsEditor';
import styles from './profileSkillMaterials.module.scss';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import {
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPE_OPTIONS
} from '@/shared/lib/materials';
import type { MaterialType } from '@/shared/api/materials';

interface ProfileSkillMaterialsProps {
  skillId: string;
}

export function ProfileSkillMaterials({
  skillId
}: ProfileSkillMaterialsProps): ReactElement {
  const {
    materialsState,
    form,
    updateForm,
    resetForm,
    startEdit,
    saveMaterial,
    deleteMaterial,
    refreshMaterials
  } = useSkillMaterials(skillId);

  const isEditingMaterial = Boolean(form.editingMaterialId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveMaterial();
  };

  return (
    <section className={styles.materialsBlock}>
      <div className={styles.materialsHeader}>
        <h5>Методические материалы</h5>
        <span>{materialsState.items.length}</span>
      </div>

      {materialsState.isLoading ? (
        <p className={styles.materialState}>Загрузка материалов...</p>
      ) : materialsState.error ? (
        <p className={styles.materialStateError}>{materialsState.error}</p>
      ) : materialsState.items.length === 0 ? (
        <p className={styles.materialState}>Материалы пока не добавлены</p>
      ) : (
        <div className={styles.materialList}>
          {materialsState.items.map((material) => (
            <article key={material.id} className={styles.materialCard}>
              <div className={styles.materialCardHeader}>
                <span className={styles.materialType}>
                  {MATERIAL_TYPE_LABELS[material.type]}
                </span>
                <div className={styles.materialActions}>
                  <Button
                    variant='secondary'
                    onClick={() => startEdit(material)}
                    aria-label={`Редактировать материал ${material.title}`}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant='secondary'
                    onClick={() => void deleteMaterial(material.id)}
                    aria-label={`Удалить материал ${material.title}`}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
              <h6>{material.title}</h6>
              {material.description ? <p>{material.description}</p> : null}
              {material.content ? (
                <p className={styles.materialContent}>{material.content}</p>
              ) : null}
              {material.type === 'testing' ? (
                <ProfileTestQuestionsEditor
                  material={material}
                  onRefresh={refreshMaterials}
                />
              ) : null}
            </article>
          ))}
        </div>
      )}

      <form className={styles.materialForm} onSubmit={handleSubmit}>
        <div className={styles.materialFormHeader}>
          <h5>
            {isEditingMaterial ? 'Редактировать материал' : 'Добавить материал'}
          </h5>
          {isEditingMaterial ? (
            <Button variant='secondary' onClick={resetForm}>
              Отменить
            </Button>
          ) : null}
        </div>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            Тип материала
            <select
              className={styles.select}
              value={form.type}
              onChange={(event) =>
                updateForm({
                  type: event.target.value as MaterialType,
                  error: null
                })
              }
            >
              {MATERIAL_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            id={`${skillId}-material-title`}
            title='Название материала'
            placeholder='Например, Основы планирования'
            value={form.title}
            onChange={(event) =>
              updateForm({
                title: event.target.value,
                error: null
              })
            }
          />
        </div>
        <label className={styles.field}>
          Описание материала
          <textarea
            className={styles.textarea}
            value={form.description}
            onChange={(event) =>
              updateForm({
                description: event.target.value,
                error: null
              })
            }
            rows={3}
          />
        </label>
        <label className={styles.field}>
          Содержимое материала
          <textarea
            className={styles.textarea}
            value={form.content}
            onChange={(event) =>
              updateForm({
                content: event.target.value,
                error: null
              })
            }
            rows={4}
          />
        </label>
        {form.error ? (
          <p className={styles.materialStateError}>{form.error}</p>
        ) : null}
        <Button variant='primary' type='submit' disabled={form.isSubmitting}>
          {form.isSubmitting
            ? 'Сохраняю...'
            : isEditingMaterial
              ? 'Сохранить материал'
              : 'Добавить материал'}
        </Button>
      </form>
    </section>
  );
}
