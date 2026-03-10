import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  full?: boolean;
};

export default function Button({ children, full, ...props }: Props) {
  return (
    <button
      {...props}
      className={`btn ${full ? "btn-full" : ""} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}
