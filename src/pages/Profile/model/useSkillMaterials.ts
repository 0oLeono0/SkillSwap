import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/app/providers/auth';
import {
  materialsApi,
  type CreateMaterialInput,
  type MaterialDto,
  type MaterialType,
  type UpdateMaterialPayload
} from '@/shared/api/materials';

export type SkillMaterialsState = {
  items: MaterialDto[];
  isLoading: boolean;
  error: string | null;
};

export type MaterialFormState = {
  type: MaterialType;
  title: string;
  description: string;
  content: string;
  editingMaterialId: string | null;
  isSubmitting: boolean;
  error: string | null;
};

const createEmptyMaterialForm = (): MaterialFormState => ({
  type: 'theory',
  title: '',
  description: '',
  content: '',
  editingMaterialId: null,
  isSubmitting: false,
  error: null
});

const buildCreateMaterialPayload = (
  form: MaterialFormState
): CreateMaterialInput | null => {
  const title = form.title.trim();
  if (!title) {
    return null;
  }

  const payload: CreateMaterialInput = {
    type: form.type,
    title
  };
  const description = form.description.trim();
  const content = form.content.trim();

  if (description) {
    payload.description = description;
  }
  if (content) {
    payload.content = content;
  }

  return payload;
};

const buildUpdateMaterialPayload = (
  form: MaterialFormState
): UpdateMaterialPayload | null => {
  const title = form.title.trim();
  if (!title) {
    return null;
  }

  const description = form.description.trim();
  const content = form.content.trim();

  return {
    type: form.type,
    title,
    description: description || null,
    content: content || null
  };
};

export const useSkillMaterials = (skillId: string) => {
  const { accessToken } = useAuth();
  const isMountedRef = useRef(false);
  const [materialsState, setMaterialsState] = useState<SkillMaterialsState>({
    items: [],
    isLoading: true,
    error: null
  });
  const [form, setForm] = useState<MaterialFormState>(() =>
    createEmptyMaterialForm()
  );

  const updateForm = useCallback((patch: Partial<MaterialFormState>) => {
    setForm((prev) => ({
      ...prev,
      ...patch
    }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(createEmptyMaterialForm());
  }, []);

  const loadMaterials = useCallback(async () => {
    setMaterialsState((prev) => ({
      items: prev.items,
      isLoading: true,
      error: null
    }));

    try {
      const response = await materialsApi.listByUserSkill(skillId);
      if (!isMountedRef.current) {
        return;
      }
      setMaterialsState({
        items: response.materials,
        isLoading: false,
        error: null
      });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }
      console.error('[ProfileSkillMaterials] Failed to load materials', error);
      setMaterialsState({
        items: [],
        isLoading: false,
        error: 'Не удалось загрузить материалы'
      });
    }
  }, [skillId]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    resetForm();
    void loadMaterials();
  }, [loadMaterials, resetForm]);

  const startEdit = useCallback((material: MaterialDto) => {
    setForm({
      type: material.type,
      title: material.title,
      description: material.description ?? '',
      content: material.content ?? '',
      editingMaterialId: material.id,
      isSubmitting: false,
      error: null
    });
  }, []);

  const saveMaterial = useCallback(async () => {
    const isEditingMaterial = Boolean(form.editingMaterialId);
    const payload = isEditingMaterial
      ? buildUpdateMaterialPayload(form)
      : buildCreateMaterialPayload(form);

    if (!payload) {
      updateForm({ error: 'Введите название материала' });
      return;
    }

    if (!accessToken) {
      updateForm({
        error: 'Для управления материалами нужно войти в аккаунт'
      });
      return;
    }

    updateForm({
      isSubmitting: true,
      error: null
    });

    try {
      if (form.editingMaterialId) {
        await materialsApi.update(
          accessToken,
          form.editingMaterialId,
          payload as UpdateMaterialPayload
        );
      } else {
        await materialsApi.create(
          accessToken,
          skillId,
          payload as CreateMaterialInput
        );
      }
      resetForm();
      await loadMaterials();
    } catch (error) {
      console.error('[ProfileSkillMaterials] Failed to save material', error);
      updateForm({
        isSubmitting: false,
        error: 'Не удалось сохранить материал'
      });
    }
  }, [accessToken, form, loadMaterials, resetForm, skillId, updateForm]);

  const deleteMaterial = useCallback(
    async (materialId: string) => {
      if (!accessToken) {
        updateForm({
          error: 'Для управления материалами нужно войти в аккаунт'
        });
        return;
      }

      updateForm({ error: null });

      try {
        await materialsApi.remove(accessToken, materialId);
        await loadMaterials();
      } catch (error) {
        console.error(
          '[ProfileSkillMaterials] Failed to delete material',
          error
        );
        updateForm({
          error: 'Не удалось удалить материал'
        });
      }
    },
    [accessToken, loadMaterials, updateForm]
  );

  return {
    materialsState,
    form,
    updateForm,
    resetForm,
    startEdit,
    saveMaterial,
    deleteMaterial
  };
};
