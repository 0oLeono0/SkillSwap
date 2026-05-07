import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement
} from 'react';
import clsx from 'clsx';
import { useSkillMaterials } from '../model/useSkillMaterials';
import { ProfileTestQuestionsEditor } from './ProfileTestQuestionsEditor';
import styles from './profileSkillMaterials.module.scss';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import {
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPE_OPTIONS
} from '@/shared/lib/materials';
import type {
  MaterialAttachmentDto,
  MaterialDto,
  MaterialType
} from '@/shared/api/materials';

interface ProfileSkillMaterialsProps {
  skillId: string;
}

type MaterialEditorMode = 'hidden' | 'create' | 'edit';

const createAttachmentId = () => {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  return `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const fileToAttachment = (file: File) =>
  new Promise<MaterialAttachmentDto>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (!url) {
        reject(new Error('Failed to read attachment'));
        return;
      }
      resolve({
        id: createAttachmentId(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        url
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

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
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null
  );
  const [editorMode, setEditorMode] = useState<MaterialEditorMode>('hidden');

  const isEditingMaterial = Boolean(form.editingMaterialId);
  const isMaterialFormVisible =
    editorMode !== 'hidden' || materialsState.items.length === 0;
  const defaultSelectedMaterial = useMemo(
    () =>
      materialsState.items.find((material) => material.type === 'testing') ??
      materialsState.items[0] ??
      null,
    [materialsState.items]
  );
  const selectedMaterial = useMemo(
    () =>
      materialsState.items.find(
        (material) => material.id === selectedMaterialId
      ) ?? defaultSelectedMaterial,
    [defaultSelectedMaterial, materialsState.items, selectedMaterialId]
  );

  useEffect(() => {
    setSelectedMaterialId((currentId) => {
      if (
        currentId &&
        materialsState.items.some((material) => material.id === currentId)
      ) {
        return currentId;
      }

      return defaultSelectedMaterial?.id ?? null;
    });
  }, [defaultSelectedMaterial, materialsState.items]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isSaved = await saveMaterial();
    if (isSaved) {
      setEditorMode('hidden');
    }
  };

  const handleAttachmentUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    try {
      const attachments = await Promise.all(files.map(fileToAttachment));
      updateForm({
        attachments: [...form.attachments, ...attachments].slice(0, 10),
        error: null
      });
    } catch (error) {
      console.error('[ProfileSkillMaterials] Failed to read file', error);
      updateForm({ error: 'Не удалось добавить файл' });
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    updateForm({
      attachments: form.attachments.filter(
        (attachment) => attachment.id !== attachmentId
      ),
      error: null
    });
  };

  const handleEditMaterial = (material: MaterialDto) => {
    setSelectedMaterialId(material.id);
    startEdit(material);
    setEditorMode('edit');
  };

  const handleCreateMaterial = () => {
    resetForm();
    setEditorMode('create');
  };

  const handleCancelMaterialForm = () => {
    resetForm();
    setEditorMode(materialsState.items.length ? 'hidden' : 'create');
  };

  const renderMaterialForm = () => (
    <form className={styles.materialForm} onSubmit={handleSubmit}>
      <div className={styles.materialFormHeader}>
        <div>
          <h5>
            {isEditingMaterial ? 'Редактировать материал' : 'Добавить материал'}
          </h5>
          <p>
            Заполните заголовок, короткое описание, основной текст и приложите
            файлы, если они нужны ученику.
          </p>
        </div>
        {materialsState.items.length || isEditingMaterial ? (
          <Button variant='secondary' onClick={handleCancelMaterialForm}>
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
          title='Заголовок'
          aria-label='Название материала'
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
        Подзаголовок
        <textarea
          aria-label='Описание материала'
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
        Текст
        <textarea
          aria-label='Содержимое материала'
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
      <div className={styles.field}>
        <span>Файлы</span>
        {form.attachments.length ? (
          <ul className={styles.attachmentList}>
            {form.attachments.map((attachment) => (
              <li key={attachment.id}>
                <a href={attachment.url} download={attachment.name}>
                  {attachment.name}
                </a>
                <Button
                  variant='secondary'
                  onClick={() => handleRemoveAttachment(attachment.id)}
                >
                  Удалить
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.materialState}>Файлы пока не добавлены</p>
        )}
        <label className={styles.uploadButton}>
          <input
            type='file'
            multiple
            className={styles.uploadInput}
            onChange={handleAttachmentUpload}
          />
          Добавить файлы
        </label>
      </div>
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
  );

  return (
    <section className={styles.materialsBlock}>
      <div className={styles.materialsHeader}>
        <h5>Методические материалы</h5>
        <div className={styles.materialsHeaderActions}>
          <span>{materialsState.items.length}</span>
          {!isMaterialFormVisible ? (
            <Button variant='secondary' onClick={handleCreateMaterial}>
              Добавить материал
            </Button>
          ) : null}
        </div>
      </div>

      {materialsState.isLoading ? (
        <p className={styles.materialState}>Загрузка материалов...</p>
      ) : materialsState.error ? (
        <p className={styles.materialStateError}>{materialsState.error}</p>
      ) : materialsState.items.length === 0 ? (
        <div className={styles.materialEmptyWorkspace}>
          <p className={styles.materialState}>Материалы пока не добавлены</p>
          {renderMaterialForm()}
        </div>
      ) : (
        <div className={styles.materialsWorkspace}>
          <aside className={styles.materialsSidebar}>
            <div className={styles.materialsSidebarHeader}>
              <span>Структура курса</span>
              <strong>{materialsState.items.length}</strong>
            </div>
            <ul className={styles.materialNavList}>
              {materialsState.items.map((material, index) => {
                const isActive = material.id === selectedMaterial?.id;
                return (
                  <li key={material.id}>
                    <button
                      type='button'
                      className={clsx(
                        styles.materialNavItem,
                        isActive && styles.materialNavItemActive
                      )}
                      onClick={() => setSelectedMaterialId(material.id)}
                    >
                      <span className={styles.materialType}>
                        {MATERIAL_TYPE_LABELS[material.type]}
                      </span>
                      <strong>
                        {isActive
                          ? `Открыт: ${material.title}`
                          : material.title}
                      </strong>
                      <small>
                        {material.description ||
                          `Материал ${index + 1} без подзаголовка`}
                      </small>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className={styles.materialDetailsPanel}>
            {isMaterialFormVisible ? (
              renderMaterialForm()
            ) : selectedMaterial ? (
              <article className={styles.materialCard}>
                <div className={styles.materialCardHeader}>
                  <span className={styles.materialType}>
                    {MATERIAL_TYPE_LABELS[selectedMaterial.type]}
                  </span>
                  <div className={styles.materialActions}>
                    <Button
                      variant='secondary'
                      onClick={() => handleEditMaterial(selectedMaterial)}
                      aria-label={`Редактировать материал ${selectedMaterial.title}`}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant='secondary'
                      onClick={() => void deleteMaterial(selectedMaterial.id)}
                      aria-label={`Удалить материал ${selectedMaterial.title}`}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
                <h6>{selectedMaterial.title}</h6>
                {selectedMaterial.description ? (
                  <p>{selectedMaterial.description}</p>
                ) : null}
                {selectedMaterial.content ? (
                  <p className={styles.materialContent}>
                    {selectedMaterial.content}
                  </p>
                ) : null}
                {selectedMaterial.attachments?.length ? (
                  <ul className={styles.attachmentList}>
                    {selectedMaterial.attachments.map((attachment) => (
                      <li key={attachment.id}>
                        <a href={attachment.url} download={attachment.name}>
                          {attachment.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {selectedMaterial.type === 'testing' ? (
                  <ProfileTestQuestionsEditor
                    material={selectedMaterial}
                    onRefresh={refreshMaterials}
                  />
                ) : null}
              </article>
            ) : (
              <p className={styles.materialState}>
                Выберите материал, чтобы открыть редактор.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
