import type { ReactElement } from 'react';
import styles from './MaterialsSection.module.scss';
import { Title } from '@/shared/ui/Title';
import { MaterialTestRunner } from '../MaterialTestRunner';
import type { MaterialsSectionProps } from './MaterialsSection.types';

export const MaterialsSection = ({
  isLoading,
  error,
  materialsCount,
  materialGroups
}: MaterialsSectionProps): ReactElement => (
  <div className={styles.materialsSection}>
    <Title tag='h2' variant='lg'>
      Методические материалы
    </Title>
    {isLoading ? (
      <div className={styles.state}>Загрузка материалов…</div>
    ) : error ? (
      <div className={styles.stateError}>{error}</div>
    ) : materialsCount === 0 ? (
      <div className={styles.state}>
        Материалы для этого навыка пока не добавлены
      </div>
    ) : (
      <div className={styles.materialGroups}>
        {materialGroups.map((group) => (
          <section key={group.type} className={styles.materialGroup}>
            <h3 className={styles.materialGroupTitle}>{group.label}</h3>
            <div className={styles.materialCards}>
              {group.items.map((material) => (
                <article key={material.id} className={styles.materialCard}>
                  <h4>{material.title}</h4>
                  {material.description ? (
                    <p className={styles.materialText}>
                      {material.description}
                    </p>
                  ) : null}
                  {material.content ? (
                    <p className={styles.materialContent}>{material.content}</p>
                  ) : null}
                  {material.attachments?.length ? (
                    <ul className={styles.attachmentList}>
                      {material.attachments.map((attachment) => (
                        <li key={attachment.id}>
                          <a href={attachment.url} download={attachment.name}>
                            {attachment.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {material.type === 'testing' ? (
                    <div className={styles.testQuestions}>
                      <span>Вопросов: {material.questions?.length ?? 0}</span>
                      <MaterialTestRunner material={material} />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    )}
  </div>
);
