import {
  CREATE_SKILL_CONSTRAINTS,
  CREATE_SKILL_ERROR_MESSAGES,
  buildUpdatedSkillLists,
  composeDescriptionWithTags,
  isCreateSkillFormValid,
  normalizeTag,
  parseSelectNumberValue,
  validateTagDraft,
  validateCreateSkillForm,
  type CreateSkillFormValues
} from './form';

const createImageFile = ({
  name = 'photo.jpg',
  type = 'image/jpeg',
  size = 1024
}: {
  name?: string;
  type?: string;
  size?: number;
}) =>
  new File([new Uint8Array(size)], name, {
    type
  });

const createValidValues = (): CreateSkillFormValues => ({
  title: 'Игра на гитаре',
  description: 'Научу играть базовые аккорды и ритм.',
  type: 'teach',
  categoryId: 1,
  subcategoryId: 11,
  imageFile: createImageFile({}),
  tags: ['музыка', 'гитара']
});

describe('create skill form validation', () => {
  it('returns exact required field messages for empty payload', () => {
    const errors = validateCreateSkillForm({
      title: '',
      description: '   ',
      type: 'teach',
      categoryId: null,
      subcategoryId: null,
      imageFile: null,
      tags: []
    });

    expect(errors).toEqual({
      title: `Минимум ${CREATE_SKILL_CONSTRAINTS.titleMin} символа`,
      description: CREATE_SKILL_ERROR_MESSAGES.descriptionRequired,
      categoryId: CREATE_SKILL_ERROR_MESSAGES.categoryRequired,
      subcategoryId: CREATE_SKILL_ERROR_MESSAGES.subcategoryRequired,
      imageFile: CREATE_SKILL_ERROR_MESSAGES.imageRequired
    });
  });

  it('returns no errors for valid payload', () => {
    const errors = validateCreateSkillForm(createValidValues());
    expect(errors).toEqual({});
    expect(isCreateSkillFormValid(errors)).toBe(true);
  });

  it('accepts boundary values for title and description', () => {
    const errors = validateCreateSkillForm({
      ...createValidValues(),
      title: ''.padStart(CREATE_SKILL_CONSTRAINTS.titleMin, 'a'),
      description: ''.padStart(CREATE_SKILL_CONSTRAINTS.descriptionMax, 'x')
    });

    expect(errors).toEqual({});
  });

  it('validates title and description boundaries', () => {
    const errors = validateCreateSkillForm({
      ...createValidValues(),
      title: 'ab',
      description: ''.padStart(CREATE_SKILL_CONSTRAINTS.descriptionMax + 1, 'x')
    });

    expect(errors.title).toBe(
      `Минимум ${CREATE_SKILL_CONSTRAINTS.titleMin} символа`
    );
    expect(errors.description).toBe(
      `Максимум ${CREATE_SKILL_CONSTRAINTS.descriptionMax} символов`
    );
    expect(isCreateSkillFormValid(errors)).toBe(false);
  });

  it('validates title max boundary', () => {
    const errors = validateCreateSkillForm({
      ...createValidValues(),
      title: ''.padStart(CREATE_SKILL_CONSTRAINTS.titleMax + 1, 'a')
    });

    expect(errors.title).toBe(
      `Максимум ${CREATE_SKILL_CONSTRAINTS.titleMax} символов`
    );
  });

  it('validates invalid skill type value', () => {
    const errors = validateCreateSkillForm({
      ...createValidValues(),
      type: 'invalid' as CreateSkillFormValues['type']
    });

    expect(errors.type).toBe(CREATE_SKILL_ERROR_MESSAGES.typeRequired);
  });

  it('validates tags count', () => {
    const errors = validateCreateSkillForm({
      ...createValidValues(),
      tags: ['1', '2', '3', '4', '5', '6']
    });

    expect(errors.tags).toBe(
      `Можно добавить не больше ${CREATE_SKILL_CONSTRAINTS.maxTags} тегов`
    );
  });

  it('validates empty normalized tag', () => {
    const errors = validateCreateSkillForm({
      ...createValidValues(),
      tags: ['valid', '   #   ']
    });

    expect(errors.tags).toBe(CREATE_SKILL_ERROR_MESSAGES.tagsEmpty);
  });

  it('validates duplicated tags', () => {
    const errors = validateCreateSkillForm({
      ...createValidValues(),
      tags: ['React', '#react']
    });

    expect(errors.tags).toBe(CREATE_SKILL_ERROR_MESSAGES.tagsDuplicate);
  });

  it('validates image mime type and size', () => {
    const invalidTypeErrors = validateCreateSkillForm({
      ...createValidValues(),
      imageFile: createImageFile({ type: 'image/webp' })
    });
    expect(invalidTypeErrors.imageFile).toBe(
      CREATE_SKILL_ERROR_MESSAGES.imageInvalidType
    );

    const tooLargeErrors = validateCreateSkillForm({
      ...createValidValues(),
      imageFile: createImageFile({
        size: CREATE_SKILL_CONSTRAINTS.maxImageSizeBytes + 1
      })
    });
    expect(tooLargeErrors.imageFile).toBe(
      CREATE_SKILL_ERROR_MESSAGES.imageTooLarge
    );
  });
});

describe('create skill helpers', () => {
  it('normalizes tag text', () => {
    expect(normalizeTag('   #front   end  ')).toBe('front end');
  });

  it('builds description with unique tags', () => {
    const result = composeDescriptionWithTags('Описание', [
      'React',
      '  #react ',
      'UI'
    ]);
    expect(result).toBe('Описание\n\n#React #UI');
  });

  it('parses select values', () => {
    expect(parseSelectNumberValue('15')).toBe(15);
    expect(parseSelectNumberValue('')).toBeNull();
    expect(parseSelectNumberValue(['15'])).toBeNull();
    expect(parseSelectNumberValue('0')).toBeNull();
    expect(parseSelectNumberValue('-3')).toBeNull();
    expect(parseSelectNumberValue('1.5')).toBeNull();
    expect(parseSelectNumberValue('abc')).toBeNull();
  });

  it('validates tag draft input', () => {
    expect(validateTagDraft('   ', ['react'])).toBe(
      CREATE_SKILL_ERROR_MESSAGES.tagDraftRequired
    );
    expect(validateTagDraft('React', ['react'])).toBe(
      CREATE_SKILL_ERROR_MESSAGES.tagDraftDuplicate
    );
    expect(validateTagDraft('new', ['1', '2', '3', '4', '5'])).toContain(
      'Можно добавить не больше'
    );
    expect(validateTagDraft('TypeScript', ['react'])).toBeNull();
  });

  it('builds payload with new skill in correct list', () => {
    const payload = buildUpdatedSkillLists({
      teachableSkills: [
        {
          id: 'teach-1',
          title: 'Python',
          categoryId: 1,
          subcategoryId: 2,
          description: 'desc',
          imageUrls: []
        }
      ],
      learningSkills: [],
      type: 'learn',
      newSkill: {
        title: 'Docker',
        categoryId: 3,
        subcategoryId: 4,
        description: 'desc',
        imageUrls: ['img']
      }
    });

    expect(payload.teachableSkills).toHaveLength(1);
    expect(payload.learningSkills).toHaveLength(1);
    expect(payload.learningSkills?.[0].title).toBe('Docker');
  });
});
