import type { ReactNode } from "react";
import styles from "./PageStub.module.css";

/**
 * Minimal, clearly marked page shell for routes that are built out in a later milestone.
 * Keeps navigation free of dead links without pretending the page is finished.
 */
export function PageStub({ title, notice, children }: { title: string; notice: string; children?: ReactNode }) {
  return (
    <div className={`container ${styles.stub}`}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.notice} role="note">
        {notice}
      </p>
      {children ? <div className={styles.body}>{children}</div> : null}
    </div>
  );
}
