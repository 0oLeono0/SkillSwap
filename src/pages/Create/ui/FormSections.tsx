import { type ChangeEvent, type KeyboardEvent, type RefObject } from 'react';
import styles from './create.module.scss';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Radio, RadioGroup } from '@/shared/ui/Radio';
import { Button } from '@/shared/ui/button/Button';
import { CREATE_SKILL_CONSTRAINTS, type CreateSkillType } from '../model/form';
import {
  CREATE_SKILL_COPY,
  getCreateSkillRemoveTagLabel,
  getCreateSkillTagsLabel
} from '../model/content';
import type { SkillCategories, SkillOption } from '@/features/Filter/types';
import type {
  CreateSkillA11yIds,
  CreateSkillControlIds,
  TouchedField
} from '../model/useCreateSkillForm';

interface FieldErrorProps {
  id: string;
  message: string;
}

const FieldError = ({ id, message }: FieldErrorProps) => {
  return (
    <span id={id} className={styles.errorText} aria-live='polite'>
      {message}
    </span>
  );
};

interface BasicsSectionProps {
  ids: CreateSkillA11yIds;
  controls: CreateSkillControlIds;
  refs: {
    typeFieldRef: RefObject<HTMLDivElement | null>;
    categoryFieldRef: RefObject<HTMLDivElement | null>;
    subcategoryFieldRef: RefObject<HTMLDivElement | null>;
  };
  skillGroups: SkillCategories[];
  subcategoryOptions: SkillOption[];
  isLoading: boolean;
  title: string;
  type: CreateSkillType;
  categoryId: number | null;
  subcategoryId: number | null;
  titleError?: string;
  typeError?: string;
  categoryError?: string;
  subcategoryError?: string;
  titleDescribedBy?: string;
  typeDescribedBy?: string;
  categoryDescribedBy?: string;
  subcategoryDescribedBy?: string;
  onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (_event: ChangeEvent<HTMLInputElement>, value: string) => void;
  onCategoryChange: (value: string | string[]) => void;
  onSubcategoryChange: (value: string | string[]) => void;
  onFieldBlur: (field: TouchedField) => void;
}

export const BasicsSection = ({
  ids,
  controls,
  refs,
  skillGroups,
  subcategoryOptions,
  isLoading,
  title,
  type,
  categoryId,
  subcategoryId,
  titleError,
  typeError,
  categoryError,
  subcategoryError,
  titleDescribedBy,
  typeDescribedBy,
  categoryDescribedBy,
  subcategoryDescribedBy,
  onTitleChange,
  onTypeChange,
  onCategoryChange,
  onSubcategoryChange,
  onFieldBlur
}: BasicsSectionProps) => {
  return (
    <>
      <Input
        id={controls.titleInputId}
        title={CREATE_SKILL_COPY.titleLabel}
        placeholder={CREATE_SKILL_COPY.titlePlaceholder}
        value={title}
        name='title'
        maxLength={CREATE_SKILL_CONSTRAINTS.titleMax}
        required
        aria-invalid={Boolean(titleError)}
        aria-describedby={titleDescribedBy}
        errorId={ids.titleErrorId}
        onChange={onTitleChange}
        onBlur={() => onFieldBlur('title')}
        error={titleError}
      />

      <div
        ref={refs.typeFieldRef}
        className={`${styles.field} ${typeError ? styles.fieldInvalid : ''}`}
      >
        <span className={styles.fieldLabel}>{CREATE_SKILL_COPY.typeLabel}</span>
        <RadioGroup name='skill-type' value={type} onChange={onTypeChange}>
          <Radio
            value='teach'
            title={CREATE_SKILL_COPY.typeTeachLabel}
            aria-invalid={Boolean(typeError)}
            aria-describedby={typeDescribedBy}
          />
          <Radio
            value='learn'
            title={CREATE_SKILL_COPY.typeLearnLabel}
            aria-invalid={Boolean(typeError)}
            aria-describedby={typeDescribedBy}
          />
        </RadioGroup>
        {typeError && <FieldError id={ids.typeErrorId} message={typeError} />}
      </div>

      <div className={styles.grid}>
        <div
          ref={refs.categoryFieldRef}
          className={`${styles.field} ${categoryError ? styles.fieldInvalid : ''}`}
        >
          <Select
            label={CREATE_SKILL_COPY.categoryLabel}
            options={skillGroups.map((group) => ({
              value: group.id.toString(),
              label: group.name
            }))}
            value={categoryId?.toString() ?? ''}
            placeholder={
              isLoading
                ? CREATE_SKILL_COPY.categoryLoadingPlaceholder
                : CREATE_SKILL_COPY.categoryPlaceholder
            }
            onChange={onCategoryChange}
            inputAriaInvalid={Boolean(categoryError)}
            inputAriaDescribedBy={categoryDescribedBy}
            disabled={isLoading || skillGroups.length === 0}
          />
          {categoryError && (
            <FieldError id={ids.categoryErrorId} message={categoryError} />
          )}
        </div>

        <div
          ref={refs.subcategoryFieldRef}
          className={`${styles.field} ${
            subcategoryError ? styles.fieldInvalid : ''
          }`}
        >
          <Select
            label={CREATE_SKILL_COPY.subcategoryLabel}
            options={subcategoryOptions.map((skill) => ({
              value: skill.id.toString(),
              label: skill.name
            }))}
            value={subcategoryId?.toString() ?? ''}
            placeholder={CREATE_SKILL_COPY.subcategoryPlaceholder}
            onChange={onSubcategoryChange}
            inputAriaInvalid={Boolean(subcategoryError)}
            inputAriaDescribedBy={subcategoryDescribedBy}
            disabled={subcategoryOptions.length === 0}
          />
          {subcategoryError && (
            <FieldError
              id={ids.subcategoryErrorId}
              message={subcategoryError}
            />
          )}
        </div>
      </div>
    </>
  );
};

interface DescriptionSectionProps {
  ids: CreateSkillA11yIds;
  controls: CreateSkillControlIds;
  description: string;
  descriptionError?: string;
  descriptionDescribedBy?: string;
  onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onDescriptionKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onFieldBlur: (field: TouchedField) => void;
}

export const DescriptionSection = ({
  ids,
  controls,
  description,
  descriptionError,
  descriptionDescribedBy,
  onDescriptionChange,
  onDescriptionKeyDown,
  onFieldBlur
}: DescriptionSectionProps) => {
  return (
    <div
      className={`${styles.field} ${
        descriptionError ? styles.fieldInvalid : ''
      }`}
    >
      <label
        htmlFor={controls.descriptionInputId}
        className={styles.fieldLabel}
      >
        {CREATE_SKILL_COPY.descriptionLabel}
      </label>
      <span id={ids.descriptionHintId} className={styles.hintText}>
        {CREATE_SKILL_COPY.descriptionHint}
      </span>
      <textarea
        id={controls.descriptionInputId}
        className={styles.textarea}
        value={description}
        name='description'
        maxLength={CREATE_SKILL_CONSTRAINTS.descriptionMax}
        required
        aria-invalid={Boolean(descriptionError)}
        aria-describedby={descriptionDescribedBy}
        aria-keyshortcuts='Control+Enter Meta+Enter'
        onChange={onDescriptionChange}
        onKeyDown={onDescriptionKeyDown}
        onBlur={() => onFieldBlur('description')}
        placeholder={CREATE_SKILL_COPY.descriptionPlaceholder}
      />
      <span id={ids.descriptionCounterId} className={styles.counter}>
        {description.length}/{CREATE_SKILL_CONSTRAINTS.descriptionMax}
      </span>
      {descriptionError && (
        <FieldError id={ids.descriptionErrorId} message={descriptionError} />
      )}
    </div>
  );
};

interface ImageSectionProps {
  ids: CreateSkillA11yIds;
  controls: CreateSkillControlIds;
  imagePreviewUrl: string;
  imageError?: string;
  imageDescribedBy?: string;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const ImageSection = ({
  ids,
  controls,
  imagePreviewUrl,
  imageError,
  imageDescribedBy,
  onImageChange
}: ImageSectionProps) => {
  return (
    <div className={`${styles.field} ${imageError ? styles.fieldInvalid : ''}`}>
      <label htmlFor={controls.imageInputId} className={styles.fieldLabel}>
        {CREATE_SKILL_COPY.imageLabel}
      </label>
      <input
        id={controls.imageInputId}
        type='file'
        accept='image/jpeg,image/png'
        required
        aria-invalid={Boolean(imageError)}
        aria-describedby={imageDescribedBy}
        onChange={onImageChange}
      />
      {imagePreviewUrl && (
        <img
          src={imagePreviewUrl}
          alt={CREATE_SKILL_COPY.imagePreviewAlt}
          className={styles.imagePreview}
        />
      )}
      {imageError && <FieldError id={ids.imageErrorId} message={imageError} />}
    </div>
  );
};

interface TagsSectionProps {
  ids: CreateSkillA11yIds;
  controls: CreateSkillControlIds;
  tags: string[];
  tagInput: string;
  tagsError?: string | null;
  tagsDescribedBy?: string;
  isSubmitting: boolean;
  isTagsLimitReached: boolean;
  isTagAddDisabled: boolean;
  onTagInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTagInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onTagAdd: () => void;
  onTagRemove: (tag: string) => void;
  onFieldBlur: (field: TouchedField) => void;
}

export const TagsSection = ({
  ids,
  controls,
  tags,
  tagInput,
  tagsError,
  tagsDescribedBy,
  isSubmitting,
  isTagsLimitReached,
  isTagAddDisabled,
  onTagInputChange,
  onTagInputKeyDown,
  onTagAdd,
  onTagRemove,
  onFieldBlur
}: TagsSectionProps) => {
  return (
    <div className={`${styles.field} ${tagsError ? styles.fieldInvalid : ''}`}>
      <label htmlFor={controls.tagsInputId} className={styles.fieldLabel}>
        {getCreateSkillTagsLabel(CREATE_SKILL_CONSTRAINTS.maxTags)}
      </label>
      <div className={styles.tagInputRow}>
        <input
          id={controls.tagsInputId}
          className={styles.tagInput}
          value={tagInput}
          disabled={isSubmitting || isTagsLimitReached}
          aria-invalid={Boolean(tagsError)}
          aria-describedby={tagsDescribedBy}
          aria-keyshortcuts='Control+Enter Meta+Enter'
          onChange={onTagInputChange}
          onKeyDown={onTagInputKeyDown}
          onBlur={() => onFieldBlur('tags')}
          placeholder={
            isTagsLimitReached
              ? CREATE_SKILL_COPY.tagsLimitPlaceholder
              : CREATE_SKILL_COPY.tagsExamplePlaceholder
          }
        />
        <Button
          type='button'
          variant='secondary'
          disabled={isTagAddDisabled}
          onClick={onTagAdd}
        >
          {CREATE_SKILL_COPY.tagsAddButton}
        </Button>
      </div>
      <span
        id={ids.tagsCounterId}
        className={styles.counter}
        aria-live='polite'
      >
        {tags.length}/{CREATE_SKILL_CONSTRAINTS.maxTags}
      </span>
      {tags.length > 0 && (
        <div className={styles.tagList}>
          {tags.map((tag) => (
            <button
              key={tag}
              type='button'
              className={styles.tagItem}
              onClick={() => onTagRemove(tag)}
              aria-label={getCreateSkillRemoveTagLabel(tag)}
            >
              #{tag} ×
            </button>
          ))}
        </div>
      )}
      {tagsError && <FieldError id={ids.tagsErrorId} message={tagsError} />}
    </div>
  );
};
