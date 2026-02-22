import { useNavigate } from 'react-router-dom';
import styles from './create.module.scss';
import { useAuth } from '@/app/providers/auth';
import { useFiltersBaseData } from '@/features/Filter/model/useFiltersBaseData';
import { ROUTES } from '@/shared/constants';
import { Button } from '@/shared/ui/button/Button';
import { Title } from '@/shared/ui/Title';
import { useAuthEntryNavigation } from '@/shared/lib/router/useAuthEntryNavigation';
import { CREATE_SKILL_COPY } from '../model/content';
import { useCreateSkillForm } from '../model/useCreateSkillForm';
import { ErrorSummary } from './ErrorSummary';
import {
  BasicsSection,
  DescriptionSection,
  ImageSection,
  TagsSection
} from './FormSections';

const Create = () => {
  const navigate = useNavigate();
  const { navigateToLogin } = useAuthEntryNavigation();
  const { user, updateProfile } = useAuth();
  const {
    skillGroups,
    isLoading,
    error: baseDataError,
    refetch: refetchBaseData
  } = useFiltersBaseData();

  const {
    ids,
    controls,
    refs,
    title,
    description,
    type,
    categoryId,
    subcategoryId,
    imagePreviewUrl,
    tags,
    tagInput,
    subcategoryOptions,
    visibleFieldErrors,
    isFormValid,
    isSubmitting,
    submitError,
    isTagAddDisabled,
    isTagsLimitReached,
    titleError,
    typeError,
    categoryError,
    subcategoryError,
    descriptionError,
    imageError,
    tagsError,
    titleDescribedBy,
    typeDescribedBy,
    categoryDescribedBy,
    subcategoryDescribedBy,
    descriptionDescribedBy,
    imageDescribedBy,
    tagsDescribedBy,
    markTouched,
    focusField,
    handleTitleChange,
    handleDescriptionChange,
    handleTypeChange,
    handleCategoryChange,
    handleSubcategoryChange,
    handleImageChange,
    handleTagInputChange,
    handleTagInputKeyDown,
    handleTagAdd,
    handleTagRemove,
    handleDescriptionKeyDown,
    handleSubmit
  } = useCreateSkillForm({
    user,
    updateProfile,
    skillGroups,
    onCreated: () => navigate(ROUTES.CATALOG)
  });

  if (!user) {
    return (
      <section className={styles.create}>
        <div className={styles.container}>
          <Title tag='h1' variant='xl'>
            {CREATE_SKILL_COPY.pageTitle}
          </Title>
          <p className={styles.subtitle}>{CREATE_SKILL_COPY.guestSubtitle}</p>
          <div className={styles.actions}>
            <Button variant='secondary' onClick={() => navigateToLogin()}>
              {CREATE_SKILL_COPY.guestLoginButton}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const handleBaseDataRetry = () => {
    Promise.resolve(refetchBaseData()).catch((error) => {
      console.error('[CreateSkill] Failed to refetch filters base data', error);
    });
  };

  return (
    <section className={styles.create}>
      <div className={styles.container}>
        <Title tag='h1' variant='xl'>
          {CREATE_SKILL_COPY.pageTitle}
        </Title>
        <p className={styles.subtitle}>{CREATE_SKILL_COPY.formSubtitle}</p>

        <form
          ref={refs.formRef}
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting}
        >
          <ErrorSummary
            id={ids.formErrorsSummaryId}
            errors={visibleFieldErrors}
            onSelect={focusField}
          />

          {baseDataError && (
            <div
              className={styles.baseDataNotice}
              role='status'
              aria-live='polite'
            >
              <p className={styles.baseDataNoticeText}>
                {CREATE_SKILL_COPY.baseDataLoadError}
              </p>
              <Button
                type='button'
                variant='secondary'
                onClick={handleBaseDataRetry}
                disabled={isLoading}
              >
                {isLoading
                  ? CREATE_SKILL_COPY.baseDataRetryLoading
                  : CREATE_SKILL_COPY.baseDataRetry}
              </Button>
            </div>
          )}

          <BasicsSection
            ids={ids}
            controls={controls}
            refs={refs}
            skillGroups={skillGroups}
            subcategoryOptions={subcategoryOptions}
            isLoading={isLoading}
            title={title}
            type={type}
            categoryId={categoryId}
            subcategoryId={subcategoryId}
            titleError={titleError}
            typeError={typeError}
            categoryError={categoryError}
            subcategoryError={subcategoryError}
            titleDescribedBy={titleDescribedBy}
            typeDescribedBy={typeDescribedBy}
            categoryDescribedBy={categoryDescribedBy}
            subcategoryDescribedBy={subcategoryDescribedBy}
            onTitleChange={handleTitleChange}
            onTypeChange={handleTypeChange}
            onCategoryChange={handleCategoryChange}
            onSubcategoryChange={handleSubcategoryChange}
            onFieldBlur={markTouched}
          />

          <DescriptionSection
            ids={ids}
            controls={controls}
            description={description}
            descriptionError={descriptionError}
            descriptionDescribedBy={descriptionDescribedBy}
            onDescriptionChange={handleDescriptionChange}
            onDescriptionKeyDown={handleDescriptionKeyDown}
            onFieldBlur={markTouched}
          />

          <ImageSection
            ids={ids}
            controls={controls}
            imagePreviewUrl={imagePreviewUrl}
            imageError={imageError}
            imageDescribedBy={imageDescribedBy}
            onImageChange={handleImageChange}
          />

          <TagsSection
            ids={ids}
            controls={controls}
            tags={tags}
            tagInput={tagInput}
            tagsError={tagsError}
            tagsDescribedBy={tagsDescribedBy}
            isSubmitting={isSubmitting}
            isTagsLimitReached={isTagsLimitReached}
            isTagAddDisabled={isTagAddDisabled}
            onTagInputChange={handleTagInputChange}
            onTagInputKeyDown={handleTagInputKeyDown}
            onTagAdd={handleTagAdd}
            onTagRemove={handleTagRemove}
            onFieldBlur={markTouched}
          />

          {submitError && (
            <p
              id={ids.submitErrorId}
              className={styles.submitError}
              role='alert'
              aria-live='assertive'
            >
              {submitError}
            </p>
          )}

          <div className={styles.actions}>
            <Button
              type='button'
              variant='secondary'
              disabled={isSubmitting}
              onClick={() => navigate(-1)}
            >
              {CREATE_SKILL_COPY.cancelButton}
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting
                ? CREATE_SKILL_COPY.submittingButton
                : CREATE_SKILL_COPY.submitButton}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Create;
