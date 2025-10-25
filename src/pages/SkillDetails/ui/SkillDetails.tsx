import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './skillDetails.module.scss';
import {
  loadCatalogBaseData,
  type CatalogSkill
} from '@/pages/Catalog/model/catalogData';
import type { User } from '@/entities/User/types';
import { Button } from '@/shared/ui/button/Button';
import { Tag } from '@/shared/ui/Tag/Tag';
import { Title } from '@/shared/ui/Title';
import { ROUTES } from '@/shared/constants';
import { SkillsList } from '@/widgets/SkillsList';
import GalleryIcon from '@/shared/assets/icons/actions/like.svg?react';
import ShareIcon from '@/shared/assets/icons/actions/share.svg?react';
import MoreIcon from '@/shared/assets/icons/actions/more-square.svg?react';
import stock1 from '@/shared/assets/images/stock/stock.jpg';
import stock2 from '@/shared/assets/images/stock/stock2.jpg';
import stock3 from '@/shared/assets/images/stock/stock3.jpg';
import stock4 from '@/shared/assets/images/stock/stock4.jpg';

const RELATED_AUTHORS_LIMIT = 4;

const collectAuthorSkills = (
  source: CatalogSkill[],
  authorIds: Set<number>,
) => source.filter((skill) => authorIds.has(skill.authorId));

const GALLERY_IMAGES = [stock1, stock2, stock3, stock4];

const SkillDetails = (): ReactElement => {
  const { authorId: authorIdParam } = useParams();
  const authorId = Number(authorIdParam);
  const navigate = useNavigate();

  const [skills, setSkills] = useState<CatalogSkill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = loadCatalogBaseData();
      setSkills(data.skills);
      setUsers(data.users);
    } catch (err) {
      console.error('[SkillDetails] Failed to load data', err);
      setError('Не удалось загрузить данные навыка');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedSkillId(null);
  }, [authorId]);

  const author = useMemo(
    () => users.find((user) => user.id === authorId) ?? null,
    [users, authorId]
  );

  const authorSkills = useMemo(
    () => skills.filter((skill) => skill.authorId === authorId),
    [skills, authorId]
  );

  const teachSkills = useMemo(
    () => authorSkills.filter((skill) => skill.type === 'teach'),
    [authorSkills]
  );

  const learnSkills = useMemo(
    () => authorSkills.filter((skill) => skill.type === 'learn'),
    [authorSkills]
  );

  useEffect(() => {
    if (teachSkills.length && !selectedSkillId) {
      setSelectedSkillId(teachSkills[0].id);
    }
  }, [teachSkills, selectedSkillId]);

  const selectedSkill = useMemo(
    () =>
      teachSkills.find((skill) => skill.id === selectedSkillId) ??
      teachSkills[0] ??
      null,
    [teachSkills, selectedSkillId]
  );

  const relatedSkills = useMemo(() => {
    if (!selectedSkill) return [];

    const selectedAuthors = new Set<number>();
    for (const skill of skills) {
      if (
        skill.category !== selectedSkill.category ||
        skill.type !== 'teach' ||
        skill.authorId === authorId
      ) {
        continue;
      }

      if (
        selectedAuthors.size >= RELATED_AUTHORS_LIMIT &&
        !selectedAuthors.has(skill.authorId)
      ) {
        continue;
      }

      selectedAuthors.add(skill.authorId);
    }

    if (selectedAuthors.size === 0) {
      return [];
    }

    return collectAuthorSkills(skills, selectedAuthors);
  }, [skills, selectedSkill, authorId]);

  console.log(relatedSkills);

  const handleToggleFavorite = useCallback((targetAuthorId: number) => {
    setSkills((prevSkills) => {
      const isFavorite = prevSkills.some(
        (skill) => skill.authorId === targetAuthorId && skill.isFavorite
      );

      return prevSkills.map((skill) =>
        skill.authorId === targetAuthorId
          ? { ...skill, isFavorite: !isFavorite }
          : skill
      );
    });
  }, []);

  const handleDetailsClick = useCallback(
    (targetAuthorId: number) => {
      navigate(
        ROUTES.SKILL_DETAILS.replace(':authorId', String(targetAuthorId))
      );
    },
    [navigate]
  );

  if (isLoading) {
    return <div className={styles.state}>Загрузка данных…</div>;
  }

  if (error || !author || !selectedSkill) {
    return (
      <div className={styles.stateError}>
        {error ?? 'Навык не найден или был удалён'}
      </div>
    );
  }

  const placeholderDescription =
    'Привет! Я увлекаюсь этим навыком уже больше 10 лет — от первых занятий дома до выступлений на сцене. Научу вас основам, поделюсь любимыми техниками и помогу уверенно чувствовать себя даже без подготовки.';

  const galleryImages = GALLERY_IMAGES;

  return (
    <section className={styles.skillDetails}>
      <div className={styles.hero}>
        <article className={styles.authorCard}>
          <div className={styles.authorInfo}>
            <img
              className={styles.authorAvatar}
              src={selectedSkill.imageUrl || author.avatarUrl}
              alt={author.name}
            />
            <div>
              <Title tag='h2' variant='lg'>
                {author.name}
              </Title>
              <p className={styles.authorMeta}>
                {selectedSkill.authorCity}, {selectedSkill.authorAge} лет
              </p>
            </div>
          </div>
          <p className={styles.authorBio}>
            {selectedSkill.authorAbout ?? author.bio}
          </p>

          <div className={styles.authorSkills}>
            <span>Может научить:</span>
            <div className={styles.tags}>
              {teachSkills.map((skill) => (
                <Tag key={skill.id} category={skill.category}>
                  {skill.title}
                </Tag>
              ))}
            </div>
          </div>

          <div className={styles.authorSkills}>
            <span>Хочет научиться:</span>
            <div className={styles.tags}>
              {learnSkills.map((skill) => (
                <Tag key={skill.id} category={skill.category}>
                  {skill.title}
                </Tag>
              ))}
            </div>
          </div>
        </article>

        <article className={styles.skillCard}>
          <div className={styles.skillHeader}>
            <div className={styles.actions}>
              <button type='button' aria-label='Добавить в избранное'>
                <GalleryIcon />
              </button>
              <button type='button' aria-label='Поделиться'>
                <ShareIcon />
              </button>
              <button type='button' aria-label='Дополнительные действия'>
                <MoreIcon />
              </button>
            </div>
          </div>
          <div className={styles.skillContent}>
            <div className={styles.skillInfo}>
              <Title tag='h1' variant='xl'>
                {selectedSkill.title}
              </Title>
              <p className={styles.skillCategory}>{selectedSkill.category}</p>
              <p className={styles.skillDescription}>
                {placeholderDescription}
              </p>
              <Button
                variant='primary'
                onClick={() =>
                  console.info(
                    '[SkillDetails] Propose exchange',
                    selectedSkill.id
                  )
                }
              >
                Предложить обмен
              </Button>
            </div>
            <div className={styles.gallery}>
              <img
                className={styles.galleryMain}
                src={galleryImages[0]}
                alt={selectedSkill.title}
              />
              <div className={styles.galleryThumbs}>
                {galleryImages.slice(1).map((image, index) => (
                  <img
                    key={image}
                    src={image}
                    alt={`${selectedSkill.title} ${index + 2}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className={styles.relatedSection}>
        <div className={styles.relatedHeader}>
          <Title tag='h2' variant='lg'>
            Похожие предложения
          </Title>
        </div>
        {relatedSkills.length ? (
          <SkillsList
            skills={relatedSkills}
            onToggleFavorite={handleToggleFavorite}
            onDetailsClick={handleDetailsClick}
          />
        ) : (
          <div className={styles.state}>Пока нет похожих предложений</div>
        )}
      </div>
    </section>
  );
};

export default SkillDetails;
