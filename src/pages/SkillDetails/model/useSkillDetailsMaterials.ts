import { useEffect, useMemo, useState } from 'react';
import { materialsApi, type MaterialDto } from '@/shared/api/materials';
import {
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPE_ORDER
} from '@/shared/lib/materials';
import { SKILL_DETAILS_MATERIALS_LOAD_ERROR } from './constants';
import type {
  SkillDetailsMaterialGroup,
  UseSkillDetailsMaterialsParams,
  UseSkillDetailsMaterialsResult
} from './types';

export const useSkillDetailsMaterials = ({
  userSkillId
}: UseSkillDetailsMaterialsParams): UseSkillDetailsMaterialsResult => {
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  useEffect(() => {
    if (!userSkillId) {
      setMaterials([]);
      setMaterialsError(null);
      setIsMaterialsLoading(false);
      return;
    }

    let isMounted = true;
    setMaterials([]);
    setMaterialsError(null);
    setIsMaterialsLoading(true);

    const fetchMaterials = async () => {
      try {
        const response = await materialsApi.listByUserSkill(userSkillId);
        if (!isMounted) return;
        setMaterials(response.materials);
      } catch (err) {
        if (!isMounted) return;
        console.error('[SkillDetails] Failed to load materials', err);
        setMaterials([]);
        setMaterialsError(SKILL_DETAILS_MATERIALS_LOAD_ERROR);
      } finally {
        if (isMounted) {
          setIsMaterialsLoading(false);
        }
      }
    };

    fetchMaterials();

    return () => {
      isMounted = false;
    };
  }, [userSkillId]);

  const materialsByType = useMemo<SkillDetailsMaterialGroup[]>(
    () =>
      MATERIAL_TYPE_ORDER.map((type) => ({
        type,
        label: MATERIAL_TYPE_LABELS[type],
        items: materials.filter((material) => material.type === type)
      })).filter((group) => group.items.length > 0),
    [materials]
  );

  return {
    materials,
    materialsByType,
    isMaterialsLoading,
    materialsError
  };
};
