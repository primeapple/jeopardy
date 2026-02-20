// @ts-check

/**
 * @typedef {Object} Question
 * @property {string} category
 * @property {number} points
 * @property {string} question
 * @property {string} answer
 */

/** @type {Question[]} */
const QUESTIONS = [
  {
    category: "sport",
    points: 100,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "sport",
    points: 200,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "sport",
    points: 300,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "sport",
    points: 400,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "sport",
    points: 500,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "kultur",
    points: 100,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "kultur",
    points: 200,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "kultur",
    points: 300,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "kultur",
    points: 400,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "kultur",
    points: 500,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "geschichte",
    points: 100,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "geschichte",
    points: 200,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "geschichte",
    points: 300,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "geschichte",
    points: 400,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "geschichte",
    points: 500,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "politik",
    points: 100,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "politik",
    points: 200,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "politik",
    points: 300,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "politik",
    points: 400,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "politik",
    points: 500,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "aktion",
    points: 100,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "aktion",
    points: 200,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "aktion",
    points: 300,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "aktion",
    points: 400,
    question: "Who is the greatest?",
    answer: "me",
  },
  {
    category: "aktion",
    points: 500,
    question: "Who is the greatest?",
    answer: "me",
  },
];

class JeopardyCards extends HTMLElement {
  static get observedAttributes() {
    return ["answer"];
  }

  /** @type {string[]} */
  #categories = [];
  /** @type {Question[]} */
  #questions = [];
  /** @type {Question | null} */
  #activeQuestion = null;

  get answer() {
    return this.getAttribute("answer") ?? "";
  }

  /** @returns {HTMLDialogElement} */
  get #dialog() {
    const dialog = this.shadowRoot?.getElementById("question-dialog");
    if (!(dialog instanceof HTMLDialogElement)) {
      throw Error('dialog "question-dialog" was not found');
    }
    return dialog;
  }

  /** @returns {HTMLElement} */
  get #activeCard() {
    if (!this.#activeQuestion) {
      throw Error("no active question set");
    }
    const cardId = `card-${this.#activeQuestion.category}-${this.#activeQuestion.points}`;
    const card = this.shadowRoot?.getElementById(cardId);
    if (!card) {
      throw Error(`card "${cardId}" was not found`);
    }
    return card;
  }

  constructor() {
    super();

    this.#categories = Array.from(
      new Set(QUESTIONS.map((q) => q.category)),
    ).sort((c1, c2) => c1.localeCompare(c2));
    this.#questions = QUESTIONS.sort((q1, q2) => {
      const pointDifference = q1.points - q2.points;
      if (pointDifference !== 0) {
        return pointDifference;
      }
      return q1.category.localeCompare(q2.category);
    });

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <link rel="stylesheet" href="./jeopardy-cards.style.css">
      <div id="card-container" class="card-container" role="grid">
      </div>
      <dialog id="question-dialog"></dialog>
`;
  }

  connectedCallback() {
    const container = this.shadowRoot?.getElementById("card-container");
    if (!container) {
      throw Error("container was not found");
    }
    for (const category of this.#categories) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="card category" role="columnheader">${category}</div>`,
      );
    }
    for (const q of this.#questions) {
      const button = document.createElement("button");
      button.id = `card-${q.category}-${q.points}`;
      button.classList.add("card", "choice");
      button.ariaLabel = `${q.category} for ${q.points} points`;
      button.textContent = q.points.toString();
      button.onclick = () => this.#onClickCard(q);
      container.insertAdjacentElement("beforeend", button);
    }

    // Setting up the backdrop click
    this.#dialog.addEventListener("click", (event) => {
      if (event.target !== this.#dialog) {
        return;
      }
      this.#closeDialog();
    });
  }

  /** @param {Question} question */
  #onClickCard(question) {
    this.#activeQuestion = question;

    const allCards = this.shadowRoot?.querySelectorAll(".card.choice");
    allCards?.forEach((c) => {
      if (c !== this.#activeCard) {
        c.classList.add("disabled");
      }
    });

    this.#activeCard.classList.add("spinning");
    this.#activeCard.addEventListener(
      "animationend",
      () => {
        this.#dialog.insertAdjacentHTML(
          "beforeend",
          `<p class="dialog-question">${question.question}</p>`,
        );
        this.#dialog.showModal();
        this.#activeCard.classList.remove("spinning");
        this.#activeCard.classList.add("resolved");
        allCards?.forEach((c) => c.classList.remove("disabled"));
      },
      { once: true },
    );
  }

  #closeDialog() {
    this.#dialog.close();
    this.#dialog.replaceChildren();
    this.#activeQuestion = null;
  }
}

customElements.define("jeopardy-cards", JeopardyCards);
