import React, { useEffect, useState } from 'react';

const course = {
  id: 1,
  title: 'Belajar React Dasar',
  materials: [
    { id: 101, title: 'Pengenalan React' },
    { id: 102, title: 'Component & Props' },
    { id: 103, title: 'State & Effect' },
  ],
};

const Progress = () => {
  const [completedIds, setCompletedIds] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('completedMaterials')) || [];
    setCompletedIds(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('completedMaterials', JSON.stringify(completedIds));
  }, [completedIds]);

  const toggleComplete = (id) => {
    if (completedIds.includes(id)) {
      setCompletedIds(completedIds.filter((mid) => mid !== id));
    } else {
      setCompletedIds([...completedIds, id]);
    }
  };

  const total = course.materials.length;
  const done = completedIds.filter((id) =>
    course.materials.some((mat) => mat.id === id)
  ).length;

  const percentage = Math.round((done / total) * 100);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      <p className="mb-4">Progress: {percentage}%</p>
      <div className="space-y-2">
        {course.materials.map((mat) => (
          <div
            key={mat.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <span>{mat.title}</span>
            <button
              onClick={() => toggleComplete(mat.id)}
              className={`px-3 py-1 rounded text-sm ${
                completedIds.includes(mat.id)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-black'
              }`}
            >
              {completedIds.includes(mat.id) ? 'Selesai' : 'Belum'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progress;
// 