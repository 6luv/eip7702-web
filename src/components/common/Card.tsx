import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export default function Card({ title, children }: Props) {
  return (
    <section className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-body">{children}</div>
    </section>
  );
}
