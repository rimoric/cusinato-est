import { useState } from 'react';

/**
 * Hook per gestire lo stato di apertura/chiusura delle sezioni accordion
 * @param {string[]} sections - Array di ID sezioni
 * @param {string[]} defaultOpen - Array di ID sezioni aperte di default
 * @returns {Object} { openSections, toggleSection, isOpen }
 */
export const useAccordion = (sections = [], defaultOpen = []) => {
  const [openSections, setOpenSections] = useState(new Set(defaultOpen));

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const isOpen = (sectionId) => openSections.has(sectionId);

  const openAll = () => setOpenSections(new Set(sections));
  const closeAll = () => setOpenSections(new Set());

  return {
    openSections,
    toggleSection,
    isOpen,
    openAll,
    closeAll,
  };
};

export default useAccordion;
