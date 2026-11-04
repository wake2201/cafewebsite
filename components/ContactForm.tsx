"use client";

import Link from "next/link";
import { useState, type FocusEvent, type FormEvent } from "react";
import { cafe } from "@/lib/cafe";
import styles from "./ContactForm.module.css";

/*
 * Contact form, presentation and validation only (Milestone 2).
 * Sending is NOT implemented: the submit button is disabled in the server-rendered HTML, the form
 * has no action, and nothing is stored. Milestone 3 connects a server action that validates again
 * on the server and sends the e-mail; field names below are the contract for that handler.
 */

type FieldName = "name" | "email" | "subject" | "message" | "privacy";
type Field = HTMLInputElement | HTMLTextAreaElement;

const SUBMISSION_ENABLED = false;

function messageFor(field: Field): string {
  const v = field.validity;
  if (v.valid) return "";
  switch (field.name as FieldName) {
    case "name":
      return "Bitte geben Sie Ihren Namen ein.";
    case "email":
      return v.valueMissing
        ? "Bitte geben Sie Ihre E-Mail-Adresse ein."
        : "Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel name@beispiel.de.";
    case "message":
      return v.valueMissing ? "Bitte schreiben Sie Ihre Nachricht." : "Bitte schreiben Sie mindestens 10 Zeichen.";
    case "privacy":
      return "Bitte bestätigen Sie den Datenschutzhinweis.";
    default:
      return "Bitte prüfen Sie dieses Feld.";
  }
}

export function ContactForm() {
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const validate = (field: Field) => {
    const name = field.name as FieldName;
    const message = messageFor(field);
    setErrors((prev) => (prev[name] === message ? prev : { ...prev, [name]: message }));
  };

  // Validate when leaving a field, then live while correcting a field that already shows an error.
  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) validate(target);
  };
  const onChange = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target;
    if ((target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) && errors[target.name as FieldName]) {
      validate(target);
    }
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Defensive: the button is disabled, but never let the browser send or put data in the URL.
    event.preventDefault();
  };

  const describedBy = (name: FieldName, hint?: string) =>
    [hint, errors[name] ? `${name}-fehler` : undefined].filter(Boolean).join(" ") || undefined;

  const error = (name: FieldName) =>
    errors[name] ? (
      <p id={`${name}-fehler`} className={styles.error} aria-live="polite">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      className={styles.form}
      method="post"
      noValidate
      onBlur={onBlur}
      onChange={onChange}
      onSubmit={onSubmit}
      aria-describedby="formular-hinweis"
    >
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="kontakt-name">Name</label>
          <input
            id="kontakt-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
          />
          {error("name")}
        </div>
        <div className={styles.field}>
          <label htmlFor="kontakt-email">E-Mail-Adresse</label>
          <input
            id="kontakt-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            required
            maxLength={200}
            placeholder="name@beispiel.de"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
          />
          {error("email")}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="kontakt-betreff">
          Betreff <span className={styles.optional}>(optional)</span>
        </label>
        <input id="kontakt-betreff" name="subject" type="text" autoComplete="off" maxLength={150} />
      </div>

      <div className={styles.field}>
        <label htmlFor="kontakt-nachricht">Nachricht</label>
        <textarea
          id="kontakt-nachricht"
          name="message"
          autoComplete="off"
          rows={6}
          required
          minLength={10}
          maxLength={2000}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message")}
        />
        {error("message")}
      </div>

      {/* Wording to be confirmed together with the privacy policy (legal milestone). */}
      <div className={styles.check}>
        <input
          id="kontakt-datenschutz"
          name="privacy"
          type="checkbox"
          required
          aria-invalid={errors.privacy ? true : undefined}
          aria-describedby={describedBy("privacy")}
        />
        <label htmlFor="kontakt-datenschutz">
          Ich bin einverstanden, dass meine Angaben zur Beantwortung meiner Anfrage verwendet werden. Mehr dazu im{" "}
          <Link href="/datenschutz">Datenschutzhinweis</Link>.
        </label>
        {error("privacy")}
      </div>

      <div className={styles.submitRow}>
        <p id="formular-hinweis" className={styles.notice} role="note">
          Das Kontaktformular wird gerade eingerichtet und versendet noch keine Nachrichten. Bitte rufen Sie uns
          bis dahin an: <a href={cafe.phone.href}>{cafe.phone.display}</a>
        </p>
        <button type="submit" className="button" disabled={!SUBMISSION_ENABLED} aria-describedby="formular-hinweis">
          Nachricht senden
        </button>
      </div>
    </form>
  );
}
