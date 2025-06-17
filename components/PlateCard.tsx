import React from 'react';

type PlateCardProps = {
  plate: string;
  province: string;
  comment: string;
  createdAt: string;
};

export const PlateCard = ({ plate, province, comment, createdAt }: PlateCardProps) => {
  return (
    <div className="border p-4 rounded shadow-md hover:bg-gray-50">
      <a href={`/plate/${province.toLowerCase()}/${plate}`}>
        <h2 className="text-xl font-semibold">{plate}</h2>
        <p className="text-gray-600 text-sm">{province} · {new Date(createdAt).toLocaleString()}</p>
        <p className="mt-2">{comment}</p>
      </a>
    </div>
  );
};
