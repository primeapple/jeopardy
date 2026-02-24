// @ts-check

/**
 * @import {Question} from './jeopardy-cards.component.js')
 */

const csvUpload = document.getElementById("csv-upload");
const uploadSection = document.getElementById("upload-section");
const uploadError = document.getElementById("upload-error");
const jeopardyGame = document.getElementById("jeopardy-game");

/**
 * @param {string} csvContent
 * @returns {{ questions: Question[], errors: string[] }}
 */
function parseCSV(csvContent) {
  /** @type string[] */
  const errors = [];
  /** @type Question[] */
  const questions = [];

  const lines = csvContent.trim().split("\n");

  if (lines.length === 0) {
    errors.push("CSV file is empty");
    return { questions, errors };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(";");
    const lineNum = i + 1;

    if (parts.length !== 4) {
      errors.push(
        `Line ${lineNum}: Expected 4 columns (points;category;question;answer), got ${parts.length}`,
      );
      continue;
    }

    const [pointsStr, category, question, answer] = parts;
    const points = parseInt(pointsStr, 10);

    if (isNaN(points) || points <= 0) {
      errors.push(
        `Line ${lineNum}: Points must be a positive number, got "${pointsStr}"`,
      );
      continue;
    }

    if (!category.trim()) {
      errors.push(`Line ${lineNum}: Category cannot be empty`);
      continue;
    }

    if (!question.trim()) {
      errors.push(`Line ${lineNum}: Question cannot be empty`);
      continue;
    }

    if (!answer.trim()) {
      errors.push(`Line ${lineNum}: Answer cannot be empty`);
      continue;
    }

    questions.push({
      points,
      category: category.trim(),
      question: question.trim(),
      answer: answer.trim(),
    });
  }

  if (questions.length === 0 && errors.length === 0) {
    errors.push("No valid questions found in CSV");
  }

  return { questions, errors };
}

/**
 * Validates that all categories have the exact same set of point values.
 * @param {Question[]} questions
 * @returns {string[]} Array of error messages (empty if valid)
 */
function validateCategoryPointConsistency(questions) {
  /** @type {string[]} */
  const errors = [];

  /** @type {Map<string, Set<number>>} */
  const categoryPoints = new Map();

  for (const q of questions) {
    if (!categoryPoints.has(q.category)) {
      categoryPoints.set(q.category, new Set());
    }
    const pointsSet = categoryPoints.get(q.category);
    if (pointsSet?.has(q.points)) {
      errors.push(
        `Category "${q.category}" has duplicate ${q.points}-point question`,
      );
    } else {
      pointsSet?.add(q.points);
    }
  }

  const allPoints = new Set(questions.map((q) => q.points));
  const sortedPoints = Array.from(allPoints).sort((a, b) => a - b);

  for (const [category, points] of categoryPoints) {
    const sortedCategoryPoints = Array.from(points).sort((a, b) => a - b);

    for (const p of sortedPoints) {
      if (!points.has(p)) {
        errors.push(`Category "${category}" is missing a ${p}-point question`);
      }
    }

    for (const p of sortedCategoryPoints) {
      if (!allPoints.has(p)) {
        errors.push(
          `Category "${category}" has an unexpected ${p}-point question`,
        );
      }
    }
  }

  return errors;
}

/**
 * @param {string} message
 */
function showError(message) {
  if (uploadError) {
    uploadError.textContent = message;
    uploadError.hidden = false;
  }
}

csvUpload?.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    throw Error('dialog "question-dialog" was not found');
  }
  const file = target.files?.[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result;
    if (!(typeof content === "string")) {
      throw Error("uploaded content is not a string");
    }
    const { questions, errors } = parseCSV(content);

    if (errors.length > 0) {
      showError(errors.join("\n"));
      return;
    }

    const validationErrors = validateCategoryPointConsistency(questions);
    if (validationErrors.length > 0) {
      showError(validationErrors.join("\n"));
      return;
    }

    if (jeopardyGame instanceof JeopardyCards) {
      jeopardyGame.setQuestions(questions);
      uploadSection?.toggleAttribute("hidden")
      jeopardyGame.hidden = false;
    }
  };

  reader.onerror = () => {
    showError("Failed to read the file. Please try again.");
  };

  reader.readAsText(file);
});
