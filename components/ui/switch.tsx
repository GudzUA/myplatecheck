"use client";

type Props = {
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
};

export function Switch({ checked, onCheckedChange }: Props) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  );
}
