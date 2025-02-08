// components/TrashItem.tsx
import React from "react";

interface TrashItemProps {
  type: "trash" | "busted";
  onClick: () => void;
}

const TrashItem: React.FC<TrashItemProps> = ({ type, onClick }) => {
  // Determine the label based on the type.
  const label = type === "trash" ? "Bag of Trash" : "Busted Trash Bag";
  // Adjust file names based on your image format.
  // For this example, we're using PNG images.
  const iconFile = type === "trash" ? "trashBag.png" : "busted.png";

  return (
    <div
      onClick={onClick}
      className="bg-gray-200 p-4 rounded-lg cursor-pointer shadow-lg hover:bg-gray-300 transition"
    >
      <img
        src={`/images/${iconFile}`}
        alt={label}
        className="h-16 w-16 mx-auto"
      />
      <p className="text-center mt-2 text-sm">{label}</p>
    </div>
  );
};

export default TrashItem;
