"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { sendContactMessage } from "@/app/(site)/kontakt/actions";
import { initialContactState } from "@/lib/contact/state";
import type { ContactInfo } from "@/lib/site-types";
import styles from "./ContactForm.module.css";

/*
 * Kontakt form. Validates in the browser for quick feedback; the server action validates again
 * and decides. Sending only works when the server-side delivery gate is open (`enabled`), which
 * the page reads from server environment variables. No success message is shown unless the
 * e-mail provider accepted the message. Nothing is stored.
 */

type FieldName = "name" | "email" | "subject" | "message" | "privacy";
type Field = HTMLInputElement | HTMLTextAreaElement;
const VALIDATED: FieldName[] = ["name", "email", "message", "privacy"];

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

type Props = { enabled: boolean; phone: ContactInfo["phone"] };

export function ContactForm({ enabled, phone }: Props) {
  const [state, formAction, isPending] = useActionState(sendContactMessage, initialContactState);
  const [clientErrors, setClientErrors] = useState<Partial<Record<FieldName, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  // One id per unchanged message: an unedited retry reuses it, so the provider sends only once.
  const requestIdRef = useRef<string | undefined>(undefined);

  const serverErrors = state.status === "invalid" ? state.fieldErrors : {};
  // A field the visitor has re-checked in the browser takes precedence over the last server answer.
  const errorFor = (name: FieldName) => (name in clientErrors ? clientErrors[name] : serverErrors[name]);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      requestIdRef.current = undefined;
      statusRef.current?.focus();
    } else if (state.status === "error" || state.status === "disabled") {
      statusRef.current?.focus();
    } else if (state.status === "invalid") {
      const first = VALIDATED.find((name) => state.fieldErrors[name]);
      if (first) formRef.current?.querySelector<Field>(`[name="${first}"]`)?.focus();
    }
  }, [state]);

  const validate = (field: Field) => {
    const name = field.name as FieldName;
    if (!VALIDATED.includes(name)) return;
    const message = messageFor(field);
    setClientErrors((prev) => (prev[name] === message ? prev : { ...prev, [name]: message }));
  };

  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) validate(target);
  };
  const onChange = (event: FormEvent<HTMLFormElement>) => {
    // Edited content is a new message: it must not reuse the previous idempotency key.
    requestIdRef.current = undefined;
    const target = event.target;
    if ((target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) && errorFor(target.name as FieldName)) {
      validate(target);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    // With JavaScript we submit manually so the form keeps the visitor's input if sending fails.
    event.preventDefault();
    if (!enabled || isPending) return;
    const form = event.currentTarget;
    const fields = VALIDATED.map((name) => form.elements.namedItem(name)).filter(
      (el): el is Field => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement,
    );
    setClientErrors(Object.fromEntries(fields.map((f) => [f.name, messageFor(f)])));
    const firstInvalid = fields.find((f) => !f.validity.valid);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    // Valid in the browser: drop local messages so the server's answer is what the visitor sees.
    setClientErrors({});
    requestIdRef.current ??= crypto.randomUUID();
    const data = new FormData(form);
    data.set("requestId", requestIdRef.current);
    startTransition(() => formAction(data));
  };

  const describedBy = (name: FieldName) => (errorFor(name) ? `${name}-fehler` : undefined);
  const error = (name: FieldName) =>
    errorFor(name) ? (
      <p id={`${name}-fehler`} className={styles.error} aria-live="polite">
        {errorFor(name)}
      </p>
    ) : null;

  const statusMessage =
    state.status === "success"
      ? "Vielen Dank, Ihre Nachricht wurde abgeschickt. Falls Sie keine Antwort erhalten, rufen Sie uns gern an."
      : state.status === "error" || state.status === "disabled"
        ? state.message
        : null;

  return (
    <form
      ref={formRef}
      className={styles.form}
      method="post"
      // Without JavaScript the server action still receives the form (progressive enhancement).
      action={enabled ? formAction : undefined}
      noValidate
      onBlur={onBlur}
      onChange={onChange}
      onSubmit={onSubmit}
      aria-describedby="formular-hinweis"
      aria-busy={isPending || undefined}
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
            aria-invalid={errorFor("name") ? true : undefined}
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
            aria-invalid={errorFor("email") ? true : undefined}
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
          aria-invalid={errorFor("message") ? true : undefined}
          aria-describedby={describedBy("message")}
        />
        {error("message")}
      </div>

      {/* Spam trap: hidden from people and assistive technology; bots that fill it are rejected. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="kontakt-website">Website (bitte leer lassen)</label>
        <input id="kontakt-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Wording to be confirmed together with the privacy policy (legal milestone). */}
      <div className={styles.check}>
        <input
          id="kontakt-datenschutz"
          name="privacy"
          type="checkbox"
          required
          aria-invalid={errorFor("privacy") ? true : undefined}
          aria-describedby={describedBy("privacy")}
        />
        <label htmlFor="kontakt-datenschutz">
          Ich bin einverstanden, dass meine Angaben zur Beantwortung meiner Anfrage verwendet werden. Mehr dazu im{" "}
          <Link href="/datenschutz" className="text-link">
            Datenschutzhinweis
          </Link>
          .
        </label>
        {error("privacy")}
      </div>

      <div className={styles.submitRow}>
        {enabled ? (
          <p id="formular-hinweis" className={styles.notice}>
            Ihre Nachricht wird per E-Mail an das Café gesendet und nicht auf der Website gespeichert.
          </p>
        ) : (
          <p id="formular-hinweis" className={styles.notice} role="note">
            Das Kontaktformular ist noch nicht freigeschaltet und versendet keine Nachrichten. Bitte rufen Sie uns an:{" "}
            <a href={phone.href} className="text-link">
              {phone.display}
            </a>
          </p>
        )}
        <p
          ref={statusRef}
          tabIndex={-1}
          role="status"
          className={styles.status}
          data-tone={state.status === "success" ? "success" : statusMessage ? "error" : undefined}
        >
          {statusMessage}
          {statusMessage ? (
            <>
              {" "}
              <a href={phone.href} className="text-link">
                {phone.display}
              </a>
            </>
          ) : null}
        </p>
        <button
          type="submit"
          className="button"
          disabled={!enabled || isPending}
          aria-describedby="formular-hinweis"
        >
          {isPending ? "Wird gesendet …" : "Nachricht senden"}
        </button>
      </div>
    </form>
  );
}
