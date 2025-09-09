import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { MenuService } from "../lib/services/menu";
import { menuUtils } from "../lib/utils/menu";
import { Menu, MenuFormData, MenuWithSections } from "../lib/types/menu";

export function useMenu(menuId?: string) {
  const { user } = useAuth();
  const [menu, setMenu] = useState<MenuWithSections | null>(null);
  const [menuFormData, setMenuFormData] = useState<MenuFormData>(
    menuUtils.createEmptyMenu()
  );
  const [originalFormData, setOriginalFormData] = useState<MenuFormData>(
    menuUtils.createEmptyMenu()
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load menu data if menuId is provided
  useEffect(() => {
    if (menuId && user) {
      loadMenu(menuId);
    }
  }, [menuId, user]);

  const loadMenu = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const menuData = await MenuService.getMenuById(id);

      if (menuData) {
        setMenu(menuData);
        const formData = menuUtils.convertMenuToFormData(menuData);
        setMenuFormData(formData);
        setOriginalFormData(menuUtils.cloneMenuData(formData));
      } else {
        setError("Menu not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const saveMenu = async (): Promise<MenuWithSections | null> => {
    if (!user) {
      setError("User not authenticated");
      return null;
    }

    const validation = menuUtils.validateMenu(menuFormData);
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return null;
    }

    try {
      setSaving(true);
      setError(null);

      const savedMenu = await MenuService.saveCompleteMenu(
        menuFormData,
        menuId
      );

      if (savedMenu) {
        setMenu(savedMenu);
        const updatedFormData = menuUtils.convertMenuToFormData(savedMenu);
        setMenuFormData(updatedFormData);
        setOriginalFormData(menuUtils.cloneMenuData(updatedFormData));
      }

      return savedMenu;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save menu");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateMenuField = useCallback(
    (field: keyof MenuFormData, value: any) => {
      setMenuFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const addSection = useCallback(() => {
    const newSection = menuUtils.createEmptySection();
    setMenuFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  }, []);

  const updateSection = useCallback(
    (
      sectionIndex: number,
      field: keyof MenuFormData["sections"][0],
      value: any
    ) => {
      setMenuFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section, index) =>
          index === sectionIndex ? { ...section, [field]: value } : section
        ),
      }));
    },
    []
  );

  const deleteSection = useCallback((sectionIndex: number) => {
    setMenuFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex),
    }));
  }, []);

  // Add a menu item; if insertAfterIndex provided, insert after that item, otherwise append to end
  const addMenuItem = useCallback(
    (sectionIndex: number, insertAfterIndex?: number) => {
      const newItem = menuUtils.createEmptyItem();
      setMenuFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section, index) => {
          if (index !== sectionIndex) return section;
          const items = [...section.items];
          if (insertAfterIndex === -1) {
            items.unshift(newItem); // insert at start
          } else if (
            insertAfterIndex === undefined ||
            insertAfterIndex < -1 ||
            insertAfterIndex >= items.length
          ) {
            items.push(newItem); // append
          } else {
            items.splice(insertAfterIndex + 1, 0, newItem); // insert after specified index
          }
          return { ...section, items };
        }),
      }));
    },
    []
  );

  const updateMenuItem = useCallback(
    (
      sectionIndex: number,
      itemIndex: number,
      field: keyof MenuFormData["sections"][0]["items"][0],
      value: any
    ) => {
      setMenuFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section, sIndex) =>
          sIndex === sectionIndex
            ? {
                ...section,
                items: section.items.map((item, iIndex) =>
                  iIndex === itemIndex ? { ...item, [field]: value } : item
                ),
              }
            : section
        ),
      }));
    },
    []
  );

  const deleteMenuItem = useCallback(
    (sectionIndex: number, itemIndex: number) => {
      setMenuFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section, sIndex) =>
          sIndex === sectionIndex
            ? {
                ...section,
                items: section.items.filter(
                  (_, iIndex) => iIndex !== itemIndex
                ),
              }
            : section
        ),
      }));
    },
    []
  );

  const resetForm = useCallback(() => {
    if (menu) {
      const formData = menuUtils.convertMenuToFormData(menu);
      setMenuFormData(formData);
    } else {
      setMenuFormData(menuUtils.createEmptyMenu());
      setOriginalFormData(menuUtils.createEmptyMenu());
    }
    setError(null);
  }, [menu]);

  const hasUnsavedChanges = menuUtils.hasUnsavedChanges(
    originalFormData,
    menuFormData
  );
  const menuStats = menuUtils.calculateMenuStats(menuFormData);

  return {
    // Data
    menu,
    menuFormData,
    menuStats,

    // State
    loading,
    saving,
    error,
    hasUnsavedChanges,

    // Actions
    saveMenu,
    resetForm,
    loadMenu,

    // Form field updates
    updateMenuField,

    // Section management
    addSection,
    updateSection,
    deleteSection,

    // Item management
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,

    // Utilities
    clearError: () => setError(null),
  };
}

// Hook for managing user's menu list
export function useUserMenus() {
  const { user } = useAuth();
  const [menus, setMenus] = useState<(Menu & { items_count?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track menus currently being published/unpublished for UI feedback
  const [pendingPublishIds, setPendingPublishIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (user) {
      loadMenus();
    }
  }, [user]);

  const loadMenus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userMenus = await MenuService.getUserMenus();
      setMenus(userMenus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  const deleteMenu = async (menuId: string) => {
    try {
      setError(null);
      await MenuService.deleteMenu(menuId);
      setMenus((prev) => prev.filter((menu) => menu.id !== menuId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete menu");
      throw err;
    }
  };

  const togglePublishMenu = async (menuId: string, publish: boolean) => {
    // Optimistic update with rollback on failure
    const previous = menus.find((m) => m.id === menuId);
    const prevPublished = previous?.is_published;
    try {
      setError(null);
      // Mark as pending and optimistically update UI
      setPendingPublishIds((prev) => new Set(prev).add(menuId));
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === menuId ? { ...menu, is_published: publish } : menu
        )
      );

      const updatedMenu = publish
        ? await MenuService.publishMenu(menuId)
        : await MenuService.unpublishMenu(menuId);

      if (updatedMenu) {
        setMenus((prev) =>
          prev.map((menu) => (menu.id === menuId ? updatedMenu : menu))
        );
      }
    } catch (err) {
      // Rollback optimistic change
      if (prevPublished !== undefined) {
        setMenus((prev) =>
          prev.map((menu) =>
            menu.id === menuId ? { ...menu, is_published: prevPublished } : menu
          )
        );
      }
      setError(
        err instanceof Error ? err.message : "Failed to update menu status"
      );
      throw err;
    } finally {
      setPendingPublishIds((prev) => {
        const next = new Set(prev);
        next.delete(menuId);
        return next;
      });
    }
  };

  return {
    menus,
    loading,
    error,
    loadMenus,
    deleteMenu,
    togglePublishMenu,
    pendingPublishIds,
    clearError: () => setError(null),
  };
}
