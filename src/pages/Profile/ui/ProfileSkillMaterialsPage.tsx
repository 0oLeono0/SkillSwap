import { useMemo, type ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProfileSkillMaterials } from './ProfileSkillMaterials';
import styles from './profileSkillMaterials.module.scss';
import { useAuth } from '@/app/providers/auth';
import { ROUTES } from '@/shared/constants';
import { Title } from '@/shared/ui/Title';
import { Button } from '@/shared/ui/button/Button';

export function ProfileSkillMaterialsPage(): ReactElement {
  const { skillId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const skill = useMemo(
    () => user?.teachableSkills?.find((item) => item.id === skillId) ?? null,
    [skillId, user?.teachableSkills]
  );

  return (
    <section className={styles.materialsPage}>
      <div className={styles.materialsPageHeader}>
        <div>
          <Title tag='h2' variant='lg'>
            Методические материалы
          </Title>
          <p>
            Управляйте теорией, практикой и тестами для выбранного навыка
            отдельно от редактирования карточки навыка.
          </p>
        </div>
        <Button
          variant='secondary'
          onClick={() =>
            navigate(`${ROUTES.PROFILE.ROOT}/${ROUTES.PROFILE.CHILDREN.SKILLS}`)
          }
        >
          К навыкам
        </Button>
      </div>

      {!skill ? (
        <p className={styles.materialStateError}>
          Навык не найден или не принадлежит вашим навыкам для обучения.
        </p>
      ) : (
        <>
          <div className={styles.skillSummary}>
            <span>Навык</span>
            <h3>{skill.title || 'Без названия'}</h3>
            {skill.description ? <p>{skill.description}</p> : null}
          </div>
          <ProfileSkillMaterials skillId={skill.id} />
        </>
      )}
    </section>
  );
}
