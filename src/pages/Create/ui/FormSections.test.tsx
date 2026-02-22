import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import {
  createSkillA11yIds,
  createSkillControlIds,
  type TouchedField
} from '../model/useCreateSkillForm';
import {
  CREATE_SKILL_COPY,
  getCreateSkillRemoveTagLabel
} from '../model/content';
import {
  CREATE_SKILL_TEST_GROUPS,
  CREATE_SKILL_TEST_VALUES,
  createCustomCreateSkillImageFile
} from '../model/__tests__/createSkillTestData';
import {
  BasicsSection,
  DescriptionSection,
  ImageSection,
  TagsSection
} from './FormSections';
import {
  mockButton,
  mockInput,
  mockRadioModule,
  mockSelect
} from './__tests__/uiMocks';

jest.mock('@/shared/ui/Input', () => {
  return {
    Input: (...args: Parameters<typeof mockInput>) => mockInput(...args)
  };
});

jest.mock('@/shared/ui/Select', () => {
  return {
    Select: (...args: Parameters<typeof mockSelect>) => mockSelect(...args)
  };
});

jest.mock('@/shared/ui/button/Button', () => {
  return {
    Button: (...args: Parameters<typeof mockButton>) => mockButton(...args)
  };
});

jest.mock('@/shared/ui/Radio', () => {
  let cachedRadioModule: ReturnType<typeof mockRadioModule> | null = null;

  const getRadioModule = () => {
    if (!cachedRadioModule) {
      cachedRadioModule = mockRadioModule();
    }
    return cachedRadioModule;
  };

  return {
    RadioGroup: (
      ...args: Parameters<ReturnType<typeof mockRadioModule>['RadioGroup']>
    ) => {
      const { RadioGroup } = getRadioModule();
      return RadioGroup(...args);
    },
    Radio: (
      ...args: Parameters<ReturnType<typeof mockRadioModule>['Radio']>
    ) => {
      const { Radio } = getRadioModule();
      return Radio(...args);
    }
  };
});

const ids = createSkillA11yIds;
const controls = createSkillControlIds;
const refs = {
  typeFieldRef: { current: null },
  categoryFieldRef: { current: null },
  subcategoryFieldRef: { current: null }
};

const skillGroups = CREATE_SKILL_TEST_GROUPS;
type BasicsSectionProps = ComponentProps<typeof BasicsSection>;
type DescriptionSectionProps = ComponentProps<typeof DescriptionSection>;
type ImageSectionProps = ComponentProps<typeof ImageSection>;
type TagsSectionProps = ComponentProps<typeof TagsSection>;

const createFieldBlurHandler = () => jest.fn<void, [TouchedField]>();

const createBasicsSectionProps = (
  overrides: Partial<BasicsSectionProps> = {}
): BasicsSectionProps => ({
  ids,
  controls,
  refs,
  skillGroups,
  subcategoryOptions: skillGroups[0].skills,
  isLoading: false,
  title: '',
  type: 'teach',
  categoryId: null,
  subcategoryId: null,
  onTitleChange: jest.fn(),
  onTypeChange: jest.fn(),
  onCategoryChange: jest.fn(),
  onSubcategoryChange: jest.fn(),
  onFieldBlur: createFieldBlurHandler(),
  ...overrides
});

const createDescriptionSectionProps = (
  overrides: Partial<DescriptionSectionProps> = {}
): DescriptionSectionProps => ({
  ids,
  controls,
  description: '',
  onDescriptionChange: jest.fn(),
  onDescriptionKeyDown: jest.fn(),
  onFieldBlur: createFieldBlurHandler(),
  ...overrides
});

const createImageSectionProps = (
  overrides: Partial<ImageSectionProps> = {}
): ImageSectionProps => ({
  ids,
  controls,
  imagePreviewUrl: '',
  onImageChange: jest.fn(),
  ...overrides
});

const createTagsSectionProps = (
  overrides: Partial<TagsSectionProps> = {}
): TagsSectionProps => ({
  ids,
  controls,
  tags: [],
  tagInput: '',
  isSubmitting: false,
  isTagsLimitReached: false,
  isTagAddDisabled: true,
  onTagInputChange: jest.fn(),
  onTagInputKeyDown: jest.fn(),
  onTagAdd: jest.fn(),
  onTagRemove: jest.fn(),
  onFieldBlur: createFieldBlurHandler(),
  ...overrides
});

const renderBasicsSection = (overrides: Partial<BasicsSectionProps> = {}) =>
  render(<BasicsSection {...createBasicsSectionProps(overrides)} />);

const renderDescriptionSection = (
  overrides: Partial<DescriptionSectionProps> = {}
) =>
  render(<DescriptionSection {...createDescriptionSectionProps(overrides)} />);

const renderImageSection = (overrides: Partial<ImageSectionProps> = {}) =>
  render(<ImageSection {...createImageSectionProps(overrides)} />);

const renderTagsSection = (overrides: Partial<TagsSectionProps> = {}) =>
  render(<TagsSection {...createTagsSectionProps(overrides)} />);

const getTagsInput = () =>
  screen.getByLabelText(new RegExp(CREATE_SKILL_COPY.tagsLabel, 'i'));

const getTagsAddButton = () =>
  screen.getByRole('button', { name: CREATE_SKILL_COPY.tagsAddButton });

describe('FormSections', () => {
  it('renders basics section and propagates field events', async () => {
    const user = userEvent.setup();
    const onTitleChange = jest.fn();
    const onTypeChange = jest.fn();
    const onCategoryChange = jest.fn();
    const onSubcategoryChange = jest.fn();
    const onFieldBlur = createFieldBlurHandler();

    renderBasicsSection({
      title: 'Draft skill',
      type: 'teach',
      categoryId: CREATE_SKILL_TEST_VALUES.categoryId,
      subcategoryId: CREATE_SKILL_TEST_VALUES.subcategoryId,
      titleError: 'Title error',
      typeError: 'Type error',
      categoryError: 'Category error',
      subcategoryError: 'Subcategory error',
      titleDescribedBy: ids.titleErrorId,
      typeDescribedBy: ids.typeErrorId,
      categoryDescribedBy: ids.categoryErrorId,
      subcategoryDescribedBy: ids.subcategoryErrorId,
      onTitleChange,
      onTypeChange,
      onCategoryChange,
      onSubcategoryChange,
      onFieldBlur
    });

    fireEvent.change(screen.getByLabelText(CREATE_SKILL_COPY.titleLabel), {
      target: { value: CREATE_SKILL_TEST_VALUES.title }
    });
    fireEvent.blur(screen.getByLabelText(CREATE_SKILL_COPY.titleLabel));
    await user.click(screen.getByLabelText(CREATE_SKILL_COPY.typeLearnLabel));
    await user.selectOptions(
      screen.getByLabelText(CREATE_SKILL_COPY.categoryLabel),
      CREATE_SKILL_TEST_VALUES.categoryIdString
    );
    await user.selectOptions(
      screen.getByLabelText(CREATE_SKILL_COPY.subcategoryLabel),
      CREATE_SKILL_TEST_VALUES.secondSubcategoryIdString
    );

    expect(onTitleChange).toHaveBeenCalledTimes(1);
    expect(onFieldBlur).toHaveBeenCalledWith('title');
    expect(onTypeChange).toHaveBeenCalledTimes(1);
    expect(onCategoryChange).toHaveBeenCalledWith(
      CREATE_SKILL_TEST_VALUES.categoryIdString
    );
    expect(onSubcategoryChange).toHaveBeenCalledWith(
      CREATE_SKILL_TEST_VALUES.secondSubcategoryIdString
    );
    expect(screen.getByText('Type error')).toBeInTheDocument();
    expect(screen.getByText('Category error')).toBeInTheDocument();
    expect(screen.getByText('Subcategory error')).toBeInTheDocument();
  });

  it('disables category select while base data is loading', () => {
    renderBasicsSection({
      isLoading: true,
      subcategoryOptions: []
    });

    expect(
      screen.getByLabelText(CREATE_SKILL_COPY.categoryLabel)
    ).toBeDisabled();
  });

  it('renders description section with counter and forwards handlers', () => {
    const onDescriptionChange = jest.fn();
    const onDescriptionKeyDown = jest.fn();
    const onFieldBlur = createFieldBlurHandler();

    renderDescriptionSection({
      description: 'Existing',
      descriptionError: 'Description error',
      descriptionDescribedBy: `${ids.descriptionHintId} ${ids.descriptionErrorId}`,
      onDescriptionChange,
      onDescriptionKeyDown,
      onFieldBlur
    });

    const descriptionField = screen.getByLabelText(
      CREATE_SKILL_COPY.descriptionLabel
    );
    fireEvent.change(descriptionField, { target: { value: 'Updated text' } });
    fireEvent.keyDown(descriptionField, { key: 'Enter', ctrlKey: true });
    fireEvent.blur(descriptionField);

    expect(screen.getByText('8/500')).toBeInTheDocument();
    expect(onDescriptionChange).toHaveBeenCalledTimes(1);
    expect(onDescriptionKeyDown).toHaveBeenCalledTimes(1);
    expect(onFieldBlur).toHaveBeenCalledWith('description');
    expect(screen.getByText('Description error')).toBeInTheDocument();
  });

  it('renders image section preview and handles file change', () => {
    const onImageChange = jest.fn();
    renderImageSection({
      imagePreviewUrl: 'blob:preview',
      imageError: 'Image error',
      imageDescribedBy: ids.imageErrorId,
      onImageChange
    });

    const imageInput = screen.getByLabelText(CREATE_SKILL_COPY.imageLabel);
    fireEvent.change(imageInput, {
      target: { files: [createCustomCreateSkillImageFile()] }
    });

    expect(onImageChange).toHaveBeenCalledTimes(1);
    expect(
      screen.getByAltText(CREATE_SKILL_COPY.imagePreviewAlt)
    ).toHaveAttribute('src', 'blob:preview');
    expect(screen.getByText('Image error')).toBeInTheDocument();
  });

  it('renders tags section, forwards handlers and removes tag', async () => {
    const user = userEvent.setup();
    const onTagInputChange = jest.fn();
    const onTagInputKeyDown = jest.fn();
    const onTagAdd = jest.fn();
    const onTagRemove = jest.fn();
    const onFieldBlur = createFieldBlurHandler();

    renderTagsSection({
      tags: [CREATE_SKILL_TEST_VALUES.duplicateTag],
      tagInput: 'rea',
      tagsError: 'Tag error',
      tagsDescribedBy: `${ids.tagsCounterId} ${ids.tagsErrorId}`,
      isTagAddDisabled: false,
      onTagInputChange,
      onTagInputKeyDown,
      onTagAdd,
      onTagRemove,
      onFieldBlur
    });

    const tagInput = getTagsInput();
    fireEvent.change(tagInput, {
      target: { value: `${CREATE_SKILL_TEST_VALUES.tag}js` }
    });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.blur(tagInput);
    await user.click(getTagsAddButton());
    await user.click(
      screen.getByRole('button', {
        name: getCreateSkillRemoveTagLabel(
          CREATE_SKILL_TEST_VALUES.duplicateTag
        )
      })
    );

    expect(screen.getByText('1/5')).toBeInTheDocument();
    expect(onTagInputChange).toHaveBeenCalledTimes(1);
    expect(onTagInputKeyDown).toHaveBeenCalledTimes(1);
    expect(onFieldBlur).toHaveBeenCalledWith('tags');
    expect(onTagAdd).toHaveBeenCalledTimes(1);
    expect(onTagRemove).toHaveBeenCalledWith(
      CREATE_SKILL_TEST_VALUES.duplicateTag
    );
    expect(screen.getByText('Tag error')).toBeInTheDocument();
  });

  it('shows tags limit placeholder and disables controls on limit', () => {
    renderTagsSection({
      tags: [...CREATE_SKILL_TEST_VALUES.maxTags],
      isTagsLimitReached: true,
      isTagAddDisabled: true
    });

    const tagsInput = getTagsInput();
    expect(tagsInput).toHaveAttribute(
      'placeholder',
      CREATE_SKILL_COPY.tagsLimitPlaceholder
    );
    expect(tagsInput).toBeDisabled();
    expect(getTagsAddButton()).toBeDisabled();
  });
});
