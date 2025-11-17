import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactElement,
} from 'react';
import styles from './profileSkills.module.scss';
import { Title } from '@/shared/ui/Title';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import { useAuth } from '@/app/providers/auth';
import { getSkillsGroups } from '@/features/Filter/utils';
import type { UserSkill } from '@/entities/User/types';
import type { ApiUserSkill } from '@/shared/api/auth';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Tag } from '@/shared/ui/Tag/Tag';
import { SkillCategories, type SkillCategory } from '@/shared/lib/constants';
const CATEGORY_NAME_TO_CONSTANT = new Map<string, SkillCategory>(
  Object.values(SkillCategories).map((value) => [value, value]),
);
const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
const generateSkillId = () => {
  const cryptoApi = globalThis?.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  return `skill-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};
const cloneSkills = (skills?: UserSkill[]): UserSkill[] =>
  Array.isArray(skills)
    ? skills.map((skill) => ({
        ...skill,
        imageUrls: Array.isArray(skill.imageUrls)
          ? [...skill.imageUrls]
          : [],
      }))
    : [];
const createEmptySkill = (): UserSkill => ({
  id: generateSkillId(),
  title: '',
  categoryId: null,
  subcategoryId: null,
  description: '',
  imageUrls: [],
});
const enrichSkillsWithCategory = (
  skills: UserSkill[] | undefined,
  mapping: Map<number, number>,
): UserSkill[] =>
  cloneSkills(skills).map((skill) => {
    if (
      typeof skill.categoryId !== 'number' &&
      typeof skill.subcategoryId === 'number'
    ) {
      const fallback = mapping.get(skill.subcategoryId) ?? null;
      return { ...skill, categoryId: fallback };
    }
    return skill;
  });
const FALLBACK_TITLE = 'Без названия';
const FALLBACK_DESCRIPTION = 'Описание появится позже.';

const sanitizeSkillsForSubmit = (
  skills: UserSkill[],
  subskillToCategory: Map<number, number>,
  subskillNameMap: Map<number, string>,
): ApiUserSkill[] =>
  skills.map((skill) => {
    const fallbackCategory =
      typeof skill.subcategoryId === 'number'
        ? subskillToCategory.get(skill.subcategoryId) ?? null
        : null;
    const trimmedTitle = skill.title.trim();
    const fallbackTitle =
      typeof skill.subcategoryId === 'number'
        ? subskillNameMap.get(skill.subcategoryId) ?? ''
        : '';
    const safeTitle =
      trimmedTitle.length >= 2
        ? trimmedTitle
        : fallbackTitle.length >= 2
          ? fallbackTitle
          : FALLBACK_TITLE;
    const trimmedDescription = skill.description.trim();
    const safeDescription =
      trimmedDescription.length > 0 ? trimmedDescription : FALLBACK_DESCRIPTION;
    return {
      id: skill.id,
      title: safeTitle,
      categoryId:
        typeof skill.categoryId === 'number'
          ? skill.categoryId
          : fallbackCategory ?? null,
      subcategoryId:
        typeof skill.subcategoryId === 'number'
          ? skill.subcategoryId
          : null,
      description: safeDescription,
      imageUrls: skill.imageUrls
        .map((url) => url.trim())
        .filter((url) => url.length > 0),
    };
  });
const serializeSkills = (
  skills: UserSkill[],
  subskillToCategory: Map<number, number>,
  subskillNameMap: Map<number, string>,
) =>
  JSON.stringify(
    sanitizeSkillsForSubmit(skills, subskillToCategory, subskillNameMap)
      .map((skill) => ({
        ...skill,
        imageUrls: [...skill.imageUrls],
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
type SkillType = 'teach' | 'learn';
export function ProfileSkills(): ReactElement {
  const { user, updateProfile } = useAuth();
  const skillGroups = useMemo(() => getSkillsGroups(), []);
  const subskillNameMap = useMemo(() => {
    const map = new Map<number, string>();
    skillGroups.forEach((group) =>
      group.skills.forEach((skill) => map.set(skill.id, skill.name)),
    );
    return map;
  }, [skillGroups]);
  const categoryIdToSkillCategory = useMemo(() => {
    const map = new Map<number, SkillCategory>();
    skillGroups.forEach((group) => {
      const normalized = CATEGORY_NAME_TO_CONSTANT.get(group.name);
      if (normalized) {
        map.set(group.id, normalized);
      }
    });
    return map;
  }, [skillGroups]);
  const subskillToCategoryMap = useMemo(() => {
    const map = new Map<number, number>();
    skillGroups.forEach((group) =>
      group.skills.forEach((skill) => map.set(skill.id, group.id)),
    );
    return map;
  }, [skillGroups]);
  const [isEditing, setIsEditing] = useState(false);
  const [teachableDraft, setTeachableDraft] = useState<UserSkill[]>(() =>
    enrichSkillsWithCategory(user?.teachableSkills, subskillToCategoryMap),
  );
  const [learningDraft, setLearningDraft] = useState<UserSkill[]>(() =>
    enrichSkillsWithCategory(user?.learningSkills, subskillToCategoryMap),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [previewSkillState, setPreviewSkillState] = useState<{
    type: SkillType;
    skill: UserSkill;
  } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  useEffect(() => {
    if (!isEditing) {
      setTeachableDraft(
        enrichSkillsWithCategory(
          user?.teachableSkills,
          subskillToCategoryMap,
        ),
      );
      setLearningDraft(
        enrichSkillsWithCategory(
          user?.learningSkills,
          subskillToCategoryMap,
        ),
      );
    }
  }, [
    isEditing,
    subskillToCategoryMap,
    user?.learningSkills,
    user?.teachableSkills,
  ]);
  const teachableBaseline = useMemo(
    () =>
      serializeSkills(
        enrichSkillsWithCategory(
          user?.teachableSkills,
          subskillToCategoryMap,
        ),
        subskillToCategoryMap,
        subskillNameMap,
      ),
    [user?.teachableSkills, subskillToCategoryMap, subskillNameMap],
  );
  const learningBaseline = useMemo(
    () =>
      serializeSkills(
        enrichSkillsWithCategory(
          user?.learningSkills,
          subskillToCategoryMap,
        ),
        subskillToCategoryMap,
        subskillNameMap,
      ),
    [user?.learningSkills, subskillToCategoryMap, subskillNameMap],
  );
  const currentTeachableSignature = serializeSkills(
    teachableDraft,
    subskillToCategoryMap,
    subskillNameMap,
  );
  const currentLearningSignature = serializeSkills(
    learningDraft,
    subskillToCategoryMap,
    subskillNameMap,
  );
  const hasChanges =
    currentTeachableSignature !== teachableBaseline ||
    currentLearningSignature !== learningBaseline;
  const startEditing = () => {
    setIsEditing(true);
    setSaveError(null);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };
  const handleAddSkill = (type: SkillType) => {
    const updater =
      type === 'teach' ? setTeachableDraft : setLearningDraft;
    updater((prev) => [...prev, createEmptySkill()]);
  };
  const handleRemoveSkill = (type: SkillType, skillId: string) => {
    const updater =
      type === 'teach' ? setTeachableDraft : setLearningDraft;
    updater((prev) => prev.filter((skill) => skill.id !== skillId));
  };
  const updateSkill = (
    type: SkillType,
    skillId: string,
    updaterFn: (skill: UserSkill) => UserSkill,
  ) => {
    const updater =
      type === 'teach' ? setTeachableDraft : setLearningDraft;
    updater((prev) =>
      prev.map((skill) => (skill.id === skillId ? updaterFn(skill) : skill)),
    );
  };
  const openSkillPreview = (type: SkillType, skill: UserSkill) => {
    setPreviewSkillState({
      type,
      skill: {
        ...skill,
        imageUrls: [...skill.imageUrls],
      },
    });
  };
  const closeSkillPreview = () => {
    setPreviewSkillState(null);
  };
  const handleTitleChange = (
    type: SkillType,
    skillId: string,
    value: string,
  ) => {
    updateSkill(type, skillId, (skill) => ({ ...skill, title: value }));
  };
  const handleCategoryChange = (
    type: SkillType,
    skillId: string,
    categoryValue: string,
  ) => {
    const nextCategory =
      categoryValue === '' ? null : Number(categoryValue);
    updateSkill(type, skillId, (skill) => ({
      ...skill,
      categoryId: Number.isFinite(nextCategory) ? nextCategory : null,
      subcategoryId: null,
    }));
  };
  const handleSubcategoryChange = (
    type: SkillType,
    skillId: string,
    subcategoryValue: string,
  ) => {
    const nextSubcategory =
      subcategoryValue === '' ? null : Number(subcategoryValue);
    updateSkill(type, skillId, (skill) => ({
      ...skill,
      subcategoryId: Number.isFinite(nextSubcategory)
        ? nextSubcategory
        : null,
    }));
  };
  const handleDescriptionChange = (
    type: SkillType,
    skillId: string,
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { value } = event.target;
    updateSkill(type, skillId, (skill) => ({
      ...skill,
      description: value,
    }));
  };
  const handleImageChange = (
    type: SkillType,
    skillId: string,
    index: number,
    value: string,
  ) => {
    updateSkill(type, skillId, (skill) => {
      const nextImages = [...skill.imageUrls];
      nextImages[index] = value;
      return { ...skill, imageUrls: nextImages };
    });
  };
  const handleImageUpload = async (
    type: SkillType,
    skillId: string,
    index: number | null,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      if (!dataUrl) {
        return;
      }
      if (typeof index === 'number') {
        handleImageChange(type, skillId, index, dataUrl);
      } else {
        updateSkill(type, skillId, (skill) => ({
          ...skill,
          imageUrls: [...skill.imageUrls, dataUrl],
        }));
      }
    } catch (error) {
      console.error('[ProfileSkills] Failed to read image file', error);
    } finally {
      event.target.value = '';
    }
  };
  const handleRemoveImageField = (
    type: SkillType,
    skillId: string,
    index: number,
  ) => {
    updateSkill(type, skillId, (skill) => {
      const nextImages = skill.imageUrls.filter((_, idx) => idx !== index);
      return { ...skill, imageUrls: nextImages };
    });
  };
  const resolveCategoryName = (categoryId: number | null) => {
    if (typeof categoryId !== 'number') {
      return null;
    }
    return skillGroups.find((group) => group.id === categoryId)?.name ?? null;
  };
  const resolveSubcategoryName = (subcategoryId: number | null) => {
    if (typeof subcategoryId !== 'number') {
      return null;
    }
    return subskillNameMap.get(subcategoryId) ?? null;
  };
  const resolveSkillCategoryId = (skill: UserSkill): number | null => {
    if (typeof skill.categoryId === 'number') {
      return skill.categoryId;
    }
    if (typeof skill.subcategoryId === 'number') {
      return subskillToCategoryMap.get(skill.subcategoryId) ?? null;
    }
    return null;
  };
  const resolveTagCategory = (skill: UserSkill): SkillCategory | undefined => {
    const categoryId = resolveSkillCategoryId(skill);
    if (typeof categoryId === 'number') {
      const mapped = categoryIdToSkillCategory.get(categoryId);
      if (mapped) {
        return mapped;
      }
    }
    if (typeof skill.subcategoryId === 'number') {
      const fallback = subskillToCategoryMap.get(skill.subcategoryId);
      if (typeof fallback === 'number') {
        return categoryIdToSkillCategory.get(fallback);
      }
    }
    return undefined;
  };
  const renderSkillGallery = (images: string[]) => {
    if (!images.length) {
      return (
        <p className={styles.emptyGallery}>
          Изображения еще не добавлены.
        </p>
      );
    }
    return (
      <div className={styles.gallery}>
        {images.map((url, index) => (
          <div key={`${url}-${index}`} className={styles.galleryItem}>
            <img src={url} alt="Skill image" />
          </div>
        ))}
      </div>
    );
  };
  const renderSkillCard = (skill: UserSkill) => {
    const categoryId = resolveSkillCategoryId(skill);
    const categoryName =
      resolveCategoryName(categoryId) ?? 'No category selected';
    const subcategoryName =
      resolveSubcategoryName(skill.subcategoryId) ??
      'Subcategory not selected';
    const title =
      skill.title.trim() ||
      resolveSubcategoryName(skill.subcategoryId) ||
      'Skill without a name';
    const description =
      skill.description.trim() || 'Description is not provided yet.';
    return (
      <article key={skill.id} className={styles.skillCard}>
        <header className={styles.skillCardHeader}>
          <span className={styles.skillCategory}>{categoryName}</span>
          <span className={styles.skillSubcategory}>{subcategoryName}</span>
        </header>
        <h4 className={styles.skillTitle}>{title}</h4>
        <p className={styles.skillDescription}>{description}</p>
        {renderSkillGallery(skill.imageUrls)}
      </article>
    );
  };
  const renderLearningSkillTag = (skill: UserSkill) => {
    const tagCategory = resolveTagCategory(skill);
    const categoryId = resolveSkillCategoryId(skill);
    const label =
      resolveSubcategoryName(skill.subcategoryId) ??
      resolveCategoryName(categoryId) ??
      'Subcategory not selected';
    return (
      <Tag key={skill.id} category={tagCategory} className={styles.learningTag}>
        {label}
      </Tag>
    );
  };
  const renderSkillEditor = (type: SkillType, skill: UserSkill) => {
    const categoryOptions = skillGroups.map((group) => ({
      value: group.id.toString(),
      label: group.name,
    }));
    const currentCategory =
      typeof skill.categoryId === 'number' ? skill.categoryId : null;
    const availableSubskills =
      typeof currentCategory === 'number'
        ? skillGroups.find((group) => group.id === currentCategory)?.skills ??
          []
        : [];
    const isLearningSkill = type === 'learn';
    const fallbackTitle =
      resolveSubcategoryName(skill.subcategoryId) ??
      resolveCategoryName(resolveSkillCategoryId(skill)) ??
      'Новый навык';
    const trimmedTitle = skill.title.trim();
    const skillTitle = isLearningSkill
      ? fallbackTitle
      : trimmedTitle || fallbackTitle;
    return (
      <div key={skill.id} className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <Title tag="h3" variant="md">
            {skillTitle}
          </Title>
          <div className={styles.editorHeaderActions}>
            {!isLearningSkill && (
              <Button
                variant="primary"
                onClick={() => openSkillPreview(type, skill)}
              >
                Сохранить навык
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => handleRemoveSkill(type, skill.id)}
            >
              Удалить
            </Button>
          </div>
        </div>
        <div className={styles.formGrid}>
          {!isLearningSkill && (
            <Input
              title="Название навыка"
              placeholder="Введите название навыка"
              value={skill.title}
              onChange={(event) =>
                handleTitleChange(type, skill.id, event.target.value)
              }
            />
          )}
            <label className={styles.field}>
                Категория
                <select
                  className={styles.select}
                  value={skill.categoryId ?? ''}
                  onChange={(event) =>
                    handleCategoryChange(type, skill.id, event.target.value)
                  }
                >
                  <option value="">Выберите категорию</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                Подкатегория
                <select
                  className={styles.select}
                  value={skill.subcategoryId ?? ''}
                  disabled={!availableSubskills.length}
                  onChange={(event) =>
                    handleSubcategoryChange(type, skill.id, event.target.value)
                  }
                >
                  <option value="">Выберите подкатегорию</option>
                  {availableSubskills.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
        {!isLearningSkill && (
          <>
            <label className={styles.field}>
              Описание
              <textarea
                className={styles.textarea}
                placeholder="Расскажите другим, что делает этот навык ценным"
                value={skill.description}
                onChange={(event) => handleDescriptionChange(type, skill.id, event)}
                rows={4}
              />
            </label>
            <div className={styles.field}>
              <span>Изображения</span>
              {!skill.imageUrls.length && (
                <p className={styles.imageHint}>
                  Добавьте хотя бы одно изображение, чтобы другие пользователи лучше понимали, что вы предлагаете.
                </p>
              )}
              <div className={styles.imageList}>
                {skill.imageUrls.map((url, index) => {
                  const inputId = `${skill.id}-image-${index}`;
                  return (
                    <div key={inputId} className={styles.imageRow}>
                      <div className={styles.imagePreview}>
                        {url ? (
                          <img src={url} alt="Превью навыка" />
                        ) : (
                          <span>Нет изображения</span>
                        )}
                      </div>
                      <div className={styles.imageControls}>
                        <label htmlFor={inputId} className={styles.uploadButton}>
                          <input
                            id={inputId}
                            type="file"
                            accept="image/*"
                            className={styles.uploadInput}
                            onChange={(event) =>
                              handleImageUpload(type, skill.id, index, event)
                            }
                          />
                          Выбрать файл
                        </label>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            handleRemoveImageField(type, skill.id, index)
                          }
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <label
                className={`${styles.uploadButton} ${styles.uploadButtonFull}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className={styles.uploadInput}
                  onChange={(event) =>
                    handleImageUpload(type, skill.id, null, event)
                  }
                />
                Добавить изображение
              </label>
            </div>          </>
        )}
      </div>
    );
  };
  const handleSave = async (): Promise<boolean> => {
    if (!user) {
      return false;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const teachablePayload = sanitizeSkillsForSubmit(
        teachableDraft,
        subskillToCategoryMap,
        subskillNameMap,
      );
      const learningPayload = sanitizeSkillsForSubmit(
        learningDraft,
        subskillToCategoryMap,
        subskillNameMap,
      );
      await updateProfile({
        teachableSkills: teachablePayload,
        learningSkills: learningPayload,
      });
      setIsEditing(false);
      return true;
    } catch (error) {
      console.error('[ProfileSkills] Failed to save skills', error);
      setSaveError('Failed to save your skills. Please try again later.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  const handlePreviewConfirm = async () => {
    const success = await handleSave();
    if (success) {
      closeSkillPreview();
    }
  };
  const teachableView = isEditing
    ? teachableDraft
    : user?.teachableSkills ?? [];
  const learningView = isEditing ? learningDraft : user?.learningSkills ?? [];
  const previewSkill = previewSkillState?.skill ?? null;
  const previewCategoryId =
    previewSkill && typeof previewSkill.categoryId === 'number'
      ? previewSkill.categoryId
      : previewSkill && typeof previewSkill.subcategoryId === 'number'
        ? subskillToCategoryMap.get(previewSkill.subcategoryId) ?? null
        : null;
  const previewCategoryName =
    previewSkill && previewCategoryId !== null
      ? resolveCategoryName(previewCategoryId) ?? 'No category selected'
      : 'No category selected';
  const previewSubcategoryName = previewSkill
    ? resolveSubcategoryName(previewSkill.subcategoryId) ??
      'Subcategory not selected'
    : 'Subcategory not selected';
  const previewTitle =
    previewSkill?.title.trim() ||
    'Skill without a name';
  const previewDescription =
    previewSkill?.description.trim() ||
    'Description is not provided yet.';
  const previewGallery =
    previewSkill && previewSkill.imageUrls.length
      ? previewSkill.imageUrls
      : [];
  const hasPreviewImages = previewGallery.length > 0;
  const previewMainImage = hasPreviewImages ? previewGallery[0] : null;
  const previewThumbs = hasPreviewImages ? previewGallery.slice(1, 4) : [];
  const previewExtraCount = hasPreviewImages
    ? Math.max(previewGallery.length - 4, 0)
    : 0;
  const isPreviewOpen = Boolean(previewSkill);
  return (
    <>
      <section className={styles.skills}>
        <div className={styles.header}>
          <div>
            <Title tag="h2" variant="lg">Мои навыки</Title>
            <p className={styles.subtitle}>
              Управляйте навыками, которыми вы можете поделиться с другими, и теми, которые вы хотите изучить.
              Чем больше деталей и фотографий вы добавите, тем легче другим участникам будет вас найти.
            </p>
          </div>
          <div className={styles.actions}>
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Отменить
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                >
                  {isSaving ? 'Сохраняю…' : 'Сохранить изменения'}
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={startEditing}>
                Редактировать навыки
              </Button>
            )}
          </div>
        </div>
        {saveError && <p className={styles.error}>{saveError}</p>}
        <div className={styles.cards}>
          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>Могу научить</p>
              </div>
            </header>
            <div className={styles.cardBody}>
              {isEditing ? (
                <>
                  {teachableDraft.map((skill) =>
                    renderSkillEditor('teach', skill),
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => handleAddSkill('teach')}
                  >
                    Добавить навык
                  </Button>
                </>
              ) : teachableView.length ? (
                <div className={styles.skillList}>
                  {teachableView.map((skill) => renderSkillCard(skill))}
                </div>
              ) : (
                <p className={styles.emptyList}>
                  Пока нет навыков, которыми вы можете поделиться. Добавьте хотя бы одну карточку, чтобы показать, чем вы можете помочь.
                </p>
              )}
            </div>
          </article>
          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>Хочу научиться</p>
              </div>
            </header>
            <div className={styles.cardBody}>
              {isEditing ? (
                <>
                  {learningDraft.map((skill) =>
                    renderSkillEditor('learn', skill),
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => handleAddSkill('learn')}
                  >
                    Добавить навык
                  </Button>
                </>
              ) : learningView.length ? (
                <div className={styles.learningTags}>
                  {learningView.map((skill) => renderLearningSkillTag(skill))}
                </div>
              ) : (
                <p className={styles.emptyList}>
                  Опишите навыки, которые вы хотели бы изучить, чтобы другие участники могли предложить обмен.
                </p>
              )}
            </div>
          </article>
        </div>
      </section>
      <Modal
        isOpen={isPreviewOpen}
        onClose={closeSkillPreview}
        className={styles.previewModal}
      >
        <div className={styles.previewModalHeader}>
          <Title tag="h2" variant="lg">Предварительный просмотр навыка</Title>
          <p>
            Проверьте заголовок, описание и галерею. Вернитесь назад, если нужно что-то изменить.
          </p>
        </div>
        <div className={styles.previewModalBody}>
          <div className={styles.previewContent}>
            <Title tag="h3" variant="lg">{previewTitle}</Title>
            <span className={styles.previewCategory}>
              {previewCategoryName}
              {previewSubcategoryName ? ` / ${previewSubcategoryName}` : ''}
            </span>
            <p className={styles.previewDescription}>{previewDescription}</p>
            <div className={styles.previewActions}>
              <Button variant="secondary" onClick={closeSkillPreview}>
                Вернуться к редактированию
              </Button>
              <Button
                variant="primary"
                onClick={handlePreviewConfirm}
                disabled={isSaving}
              >
                {isSaving ? 'Сохраняю…' : 'Сохранить навыки'}
              </Button>
            </div>
          </div>
          {hasPreviewImages && previewMainImage && (
            <div className={styles.previewGallery}>
              <img
                src={previewMainImage}
                alt={previewTitle}
                className={styles.previewMainImage}
              />
              <div className={styles.previewThumbs}>
                {previewThumbs.map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={previewTitle}
                    className={styles.previewThumb}
                  />
                ))}
                {previewExtraCount > 0 && (
                  <div className={styles.previewThumbMore}>+{previewExtraCount}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
