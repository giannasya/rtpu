// src/utils/progress.js
export const loadProgress = () =>
  JSON.parse(localStorage.getItem("course-progress") || "{}");

export const saveProgress = (data) =>
  localStorage.setItem("course-progress", JSON.stringify(data));

export const markMaterialDone = (courseId, materialId) => {
  const data = loadProgress();
  if (!data[courseId]) data[courseId] = { completed: [] };
  if (!data[courseId].completed.includes(materialId)) {
    data[courseId].completed.push(materialId);
    saveProgress(data);
  }
};

export const getPercentage = (courseId, totalMaterials) => {
  const data = loadProgress();
  const done = data[courseId]?.completed.length || 0;
  return Math.round((done / totalMaterials) * 100);
};
